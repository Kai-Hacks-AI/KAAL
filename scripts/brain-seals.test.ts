import assert from "node:assert/strict";
import test from "node:test";
import { ROOT } from "../skills/using-brain/scripts/brain.js";
import { validate } from "../skills/using-brain/scripts/validate.js";
import { brainChains, brainErrors, checkBrain, sealBrain, sealStateChanges } from "./brain-seals.js";
import { brainData, diffData, scratchBrain, tree, withSealWriteFailure } from "./test-data.js";

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
