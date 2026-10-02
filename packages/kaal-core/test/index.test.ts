import { test } from "node:test";
import assert from "node:assert/strict";
import { kernel, name, payload } from "../src/index.js";

test("exports the package name", () => {
  assert.equal(name, "kaal-core");
});

test("kernel identifies itself as a KAAL Kernel", () => {
  assert.deepEqual(kernel(), { kaal: "kernel" });
});

test("payload is exactly one file, kernel.json", () => {
  assert.deepEqual(Object.keys(payload()), ["kernel.json"]);
});

test("kernel.json parses back to the Kernel", () => {
  assert.deepEqual(JSON.parse(payload()["kernel.json"]), kernel());
});
