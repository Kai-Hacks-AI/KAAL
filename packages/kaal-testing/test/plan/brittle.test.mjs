// testing/C41 planned outer tests: BRITTLE, Be Right Improving Testing Targets Learned Experience.
// Immutable to DO and CHECK; testing/C42 turns them GREEN. Each title names the contracts it checks
// (plan/brittle/*.md). They read the documents the package ships and use kaal-testing/model's public
// interface. Each document check asserts required statements by their key terms, never a whole text,
// its order or its length, so the documents may be worded freely: these tests apply BRITTLE to themselves.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { current, tested } from "kaal-testing/model";

const at = (path) => new URL(`../../${path}`, import.meta.url);
const text = (path) => readFile(at(path), "utf8");
/** The body of the `## heading` section of `body`, up to the next level-two heading, or null. */
function section(body, heading) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start < 0) return null;
  const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
}
/** Asserts that `body` makes each required statement, named by `why`, matched by its key terms. */
function states(body, required, where) {
  for (const [why, terms] of Object.entries(required)) for (const t of terms) assert.match(body, t, `${where} states ${why}`);
}

describe("BRITTLE (testing/C41)", () => {
  it("testing/T84 [testing/F72, testing/F74]: the Testing Node defines BRITTLE, its expansion, false RED and false GREEN as defects of the Case, and learning through the same traces and versions", async () => {
    const node = section(await text("payload/Testing.md"), "BRITTLE");
    assert.ok(node !== null, "the Testing Node has a BRITTLE section");
    states(node, {
      "the expansion": [/Be Right Improving Testing Targets Learned Experience/],
      "false RED as rejecting what the target permits": [/false RED/, /permit/i],
      "false GREEN as accepting a real violation": [/false GREEN/, /violation/i],
      "that either is a defect of the Case, not of its subject": [/defect of the (Test )?Case/i],
      "that a lesson improves the next Case through its trace and a new version": [/lesson/i, /trac/i, /version/i],
    }, "the Node");
  });

  it("testing/T85 [testing/F73]: the Skill's BRITTLE section gives the four design checks and points to the reference, which ships", async () => {
    const skill = section(await text("skills/kaal-testing/SKILL.md"), "Designing a case: BRITTLE");
    assert.ok(skill !== null, "the Skill has a section Designing a case: BRITTLE");
    states(skill, {
      "the target's authority, outside the candidate": [/authorit/i, /outside the candidate/i],
      "equality only where the target fixes it, containment where it sets a minimum": [/\b(exact|equal|equality)\b/i, /contain/i],
      "closed vocabularies read strictly": [/closed vocabular/i, /strict/i],
      "a discriminating negative per violation and a positive per authorized extension": [/negative/i, /discriminat/i, /extension/i],
      "the reference": [/\]\(references\/brittle\.md\)/],
    }, "the Skill");
    assert.ok((await text("skills/kaal-testing/references/brittle.md")).length > 0, "the reference exists");
    assert.ok(JSON.parse(await text("package.json")).files.includes("skills"), "the Skill and its references ship");
  });

  it("testing/T86 [testing/F74, testing/F75]: the reference gives the lesson record, a correction that traces to the same target as a new version or Case, a false GREEN as a Defect that a later GREEN never erases, and Testing as verification with Review as validation; it cites no Change, pull request or other capability's identifier", async () => {
    const ref = await text("skills/kaal-testing/references/brittle.md");
    const record = [/\bcase\b/i, /\bkind\b/i, /\btarget\b/i, /froze|frozen/i, /missed/i, /correction/i];
    assert.ok(ref.split(/\r?\n\s*\r?\n/).some((block) => record.every((t) => t.test(block))), "the reference gives the lesson record in one place: its case, kind, target, what it froze or missed, and its correction");
    states(ref, {
      "both kinds": [/false RED/, /false GREEN/],
      "a correction as a new version or a new Case, on the same target": [/new version/i, /same target/i],
      "a false GREEN as a Defect a later GREEN never erases": [/Defect/, /never erase/i],
      "Testing as verification and Review as validation": [/verification/i, /\bReview\b/, /validation/i],
    }, "the reference");
    assert.doesNotMatch(ref, /#\d+|pull\/\d+|\b[a-z]+\/C\d+\b/, "the reference cites no Change or pull request");
    assert.doesNotMatch(ref, /\b(?!testing\/)[a-z]+\/[TFIAND]\d+\b/, "the reference names no other capability's identifiers");
  });

  it("testing/T87 [testing/F74, testing/N15]: through the model, a corrected Case version leaves the brittle version's Run no longer current, and a Case that tests a Defect is traced to it", () => {
    const model = (version) => ({ cases: [{ id: "acme/T21", version, tests: ["acme/F15"] }, { id: "acme/T41", version: "1", tests: ["acme/F15", "acme/D3"] }] });
    const brittleRun = { id: "r1", of: "acme/T21", provenance: { "acme/T21": "1" }, outcomes: { "acme/T21": "passed" }, data: {} };
    assert.equal(current(model("1"), [brittleRun], "acme/T21").result, "passed", "before the lesson, the brittle version's GREEN is current");
    const after = current(model("2"), [brittleRun], "acme/T21");
    assert.equal(after.result, "unknown", "after the correction, the brittle version's GREEN no longer stands");
    assert.ok(after.runs.some((r) => r.run === "r1" && r.applicable === false && r.differences.length > 0), "and its Run is disclosed as inapplicable, with its differences");
    assert.deepEqual(tested(model("2"))["acme/F15"], ["acme/T21", "acme/T41"], "the correction traces to the same target");
    assert.deepEqual(tested(model("2"))["acme/D3"], ["acme/T41"], "the Defect a false GREEN hid is traced by the Case that tests it");
  });
});
