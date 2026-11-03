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
    for (const f of ["record-1-diagnostic.md", "record-2-agent-report.md", "neutral/account-A.md", "neutral/account-B.md", "neutral/account-C.md"]) assert.ok(existsSync(join(ROOT, ...TRIAL, ...f.split("/"))), f);
    // The neutral accounts carry no outcome hint and are not named for their scenario.
    for (const x of ["A", "B", "C"]) assert.doesNotMatch(readFileSync(join(ROOT, ...TRIAL, "neutral", `account-${x}.md`), "utf8"), /scenario|adequate|omission|unsupported|looks complete/i);
    const record = join(ROOT, ...TRIAL, "record.md");
    assert.ok(existsSync(record), "the trial is recorded in trial/record.md");
    const text = readFileSync(record, "utf8");
    for (const heading of ["Candidate and inputs", "Independence", "Inspection choices and tool observations", "Agent judgments", "Unresolved unknowns", "Owner decision", "Limits"]) assert.match(text, new RegExp(`^## ${heading}`, "m"), heading);
    assert.match(text, /not a (deterministic )?proof/i);
  });
});

describe("packaging/C18 the general package-engineering skill", () => {
  it("packaging/T58 [packaging/F27, packaging/A21]: the general skill is in the shared skill format, names no KAAL identifier, owner or private path before its KAAL layer, covers each practice and judgment case, and the KAAL skill points to it", () => {
    const skill = read("skills", "package-engineering", "SKILL.md");
    const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(skill);
    assert.ok(front, "the skill opens with frontmatter");
    assert.match(front[1], /^name: package-engineering$/m);
    assert.match(front[1], /^description: \S.{40,}$/m);
    const [base, layer] = skill.split("## KAAL layer");
    assert.ok(layer, "the skill ends in a KAAL layer section");
    assert.doesNotMatch(layer.trim().split("\n").slice(1).join("\n"), /^## /m, "the KAAL layer is the last section");
    // Nothing before the layer names KAAL, a KAAL identifier (owner/F7), a KAAL tool, or a private path.
    for (const bad of [/kaal/i, /\b[a-z][a-z-]*\/[A-Z]+\d+\b/, /packages\//, /node_modules\//, /\/home\//, /Hosting|Testing's|Engineering's/]) assert.doesNotMatch(base, bad, String(bad));
    for (const part of [
      /artifact, never the source directory/, /fresh consumer/, /unchanged/, /exactly/, /registry/, /manifest/, /absent/, /unreadable/, /unknown, not as a pass/,
      /once/, /presence/, /exact artifact, never a repack/, /verified, failed, unknown/,
      /If the account gives none/, /narrows its own claim/, /no installed copy/, /two obligations conflict/, /controls shows only/, /headings, links, Cases and passing tools/,
    ]) assert.match(base, part, String(part));
    assert.match(read("skills", "kaal-packaging", "SKILL.md"), /`package-engineering` skill/);
    assert.match(read("docs", "requirements.md"), /\*\*packaging\/F27\*\*/);
    assert.match(read("docs", "architecture.md"), /\*\*packaging\/A21\*\*/);
  });
  it("packaging/T59 [packaging/F27]: the independent trial of the general skill is recorded with its accounts and expectations set beforehand, and names its inputs, independence, observations, judgments, unknowns, the Owner decision and its limits", () => {
    const TRIAL = ["plan", "general", "trial"];
    for (const f of ["expected.md", "record-agent-report.md", "neutral/account-D.md", "neutral/account-E.md", "neutral/account-F.md"]) assert.ok(existsSync(join(ROOT, ...TRIAL, ...f.split("/"))), f);
    // The neutral accounts carry no outcome hint.
    for (const x of ["D", "E", "F"]) assert.doesNotMatch(read(...TRIAL, "neutral", `account-${x}.md`), /scenario|adequate|omission|unsupported|conflict|looks complete/i);
    const text = read(...TRIAL, "record.md");
    for (const heading of ["Candidate and inputs", "Independence", "Inspection choices and tool observations", "Agent judgments", "Unresolved unknowns", "Owner decision", "Limits"]) assert.match(text, new RegExp(`## ${heading}`), heading);
    assert.match(text, /not a proof/i);
    assert.match(text, /Hints\./, "the record states the hint limit");
  });
});
