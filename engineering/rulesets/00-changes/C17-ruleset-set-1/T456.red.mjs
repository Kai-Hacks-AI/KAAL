// Case engineering/T456 (engineering/C17): Guard is required in all five
import { test } from "node:test";
import assert from "node:assert/strict";
import { NAMES, set1, controls, contexts, GUARD } from "./helper.mjs";

test("engineering/T456 [engineering/C17]: Guard, Guard (macOS) and Guard (Windows) are required in promotion, integration, hotfixing and wiring, and publishing has an explicit OPEN row", () => {
  const s = set1();
  for (const n of NAMES.filter((x) => x !== "publishing")) for (const g of GUARD) assert.ok(contexts(s[n]).includes(g), `${n} requires ${g}`);
  assert.ok(!s.publishing.rules.some((r) => r.type === "required_status_checks"), "a tag ruleset cannot require status checks");
  assert.match(controls(), /^\| publishing \| guard \|.*\bOPEN\b/im, "Guard for tags is an open row, not dropped");
});
