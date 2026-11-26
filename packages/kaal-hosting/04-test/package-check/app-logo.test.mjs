import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { png } from "./app-fixtures.mjs";

// hosting/T323 (hosting/C114): the logo slot is checkable.

it("hosting/T323: checkLogo accepts a square PNG of at least 200 by 200 and names what is wrong otherwise", () => {
  assert.deepEqual(hosting.checkLogo(png(200, 200)), { ok: true, width: 200, height: 200 });
  assert.deepEqual(hosting.checkLogo(png(512, 512)), { ok: true, width: 512, height: 512 });
  assert.deepEqual(hosting.checkLogo(png(512, 256)), { ok: false, problem: "not-square", width: 512, height: 256 });
  assert.deepEqual(hosting.checkLogo(png(199, 199)), { ok: false, problem: "too-small", width: 199, height: 199 });
  assert.deepEqual(hosting.checkLogo(new Uint8Array(0)), { ok: false, problem: "empty" });
  assert.deepEqual(hosting.checkLogo(new TextEncoder().encode("<svg></svg>")), { ok: false, problem: "not-png" });
  const cut = png(300, 300).slice(0, 20);
  assert.deepEqual(hosting.checkLogo(cut), { ok: false, problem: "not-png" }, "a header cut short is not a PNG");
});
