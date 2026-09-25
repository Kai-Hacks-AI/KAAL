import assert from "node:assert/strict";
import test from "node:test";
import { createNode } from "./create-node.js";
import { seal } from "./seal.js";
import { birth, brainData, brainTree, scratchBrain } from "./test-data.js";
import { validate } from "./validate.js";

const L1 = "genesis/26/09/25/01";
const L2 = "genesis/26/09/25/02";

test("seals every open learning oldest first, each chained to the one before", () => {
  const root = scratchBrain("earlier-edges");
  assert.deepEqual(seal(root), [L1, L2]);
  assert.deepEqual(brainTree(root), brainTree(brainData("sealed-chain")));
});

test("sealing a later push extends the chain exactly as sealing everything at once would", () => {
  const root = scratchBrain("sealed");
  createNode(birth("edge-to-earlier", root));
  assert.deepEqual(seal(root), [L2]);
  assert.deepEqual(brainTree(root), brainTree(brainData("sealed-chain")));
});

test("sealing a fully sealed BRAIN does nothing", () => {
  const root = scratchBrain("sealed-chain");
  assert.deepEqual(seal(root), []);
  assert.deepEqual(brainTree(root), brainTree(brainData("sealed-chain")));
});

test("refuses to seal a BRAIN that does not validate", () => {
  const root = scratchBrain("same-learning-and-missing");
  assert.throws(() => seal(root), /refusing to seal an invalid BRAIN/);
  assert.deepEqual(brainTree(root), brainTree(brainData("same-learning-and-missing")));
});

test("refuses birth into a sealed learning", () => {
  const root = scratchBrain("sealed");
  assert.throws(() => createNode(birth("example", root)), /learning is sealed/);
  assert.deepEqual(brainTree(root), brainTree(brainData("sealed")));
});

test("accepts intact seals", () => {
  assert.deepEqual(validate(brainData("sealed")), []);
  assert.deepEqual(validate(brainData("sealed-chain")), []);
});

test("reports nodes changed, added or removed after sealing", () => {
  assert.deepEqual(validate(brainData("sealed-node-changed")), [`${L1}/nodes/b.md: changed after ${L1} was sealed`]);
  assert.deepEqual(validate(brainData("sealed-node-added")), [`${L1}/nodes/c.md: added after ${L1} was sealed`]);
  assert.deepEqual(validate(brainData("sealed-node-removed")), [`${L1}/nodes/b.md: removed after ${L1} was sealed`]);
});

test("reports an edited seal and every seal chained after it", () => {
  assert.deepEqual(validate(brainData("sealed-seal-edited")), [
    `${L1}: seal does not match its own content`,
    `${L2}: seal does not chain to the previous seal`,
  ]);
});

test("reports a seal that is intact but chained to the wrong predecessor", () => {
  assert.deepEqual(validate(brainData("sealed-chain-broken")), [`${L2}: seal does not chain to the previous seal`]);
});

test("reports a sealed learning that follows an open one", () => {
  assert.deepEqual(validate(brainData("sealed-after-open")), [
    `${L2}: sealed after open learning ${L1}`,
    `${L2}: seal does not chain to the previous seal`,
  ]);
});
