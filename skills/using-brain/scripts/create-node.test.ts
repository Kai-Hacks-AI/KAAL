import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createNode } from "./create-node.js";
import { birth, expected, scratchBrain } from "./test-data.js";

test("creates an immutable markdown node with YAML mechanics and markdown meaning", () => {
  const root = scratchBrain();
  const file = createNode(birth("example", root));
  assert.equal(fs.readFileSync(file, "utf8"), expected("example"));
  assert.throws(() => createNode(birth("example-changed", root)), /already exists/);
  assert.equal(fs.readFileSync(file, "utf8"), expected("example"));
});

test("rejects traversal in lineage and slug", () => {
  const root = scratchBrain();
  assert.throws(() => createNode(birth("traversal-lineage", root)), /lineage/);
  assert.throws(() => createNode(birth("traversal-slug", root)), /slug/);
});

test("rejects an empty name", () => {
  assert.throws(() => createNode(birth("empty-name", scratchBrain())), /name is required/);
});

test("writes edges whose relation and target were born earlier", () => {
  const file = createNode(birth("edge-to-earlier", scratchBrain("relation-and-target")));
  assert.equal(fs.readFileSync(file, "utf8"), expected("edge-to-earlier"));
});

test("refuses birth when an edge's relation or target is missing or not born earlier", () => {
  const root = scratchBrain("relation-and-target");
  assert.throws(
    () => createNode(birth("edge-to-missing-in-same-learning", root)),
    (e: Error) => /missing target/.test(e.message) && /relation .* was not born earlier/.test(e.message),
  );
  assert.equal(fs.existsSync(path.join(root, "genesis/26/09/25/01/nodes/a.md")), false);
});

test("refuses birth when an edge crosses lineages, even to an earlier learning", () => {
  const root = scratchBrain("relation-and-target");
  assert.throws(
    () => createNode(birth("edge-across-lineages", root)),
    (e: Error) => /relation .* is in another lineage/.test(e.message) && /target .* is in another lineage/.test(e.message),
  );
  assert.equal(fs.existsSync(path.join(root, "other")), false);
});
