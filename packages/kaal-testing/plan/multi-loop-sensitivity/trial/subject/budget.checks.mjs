import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateBudget } from "./budget.mjs";

describe("budget-gate", () => {
  it("reports under budget when total is strictly below limit", () => {
    assert.deepEqual(evaluateBudget([{ cost: 4 }, { cost: 5 }], 10), { over: false, remaining: 1 });
  });

  it("reports over budget when total exceeds limit", () => {
    assert.deepEqual(evaluateBudget([{ cost: 6 }, { cost: 6 }], 10), { over: true, remaining: -2 });
  });
});
