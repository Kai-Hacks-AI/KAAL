import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { MARKER, SCHEMA, analyse, extractRecords, validateRecord } from "../skills/kaal-review/scripts/record.mjs";

const HERE = fileURLToPath(new URL("./", import.meta.url));
const valid = () => JSON.parse(readFileSync(join(HERE, "fixtures", "record-valid.json"), "utf8"));
const errorsOf = (r) => validateRecord(r).errors;

describe("the review record (review/F0, T0)", () => {
  it("accepts a record that carries every field", () => {
    assert.deepEqual(errorsOf(valid()), []);
  });

  it("names a missing field, a wrong schema and a bad severity", () => {
    const r = valid();
    delete r.not_checked;
    assert.match(errorsOf(r).join("\n"), /not_checked/);
    assert.match(errorsOf({ ...valid(), schema: "kaal-review/9" }).join("\n"), /schema/);
    const s = valid();
    s.findings[0].severity = "urgent";
    assert.match(errorsOf(s).join("\n"), /severity/);
  });

  it("requires evidence and a location on every finding (T4)", () => {
    const r = valid();
    delete r.findings[0].evidence;
    delete r.findings[1].location;
    const e = errorsOf(r).join("\n");
    assert.match(e, /F1.*evidence/s);
    assert.match(e, /F2.*location/s);
  });

  it("lists findings at or above the floor and counts the rest (T5)", () => {
    const r = valid();
    r.findings.push({ ...r.findings[0], id: "F3", severity: "nit" });
    assert.match(errorsOf(r).join("\n"), /F3.*below the severity floor/s);
    delete r.below_floor;
    assert.match(errorsOf(r).join("\n"), /below_floor/);
  });
});

describe("no authority, no verdict (review/F3, F17, T3, T15)", () => {
  for (const field of ["approval", "approved", "merge", "verdict", "decision"]) {
    it(`refuses a record field named ${field}`, () => {
      const r = valid();
      r[field] = true;
      assert.match(errorsOf(r).join("\n"), new RegExp(field));
    });
  }
  it("refuses a request field that asks Review to approve or lowers its evidence rule", () => {
    const r = valid();
    r.request.approve = true;
    r.request.authority = "merge";
    const e = errorsOf(r).join("\n");
    assert.match(e, /request.*approve/s);
    assert.match(e, /request.*authority/s);
  });
  it("reads the invoker's dispositions and never requires Review to write them", () => {
    const r = valid();
    assert.deepEqual(errorsOf(r), []);
    r.dispositions = { F1: { decision: "fix", by: "scope holder" } };
    assert.deepEqual(errorsOf(r), []);
  });
});

describe("the self-check (review/F9, T6, T10)", () => {
  it("fails when a requested check, lens or claim is missing from it", () => {
    for (const key of ["checks", "lenses", "claims"]) {
      const r = valid();
      r.self_check[key] = [];
      assert.match(errorsOf(r).join("\n"), new RegExp(`self_check.${key}`));
    }
  });
  it("fails when a check result is stated with no record of it", () => {
    const r = valid();
    r.checks = [];
    assert.match(errorsOf(r).join("\n"), /npm test.*no record/s);
  });
  it("fails when a finding that rests on inference is not listed as such", () => {
    const r = valid();
    r.self_check.inference_only = [];
    assert.match(errorsOf(r).join("\n"), /F2.*inference/s);
  });
});

describe("findable and analysable (review/F0a, F0b, F0c, T0a, T0b)", () => {
  const body = (rec) => `Summary for a human.\n\n<!-- ${MARKER} ${SCHEMA} -->\n\n\`\`\`json\n${JSON.stringify(rec)}\n\`\`\`\n`;

  it("extracts a record from a published body by its marker, and only by it", () => {
    const found = extractRecords(body(valid()));
    assert.equal(found.length, 1);
    assert.equal(found[0].record.id, "r-0001");
    assert.deepEqual(extractRecords("a comment with ```json {\"id\": 1} ``` and no marker"), []);
  });

  it("counts findings by severity, status, round, dimension and capability, and lists failures", () => {
    const second = valid();
    second.id = "r-0002";
    second.round = 2;
    second.prior = "r-0001";
    second.findings[0].status = "fixed";
    second.checks = [{ command: "npm test", exit_status: 1, expected_status: 0, output: "1 failed" }];
    second.lenses = [{ source: "foo lens", applied: false, not_found: true }];
    second.self_check.lenses = [{ source: "foo lens", applied: false, not_found: true }];
    const items = [
      ...extractRecords(body(valid())).map((x) => ({ source: "a", ...x })),
      ...extractRecords(body(second)).map((x) => ({ source: "b", ...x })),
      { source: "c", record: { schema: "kaal-review/9", id: "r-9" } },
      { source: "d", record: { schema: SCHEMA, id: "bad" } },
    ];
    const s = analyse(items);
    assert.equal(s.records, 4);
    assert.deepEqual(s.bySeverity, { major: 2, minor: 2 });
    assert.deepEqual(s.byStatus, { open: 3, fixed: 1 });
    assert.deepEqual(s.byRound, { 1: 1, 2: 1 });
    assert.deepEqual(s.byDimension, { correctness: 2, security: 2 });
    assert.deepEqual(s.byCapability, { "kaal-foo": 2 });
    assert.deepEqual(s.failedClaims.map((c) => c.claim), ["foo/F1", "foo/F1"]);
    assert.equal(s.failedChecks.length, 1);
    assert.deepEqual(s.lensesNotFound.map((l) => l.source), ["foo lens"]);
    assert.deepEqual(s.unknownSchema.map((u) => u.source), ["c"]);
    assert.deepEqual(s.invalid.map((u) => u.source), ["d"]);
  });

  it("decides nothing: the summary has no verdict, approval or gate field", () => {
    const s = analyse([{ source: "a", record: valid() }]);
    for (const key of ["verdict", "approved", "approval", "merge", "gate", "pass", "decision"]) assert.equal(key in s, false, key);
  });
});

describe("observational convergence (review/F10)", () => {
  it("reports whether no finding at or above the floor is open, as an observation only", () => {
    const r = valid();
    r.findings.forEach((f) => (f.status = "fixed"));
    const s = analyse([{ source: "a", record: r }]);
    assert.equal(s.converged[0].observed, true);
    assert.equal("accepted" in s.converged[0], false);
  });
});

describe("the package ships no capability names (review/N1, T2)", () => {
  it("names no capability or role in the Skill or its references", () => {
    const dir = join(HERE, "..", "skills", "kaal-review");
    const files = ["SKILL.md", ...readdirSync(join(dir, "references")).map((f) => join("references", f))];
    const text = files.map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
    for (const name of ["kaal-packaging", "kaal-hosting", "kaal-testing", "kaal-graph", "kaal-change", "kaal-guard", "kaal-roles", "CPO Advisor", "CTO Advisor"]) {
      assert.equal(text.includes(name), false, `${name} appears`);
    }
  });
  it("is short, with detail one level deep (N2)", () => {
    const skill = readFileSync(join(HERE, "..", "skills", "kaal-review", "SKILL.md"), "utf8");
    assert.ok(skill.split("\n").length < 100);
  });
});
