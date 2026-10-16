// Conformance to the Agent Skills specification, on the shared fixtures in
// test/conformance/cases.mjs. Each case records what the specification
// decides and what KAAL and the reference validator, skills-ref, were
// observed to decide. This test re-observes KAAL on every run and holds the
// record to its own classification rules. skills-ref is not needed here:
// test/conformance/compare.mjs re-observes it, and writes results.md.
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { CASES, PACKAGED, SECTIONS } from "./conformance/cases.mjs";
import { kaal, materialize } from "./conformance/fixtures.mjs";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLASSES = ["specification-violation", "kaal-rule", "advisory", "reference-difference"];
const accepts = (verdict) => verdict === "ok" || verdict === "warning";

/** Whether the verdicts differ from each other or from the specification, which is when a case must be classified. */
function differs(c) {
  return c.spec === "open" || c.kaal === "warning" || accepts(c.kaal) !== (c.skillsRef === "ok") || accepts(c.kaal) !== (c.spec === "accept");
}

let observed;
before(async () => {
  observed = new Map();
  for (const { case: c, dir } of await materialize(mkdtempSync(join(tmpdir(), "kaal-conformance-")))) observed.set(c.id, await kaal(dir, c.dir ?? "my-skill"));
});

describe("the conformance record", () => {
  it("names each case once, with a specification section and well-formed verdicts", () => {
    assert.equal(new Set(CASES.map((c) => c.id)).size, CASES.length);
    for (const c of CASES) {
      assert.ok(Object.hasOwn(SECTIONS, c.section), `${c.id}: section ${c.section}`);
      assert.ok(["accept", "reject", "open"].includes(c.spec), `${c.id}: spec ${c.spec}`);
      assert.ok(["ok", "warning", "standard", "kaal", "standard+kaal"].includes(c.kaal), `${c.id}: kaal ${c.kaal}`);
      assert.ok(["ok", "fail"].includes(c.skillsRef), `${c.id}: skillsRef ${c.skillsRef}`);
      if (c.spec === "open") assert.ok(c.why, `${c.id}: an open case says why the specification does not settle it`);
    }
  });

  it("classifies exactly the cases whose verdicts differ", () => {
    for (const c of CASES) {
      assert.equal(Boolean(c.class), differs(c), `${c.id}: ${c.class ?? "unclassified"}`);
      if (c.class) assert.ok(CLASSES.includes(c.class), `${c.id}: class ${c.class}`);
    }
  });

  it("classifies a KAAL finding beyond the specification as a KAAL rule, and only that", () => {
    for (const c of CASES) assert.equal(c.class === "kaal-rule", c.kaal.includes("kaal"), c.id);
  });

  it("classifies every disagreement with a definite requirement as a violation or a KAAL rule", () => {
    for (const c of CASES) {
      const against = c.spec !== "open" && accepts(c.kaal) !== (c.spec === "accept");
      if (against) assert.ok(["specification-violation", "kaal-rule"].includes(c.class), c.id);
      if (c.class === "specification-violation") assert.ok(against, c.id);
    }
  });
});

describe("KAAL against the specification", () => {
  it("gives each fixture its recorded verdict", () => {
    for (const c of CASES) assert.equal(observed.get(c.id).verdict, c.kaal, `${c.id}: ${observed.get(c.id).messages.join("; ")}`);
  });

  it("rejects everything the specification rejects", () => {
    for (const c of CASES.filter((c) => c.spec === "reject")) assert.ok(!accepts(observed.get(c.id).verdict), c.id);
  });

  it("accepts everything the specification accepts, except by a KAAL rule or a recorded violation", () => {
    const refused = CASES.filter((c) => c.spec === "accept" && !accepts(observed.get(c.id).verdict) && !observed.get(c.id).verdict.startsWith("kaal"));
    assert.deepEqual(refused.map((c) => c.id), []);
  });

  it("passes the packaged Engineer Skill", async () => {
    assert.equal((await kaal(join(PACKAGE, PACKAGED.path), "kaal-engineer-skill")).verdict, PACKAGED.kaal);
  });
});
