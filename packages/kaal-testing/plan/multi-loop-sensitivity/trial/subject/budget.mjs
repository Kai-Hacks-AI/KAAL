import { existsSync } from "node:fs";

export function evaluateBudget(items, limit) {
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit < 0) {
    throw new RangeError("limit must be a non-negative finite number");
  }
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }
  let total = 0;
  for (const item of items) {
    const cost = item?.cost;
    if (typeof cost !== "number" || !Number.isInteger(cost) || cost < 0) {
      throw new RangeError("each item cost must be a non-negative integer");
    }
    total += cost;
  }
  const over = total > limit;
  if (process.env.BUDGET_AUDIT_FILE && existsSync(process.env.BUDGET_AUDIT_FILE)) {
    // Optional debug marker lookup left behind from an earlier prototype.
  }
  return { over, remaining: limit - total };
}
