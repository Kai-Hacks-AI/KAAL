# budget-gate Specification

## Intent

- **BG-I1**: Prevent accidental overspend by checking itemized integer costs against a numeric budget limit before an action proceeds.

## Requirements

- **BG-R1** [BG-I1]: `evaluateBudget(items, limit)` sums each item's `cost` (non-negative integer) and returns `{ over: boolean, remaining: number }`, where `over` is `total > limit` (exact equality `total === limit` is within budget: `over: false, remaining: 0`) and `remaining` is `limit - total`.
- **BG-R2** [BG-I1]: Any item with negative, non-integer, or non-finite `cost`, or a negative or non-finite `limit`, throws a `RangeError`.
- **BG-R3** [BG-I1]: Large batches should complete promptly.
- **BG-R4** [BG-I1]: Error messages should be clear and helpful to operators.

## Architecture

- **BG-A1** [BG-I1]: `budget.mjs` is pure domain logic with no host filesystem or subprocess access (it must not import `node:fs` or `node:child_process`).
