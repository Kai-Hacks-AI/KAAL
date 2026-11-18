// Case engineering/T1025 (engineering/C17): an empty or unreadable registration fails
import assert from "node:assert/strict";
import { loadCheck, fixture, rules } from "./helper.mjs";
export const id = "engineering/T1025";
export const tests = ["engineering/C17"];
export const title = "a kaal-guard.json with no check, with an empty checks array or that cannot be parsed fails, whatever else it holds";
export async function run() {
  const { inventory } = await loadCheck();
  const root = fixture({
    "packages/kaal-a/kaal-guard.json": "{}", "packages/kaal-b/kaal-guard.json": '{"checks":[]}', "packages/kaal-c/kaal-guard.json": "{not json",
    "packages/kaal-d/kaal-guard.json": '{"checks":"unit"}', "packages/kaal-e/kaal-guard.json": '{"checks":[],"note":"x"}',
  });
  const found = inventory(root);
  assert.deepEqual(rules(found, "packages/kaal-a"), ["no-checks"]);
  assert.deepEqual(rules(found, "packages/kaal-b"), ["no-checks"]);
  assert.deepEqual(rules(found, "packages/kaal-c"), ["unreadable"]);
  assert.deepEqual(rules(found, "packages/kaal-d"), ["no-checks"]);
  assert.deepEqual(rules(found, "packages/kaal-e"), ["no-checks"]);
}
