import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, identify, readContribution, registerSkill } from "kaal-core";

const PAYLOAD = fileURLToPath(new URL("../payload/", import.meta.url));
const SKILL = fileURLToPath(new URL("../skills/kaal-controls/SKILL.md", import.meta.url));
const node = readFileSync(join(PAYLOAD, "Controls.md"), "utf8");
const skill = readFileSync(SKILL, "utf8");

describe("payload", () => {
  it("is one Skill, typed by Core", () => {
    assert.deepEqual(identify(readFileSync(join(PAYLOAD, "Controls.md"))).type, foundation().skill);
  });

  it("keeps objective, type, mechanism, evidence and effectiveness apart", () => {
    for (const fact of ["Objective", "Type", "Mechanism", "Evidence", "Effectiveness"]) assert.match(node, new RegExp(`^- \\*\\*${fact}\\*\\*: `, "m"));
    assert.match(node, /none is inferred from another/);
    assert.match(node, /It belongs to the capability that owns the governed behaviour/);
  });

  it("has four types as a minimal working vocabulary, not a closed taxonomy", () => {
    for (const type of ["directive", "preventive", "detective", "corrective"]) assert.match(node, new RegExp(`\\*\\*${type}\\*\\* control`));
    assert.match(node, /not claimed to exhaust established control frameworks/);
  });

  it("calibrates claims to evidence and scopes preventive claims", () => {
    assert.match(node, /An assurance claim is no stronger than the control's type, its mechanism and the evidence observed/);
    assert.match(node, /A documented control is a directive until a mechanism that realizes it has been observed/);
    assert.match(node, /A preventive claim names the action it prevents, the actor or interface it applies to, and the enforcement boundary within which it holds/);
    assert.match(node, /a gate that requires that check to pass before a particular action takes effect prevents that action/);
  });

  it("stays semantic: no registry, framework mapping, assessment or enforcement", () => {
    assert.match(node, /keeps no registry or catalogue of controls, maps to no compliance framework, assesses no system and enforces nothing/);
  });

  it("registers into a fresh Engine", () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-controls-"));
    bootstrap(dir);
    registerSkill(dir, "kaal-controls", readContribution(PAYLOAD));
    assert.deepEqual(capabilities(dir).skills.map((r) => r.name), ["Controls"]);
  });
});

describe("the Agent Skill", () => {
  it("points to the Node rather than redefining the capability", () => {
    assert.match(skill, /What Controls means is stated by the `Controls` Node in a KAAL Engine/);
  });

  it("teaches the scope of a preventive claim: action, actor or interface, boundary", () => {
    for (const part of ["the action", "the actor or interface", "the enforcement boundary"]) assert.match(skill, new RegExp(`\\*\\*${part}\\*\\*`));
  });

  it("names no particular system", () => {
    for (const text of [node, skill]) assert.doesNotMatch(text, /\b(git|github|gitlab|slack|npm|ci)\b/i);
  });
});
