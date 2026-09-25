import assert from "node:assert/strict";
import test from "node:test";
import { brainData } from "./test-data.js";
import { validate } from "./validate.js";

test("accepts references to relation and target born in earlier learnings", () => {
  assert.deepEqual(validate(brainData("earlier-edges")), []);
});

test("rejects missing and same-or-later knowledge", () => {
  assert.deepEqual(validate(brainData("same-learning-and-missing")), [
    "genesis/26/09/25/01/nodes/a.md: relation genesis/26/09/25/01/nodes/relation.md was not born earlier",
    "genesis/26/09/25/01/nodes/a.md: missing target genesis/26/09/25/01/nodes/missing.md",
  ]);
});

test("reports malformed frontmatter as file-prefixed errors instead of crashing", () => {
  const errors = validate(brainData("malformed"));
  assert.equal(errors.length, 2);
  assert.match(errors[0], /empty\.md: frontmatter must be a mapping/);
  assert.match(errors[1], /null-edge\.md: each edge needs string relation and to/);
});
