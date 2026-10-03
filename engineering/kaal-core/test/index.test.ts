import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as embedding from "kaal-core";
import { KERNEL_PATH, NODE_PATHS } from "../src/kernel.js";
import { sealNode, sealedIds } from "../src/seal.js";

const stale = "Content changed. If intended, run seal-kaal-kernel.";

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(embedding), ["payload"]);
});

test("payload is the Kernel, the two Nodes and one seal marker per Node ID", () => {
  const files = embedding.payload();
  const ids = NODE_PATHS.map((path) => sealNode(files[path]));
  assert.deepEqual(Object.keys(files), [KERNEL_PATH, ...NODE_PATHS, ...ids.map((id) => `seals/${id}`)]);
  assert.ok(Object.keys(files).filter((p) => p.startsWith("seals/")).every((p) => files[p] === ""));
});

test("the sealed IDs are exactly the IDs of the Nodes' bytes", () => {
  const files = embedding.payload();
  assert.deepEqual(sealedIds(files), NODE_PATHS.map((path) => sealNode(files[path])), stale);
});

test("the Kernel is genesis, not a Node: its hash is not sealed, and matches its genesis seal", () => {
  const files = embedding.payload();
  assert.ok(!sealedIds(files).includes(sealNode(files[KERNEL_PATH])));
  const genesis = readFileSync(new URL("../../kernel.sha256", import.meta.url), "utf8").trim();
  assert.equal(sealNode(files[KERNEL_PATH]), genesis, stale);
});
