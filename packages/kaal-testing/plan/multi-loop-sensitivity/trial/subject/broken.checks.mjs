import assert from "node:assert/strict";
import { it } from "node:test";
import { loadFixture } from "./missing-fixture.mjs";

it("rejects negative item cost", () => {
  const sample = loadFixture();
  assert.throws(() => sample, RangeError);
});
