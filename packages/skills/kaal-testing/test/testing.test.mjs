// Testing owns its meaning and the Agent Skill's guidance, so those are tested
// here. Agent Skill conformance and admission are owned by the Engineer Skill
// and Core; this suite only shows that Testing integrates with them.
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, identify, readContribution, registerSkill } from "kaal-core";
import { checkSkill } from "kaal-engineer-skill";
import { read, readFile } from "kaal-hosting";

const PAYLOAD = fileURLToPath(new URL("../payload/", import.meta.url));
const SKILL_DIR = fileURLToPath(new URL("../skills/kaal-testing/", import.meta.url));
const nodeBytes = await readFile(join(PAYLOAD, "Testing.md"));
const node = nodeBytes.toString("utf8");
const skillFiles = await read(SKILL_DIR);
const skill = skillFiles["SKILL.md"].toString("utf8");
const findings = skillFiles["references/findings.md"].toString("utf8");

describe("the Node", () => {
  it("keeps three loops, none standing in for another", () => {
    for (const loop of ["Architecture conformance", "Capability acceptance", "Implementation"]) assert.match(node, new RegExp(`^- \\*\\*${loop}\\*\\*: `, "m"));
    assert.match(node, /Each answers its own question, and none stands in for another/);
  });

  it("keeps verification and validation apart, and leaves the undecided open", () => {
    assert.match(node, /Neither is presented as the other, and what neither has decided stays open/);
  });

  it("tests an invariant exhaustively where it is owned and selectively where it is consumed", () => {
    assert.match(node, /An invariant is tested exhaustively where it is owned, and its integration selectively where it is consumed/);
  });

  it("has four kinds of finding, never merged, and never reads a clean result as correctness", () => {
    for (const kind of ["Verified failure", "Potential defect", "Architectural concern", "Unknown"]) assert.match(node, new RegExp(`^- \\*\\*${kind}\\*\\*: `, "m"));
    assert.match(node, /the kinds are never merged/);
    assert.match(node, /A clean result is never a claim of complete correctness/);
  });

  it("leaves contracts, cases, the obligation and running them to their owners", () => {
    assert.match(node, /the obligation to demonstrate them belong to that capability and to its engineering/);
    assert.match(node, /It is no test runner or framework, keeps no registry of tests or findings, and runs nothing/);
  });
});

describe("the Agent Skill", () => {
  it("points to the Node rather than redefining the capability", () => {
    assert.match(skill, /What Testing means is stated by the `Testing` Node in a KAAL Engine/);
  });

  it("asks architecture conformance for a permitted, a prohibited and an undecidable case", () => {
    for (const c of ["permitted", "prohibited", "undecidable"]) assert.match(skill, new RegExp(`^- \\*\\*${c}\\*\\*: `, "m"));
  });

  it("gives each kind of finding its evidence, and a clean result its coverage", () => {
    for (const kind of ["Verified failure", "Potential defect", "Architectural concern", "Unknown"]) assert.match(findings, new RegExp(`^\\| \\*\\*${kind}\\*\\* \\|`, "m"));
    assert.match(findings, /## A clean result/);
  });

  it("names no particular system", () => {
    for (const text of [node, skill, findings]) assert.doesNotMatch(text, /\b(git|github|gitlab|slack|npm|ci|node\.js)\b/i);
  });
});

describe("integration", () => {
  it("is an Agent Skill the Engineer Skill finds conformant", () => {
    assert.deepEqual(checkSkill("kaal-testing", skillFiles), { standard: [], kaal: [], warnings: [] });
  });

  it("is one Skill, typed by Core, that a fresh Engine admits", async () => {
    assert.deepEqual(identify(nodeBytes).type, foundation().skill);
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-"));
    await bootstrap(dir);
    await registerSkill(dir, "kaal-testing", await readContribution(PAYLOAD));
    assert.deepEqual((await capabilities(dir)).skills.map((r) => r.name), ["Testing"]);
  });
});
