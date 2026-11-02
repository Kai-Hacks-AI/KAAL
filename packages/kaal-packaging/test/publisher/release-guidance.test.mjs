// Packaging's guidance cases (packaging/C13, docs/testing.md): the boundary-assurance guidance is
// delivered in the six documents, the skill and the README, and the independent trial that
// packaging/T51 and packaging/T52 require is recorded with its scenarios and expectations set
// beforehand. These cases need the source workspace and do not ship. They check that the guidance
// and the record are present and well formed. They do not judge semantic adequacy: that is the
// trial's, made by an agent (packaging/F25).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { ROOT } from "./manifest.mjs";

const read = (...p) => readFileSync(join(ROOT, ...p), "utf8");
const TRIAL = ["plan", "release-0.0.1", "trial"];

describe("packaging/C13 boundary assurance guidance and its independent trial", () => {
  it("packaging/T51 [packaging/F25]: the six documents, the skill and the README deliver F25, and the skill's procedure keeps observations, judgments, unknowns and Owner authorization apart and rejects structure alone", () => {
    assert.match(read("docs", "requirements.md"), /\*\*packaging\/F25\*\*/);
    assert.match(read("docs", "architecture.md"), /\*\*packaging\/A19\*\*/);
    assert.match(read("docs", "operations.md"), /## Assess a package's boundaries/);
    assert.match(read("docs", "limitations.md"), /judged, not proven/);
    assert.match(read("docs", "testing.md"), /\| packaging\/T51 \|/);
    const skill = read("skills", "kaal-packaging", "SKILL.md");
    const section = /## Assess a package's boundaries([\s\S]*?)\n## /.exec(skill)?.[1];
    assert.ok(section, "the skill has the boundary-assurance section");
    for (const part of [/what the scripts observed/, /what you judged and why/, /what stays unknown/, /only the Owner can/, /headings, links, Cases and passing scripts/, /refusal/, /never a proof/]) assert.match(section, part);
    assert.match(read("README.md"), /packaging\/F25/);
    assert.match(read("..", "..", "AGENTS.md"), /Assess a package's boundaries/);
  });

  it("packaging/T52 [packaging/F17]: the trial's three scenarios and expected distinctions exist, and the recorded trial names its inputs, independence, observations, judgments, unknowns and the Owner decision, and says it is not proof", () => {
    for (const f of ["scenario-1-adequate.md", "scenario-2-omission.md", "scenario-3-unsupported.md", "expected.md"]) assert.ok(existsSync(join(ROOT, ...TRIAL, f)), f);
    const record = join(ROOT, ...TRIAL, "record.md");
    assert.ok(existsSync(record), "the trial is recorded in trial/record.md");
    const text = readFileSync(record, "utf8");
    for (const heading of ["Candidate and inputs", "Independence", "Inspection choices and tool observations", "Agent judgments", "Unresolved unknowns", "Owner decision", "Limits"]) assert.match(text, new RegExp(`^## ${heading}`, "m"), heading);
    assert.match(text, /not a (deterministic )?proof/i);
  });
});
