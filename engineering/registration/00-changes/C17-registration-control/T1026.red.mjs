// Case engineering/T1026 (engineering/C17): each check declares what to run
import assert from "node:assert/strict";
import { loadCheck, fixture, reg, one } from "./helper.mjs";
export const id = "engineering/T1026";
export const tests = ["engineering/C17"];
export const title = "a check without an id, without a run command, with a blank one, or with an id used twice in the file fails and names the rule";
export async function run() {
  const { inventory } = await loadCheck();
  const root = fixture({
    "packages/kaal-a/kaal-guard.json": reg(one, { run: "node x" }), "packages/kaal-b/kaal-guard.json": reg(one, { id: "other" }),
    "packages/kaal-c/kaal-guard.json": reg({ id: "u", run: "   " }), "packages/kaal-d/kaal-guard.json": reg(one, { id: "unit", run: "node y" }),
    "packages/kaal-e/kaal-guard.json": reg({ id: "", run: "node z" }),
  });
  const found = inventory(root);
  const r = (p) => found.filter((f) => f.place === p).map((f) => f.rule);
  assert.deepEqual(r("packages/kaal-a"), ["check-without-id"]);
  assert.deepEqual(r("packages/kaal-b"), ["check-without-run"]);
  assert.deepEqual(r("packages/kaal-c"), ["check-without-run"]);
  assert.deepEqual(r("packages/kaal-d"), ["duplicate-id"]);
  assert.deepEqual(r("packages/kaal-e"), ["check-without-id"]);
}
