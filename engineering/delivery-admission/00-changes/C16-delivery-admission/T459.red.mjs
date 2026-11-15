// Case engineering/T459 (engineering/C16): the Guard declaration trusts admission.mjs from the base revision.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

test("engineering/T459 [engineering/C16]: the Guard declaration trusts admission.mjs from the base revision", () => {
  const text = readFileSync(fileURLToPath(new URL("../../../../.kaal/config/guard/Delivery-Admission.md", import.meta.url)), "utf8");
  assert.match(text, /^type: Guard\/Check$/m);
  assert.match(text, /^trusted: engineering\/delivery-admission\/admission\.mjs$/m);
  assert.match(text, /^facts: \[.*base-ref.*\]$/m);
});
