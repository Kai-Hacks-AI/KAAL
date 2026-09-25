import assert from "node:assert/strict";
import test from "node:test";
import { ROOT } from "../skills/using-brain/scripts/brain.js";
import { validate } from "../skills/using-brain/scripts/validate.js";
import {
  brainChains,
  brainErrors,
  checkBrain,
  sealBrain,
  sealingOutputErrors,
  sealState,
  sealStateChanges,
} from "./brain-seals.js";
import { brainData, diffData, scratchBrain, sealingDiff, tree, withSealWriteFailure } from "./test-data.js";

test("one chain per lineage, named after it, with its learnings oldest first", () => {
  assert.deepEqual(
    brainChains(brainData("lineages")),
    new Map([
      ["genesis", ["genesis/26/09/25/01", "genesis/26/09/26/01"]],
      ["other", ["other/26/09/25/01"]],
    ]),
  );
});

test("seals every learning of every lineage", () => {
  const root = scratchBrain("lineages");
  assert.deepEqual(sealBrain(root), ["genesis/26/09/25/01", "genesis/26/09/26/01", "other/26/09/25/01"]);
  assert.deepEqual(tree(root), tree(brainData("sealed")));
  assert.deepEqual(checkBrain(root), []);
});

test("sealing again seals only new learnings, exactly as sealing everything at once would", () => {
  const root = scratchBrain("sealed-new-learning");
  assert.deepEqual(checkBrain(root), []);
  assert.deepEqual(sealBrain(root), ["genesis/26/09/27/01"]);
  assert.deepEqual(tree(root), tree(brainData("sealed-extended")));
  assert.deepEqual(sealBrain(root), []);
});

test("seals leave BRAIN valid", () => {
  assert.deepEqual(validate(brainData("sealed")), []);
});

test("refuses to seal an invalid BRAIN, closing nothing", () => {
  const root = scratchBrain("invalid-learning");
  assert.throws(
    () => sealBrain(root),
    /refusing to seal BRAIN:\ngenesis\/26\/09\/26\/01\/nodes\/e\.md: missing relation/,
  );
  assert.deepEqual(tree(root), tree(brainData("invalid-learning")));
});

test("refuses to seal any lineage while another lineage's seals are broken, closing nothing", () => {
  const root = scratchBrain("new-learning-other-broken");
  assert.throws(
    () => sealBrain(root),
    /refusing to seal BRAIN:\nother\/26\/09\/25\/01\/nodes\/c\.md: changed after sealing/,
  );
  assert.deepEqual(tree(root), tree(brainData("new-learning-other-broken")));
});

test("rolls back every lineage when a later lineage fails while sealing, closing nothing", () => {
  const root = scratchBrain("lineages");
  assert.throws(() => withSealWriteFailure("other/26/09/25/01", () => sealBrain(root)), /simulated write failure/);
  assert.deepEqual(tree(root), tree(brainData("lineages")));
  assert.deepEqual(sealBrain(root), ["genesis/26/09/25/01", "genesis/26/09/26/01", "other/26/09/25/01"]);
});

test("restores the chain heads when a later lineage fails after an earlier one sealed on top of them", () => {
  const root = scratchBrain("new-learnings-in-both");
  assert.throws(() => withSealWriteFailure("other/26/09/26/01", () => sealBrain(root)), /simulated write failure/);
  assert.deepEqual(tree(root), tree(brainData("new-learnings-in-both")));
});

test("reports what stops a BRAIN from being sealed: invalid nodes and broken seals", () => {
  assert.deepEqual(brainErrors(brainData("invalid-learning")), [
    "genesis/26/09/26/01/nodes/e.md: missing relation genesis/26/09/25/01/nodes/missing.md",
  ]);
  assert.deepEqual(brainErrors(brainData("sealed")), []);
});

test("reports a node changed in a sealed learning", () => {
  assert.deepEqual(checkBrain(brainData("sealed-node-changed")), [
    "genesis/26/09/25/01/nodes/a.md: changed after sealing",
  ]);
});

test("reports a sealed lineage removed with its learnings", () => {
  assert.deepEqual(checkBrain(brainData("sealed-lineage-removed")), [
    "other: head records units other/26/09/25/01, which do not begin the chain",
  ]);
});

test("the committed BRAIN is valid and its seals are intact", () => {
  assert.deepEqual(brainErrors(ROOT), []);
});

test("allows a change that only adds learnings or touches files outside BRAIN", () => {
  assert.deepEqual(sealStateChanges(diffData("new-learning")), []);
  assert.deepEqual(sealStateChanges(diffData("outside-brain")), []);
});

test("refuses a change that adds, modifies or deletes seal state", () => {
  const refused = (file: string, status: string) => [
    `${file}: seal state may only be written by sealing on main (${status})`,
  ];
  assert.deepEqual(
    sealStateChanges(diffData("seal-added")),
    refused("brain/learning/genesis/26/09/26/01/seal.json", "A"),
  );
  assert.deepEqual(
    sealStateChanges(diffData("seal-modified")),
    refused("brain/learning/genesis/26/09/25/01/seal.json", "M"),
  );
  assert.deepEqual(
    sealStateChanges(diffData("seal-deleted")),
    refused("brain/learning/genesis/26/09/25/01/seal.json", "D"),
  );
  assert.deepEqual(sealStateChanges(diffData("heads-modified")), refused("brain/learning/seals.json", "M"));
  assert.deepEqual(sealStateChanges(diffData("heads-deleted")), refused("brain/learning/seals.json", "D"));
  assert.deepEqual(sealStateChanges(diffData("lock-added")), refused("brain/learning/seals.json.lock", "A"));
});

test("classifies seal state: each learning's seal, the chain heads and the lock, only under the BRAIN root", () => {
  assert.equal(sealState("brain/learning/genesis/26/09/25/01/seal.json"), "unit-seal");
  assert.equal(sealState("brain/learning/seals.json"), "heads");
  assert.equal(sealState("brain/learning/seals.json.lock"), "lock");
  assert.equal(sealState("brain/learning/genesis/26/09/25/01/nodes/seal.json"), "misplaced-seal");
  assert.equal(sealState("brain/learning/seal.json"), "misplaced-seal");
  assert.equal(sealState("brain/learning/genesis/26/09/25/01/nodes/a.md"), undefined);
  assert.equal(sealState("brain/learning/stray.txt"), undefined);
  assert.equal(sealState("brain/AGENTS.md"), undefined);
  assert.equal(sealState("skills/using-seals/test-data/chains/sealed/one/seal.json"), undefined);
});

test("the guard also refuses a seal file placed anywhere else under the BRAIN root", () => {
  assert.deepEqual(sealStateChanges(diffData("misplaced-seal")), [
    "brain/learning/genesis/26/09/25/01/nodes/seal.json: seal state may only be written by sealing on main (A)",
  ]);
  assert.deepEqual(sealStateChanges(diffData("stray-in-brain")), []);
});

test("accepts exactly what sealing produces: a first sealing, and sealing on top of existing seals", () => {
  for (const [from, to] of [
    ["lineages", "sealed"],
    ["sealed-new-learning", "sealed-extended"],
  ]) {
    const diff = sealingDiff(from, to);
    assert.ok(diff.length, `${from} -> ${to} changes seal state`);
    assert.deepEqual(sealingOutputErrors(diff), [], `${from} -> ${to}`);
  }
});

test("refuses to commit anything sealing does not produce", () => {
  const refused = (file: string, what: string) => [`${file}: sealing never commits this (${what})`];
  assert.deepEqual(
    sealingOutputErrors(diffData("new-learning")),
    refused("brain/learning/genesis/26/09/26/01/nodes/b.md", "not seal state"),
  );
  assert.deepEqual(
    sealingOutputErrors(diffData("stray-in-brain")),
    refused("brain/learning/stray.txt", "not seal state"),
  );
  assert.deepEqual(
    sealingOutputErrors(diffData("outside-brain")),
    refused("skills/using-seals/test-data/chains/sealed/one/seal.json", "not seal state"),
  );
  assert.deepEqual(
    sealingOutputErrors(diffData("sealing-with-node")),
    refused("brain/learning/genesis/26/09/25/01/nodes/b.md", "not seal state"),
  );
  assert.deepEqual(
    sealingOutputErrors(diffData("misplaced-seal")),
    refused("brain/learning/genesis/26/09/25/01/nodes/seal.json", "misplaced-seal added"),
  );
  assert.deepEqual(
    sealingOutputErrors(diffData("seal-modified")),
    refused("brain/learning/genesis/26/09/25/01/seal.json", "unit-seal modified"),
  );
  assert.deepEqual(
    sealingOutputErrors(diffData("seal-deleted")),
    refused("brain/learning/genesis/26/09/25/01/seal.json", "unit-seal deleted"),
  );
  assert.deepEqual(
    sealingOutputErrors(diffData("heads-deleted")),
    refused("brain/learning/seals.json", "heads deleted"),
  );
  assert.deepEqual(
    sealingOutputErrors(diffData("lock-added")),
    refused("brain/learning/seals.json.lock", "lock added"),
  );
});
