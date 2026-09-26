import assert from "node:assert/strict";
import test from "node:test";
import { add } from "../src/add.js";
import { greet } from "../src/greet.js";

// Why: src/add.ts
test("adds", () => {
  assert.equal(add(1, 2), 3);
});

// Why: brain/learning/k/26/01/01/01/nodes/greeting.md
test("greets", () => {
  assert.equal(greet("x"), "hello x");
});
