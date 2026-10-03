import { test } from "node:test";
import assert from "node:assert/strict";
import * as embedding from "kaal-core";
import { KERNEL_PATH, NODE_PATHS, checkBootstrap, sealedIds } from "../helpers/bootstrap.js";
import { checkBytes } from "../helpers/seal.js";
import { sealNode } from "../src/seal.js";

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(embedding), ["payload"]);
});

test("payload is the Kernel, the two Nodes and one seal marker per Node ID", () => {
  const files = embedding.payload();
  const ids = NODE_PATHS.map((path) => sealNode(files[path]));
  assert.deepEqual(Object.keys(files), [KERNEL_PATH, ...NODE_PATHS, ...ids.map((id) => `seals/${id}`)]);
  assert.ok(sealedIds(files).every((id) => files[`seals/${id}`] === ""));
});

test("the recorded seals match the exact bytes of the Kernel and the Nodes", () => {
  assert.deepEqual(checkBootstrap(), [], "Content changed. If intended, run npm run seal-kaal-bootstrap.");
});

test("a seal fails on any change to the exact bytes", () => {
  const files = embedding.payload();
  assert.equal(checkBytes(files[KERNEL_PATH], sealNode(files[KERNEL_PATH])), undefined);
  assert.match(checkBytes(files[KERNEL_PATH] + " ", sealNode(files[KERNEL_PATH])) ?? "", /does not match its seal/);
});
