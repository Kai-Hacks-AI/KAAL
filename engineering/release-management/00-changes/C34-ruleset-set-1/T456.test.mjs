// Case release/T456 (release/C34): Guard is required in all five
import assert from "node:assert/strict";
import { NAMES, set1, controls, contexts, GUARD } from "./helper.mjs";


export const id = "release/T456";
export const tests = ["release/C34"];
export const title = 'Guard, Guard (macOS) and Guard (Windows) are required in promotion, integration, hotfixing and wiring, and publishing has an explicit OPEN row';
export async function run() {
  const s = set1();
  for (const n of NAMES.filter((x) => x !== "publishing")) for (const g of GUARD) assert.ok(contexts(s[n]).includes(g), `${n} requires ${g}`);
  assert.ok(!s.publishing.rules.some((r) => r.type === "required_status_checks"), "a tag ruleset cannot require status checks");
  assert.match(controls(), /^\| publishing \| guard \|.*\bOPEN\b/im, "Guard for tags is an open row, not dropped");
}
