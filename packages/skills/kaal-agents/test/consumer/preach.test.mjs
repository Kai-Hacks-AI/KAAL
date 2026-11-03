// Consumer cases of `kaal-agents preach check` (PREACH): structure only, never meaning or authority.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { agents, output, tmp } from "./fixture.mjs";

const CANDIDATES = [
  { term: "Case", scope: "testing", owner: "Testing", definition: "testing/Case" },
  { term: "Case", scope: "requirements", owner: "Requirements", definition: "requirements/Case" },
];

const UNRESOLVED = {
  finding: { reported: "a term shared by two scopes" },
  reportedBy: "kaal-core",
  candidates: CANDIDATES,
  resolution: { status: "unresolved", consult: "the Owner", question: "Do these share one meaning?" },
};

const RESOLVED = { ...UNRESOLVED, resolution: { status: "resolved", chosen: { scope: "testing", term: "Case" }, authority: "AGENTS.md" } };

function preach(report) {
  const dir = tmp();
  const file = join(dir, "report.json");
  writeFileSync(file, typeof report === "string" ? report : JSON.stringify(report));
  return agents(dir, "preach", "check", file);
}

describe("preach check", () => {
  it("agents/T8 [agents/F4, agents/A4, agents/I3]: a valid unresolved report and a valid claimed resolution each exit 0 with their one line, which says structurally valid, and the claimed one says the authority is not verified; two candidates sharing a term in different scopes stay distinct", () => {
    const u = preach(UNRESOLVED);
    assert.equal(u.status, 0, output(u));
    assert.equal(u.stdout.trim(), "PREACH report structurally valid: unresolved, consult the Owner: Do these share one meaning?");
    const r = preach(RESOLVED);
    assert.equal(r.status, 0, output(r));
    assert.equal(r.stdout.trim(), "PREACH report structurally valid: resolution claimed under AGENTS.md: testing/Case (authority not verified)");
  });

  it("agents/T9 [agents/F4, agents/N3]: each invalid report exits 1, naming its problem; non-JSON and a missing file exit 2", () => {
    const invalid = [
      [{ ...UNRESOLVED, candidates: [] }, /candidates/],
      [{ ...UNRESOLVED, candidates: [{ term: "Case", owner: "Testing", definition: "testing/Case" }] }, /scope/],
      [{ ...UNRESOLVED, candidates: [CANDIDATES[0], CANDIDATES[0]] }, /duplicate/],
      [{ ...RESOLVED, resolution: { status: "resolved", chosen: { scope: "testing", term: "Case" } } }, /authority/],
      [{ ...RESOLVED, resolution: { status: "resolved", chosen: { scope: "product", term: "Case" }, authority: "AGENTS.md" } }, /not among the candidates/],
      [{ ...UNRESOLVED, extra: true }, /unknown member.*extra/],
    ];
    for (const [report, problem] of invalid) {
      const r = preach(report);
      assert.equal(r.status, 1, `${JSON.stringify(report)}\n${output(r)}`);
      assert.match(output(r), problem);
    }
    assert.equal(preach("not json").status, 2);
    const missing = agents(tmp(), "preach", "check", join(tmp(), "missing.json"));
    assert.equal(missing.status, 2, output(missing));
    assert.doesNotMatch(output(missing), /\n\s+at /);
  });

  it("agents/T18 [agents/F4, agents/I3]: an ambiguous choice, without a scope while two candidates share the term, and an empty authority are each invalid, naming the problem", () => {
    const ambiguous = preach({ ...RESOLVED, resolution: { status: "resolved", chosen: { term: "Case" }, authority: "AGENTS.md" } });
    assert.equal(ambiguous.status, 1, output(ambiguous));
    assert.match(output(ambiguous), /ambiguous/);
    const empty = preach({ ...RESOLVED, resolution: { ...RESOLVED.resolution, authority: "" } });
    assert.equal(empty.status, 1, output(empty));
    assert.match(output(empty), /authority/);
  });
});
