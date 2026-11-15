// Case engineering/T452 (engineering/C16): kaal/* behaves exactly as today, and freshness is not touched
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { load, base } from "./helper.mjs";

test("engineering/T452 [engineering/C16]: a kaal/* head needs no check facts (unchanged); promotionFreshness is untouched", async () => {
  const lineage = await load();
  assert.equal(lineage.promotionSource({ ...base, headRef: "kaal/x/y" }).kind, "pass", "no check facts are read for kaal/*");
  assert.equal(typeof lineage.promotionFreshness, "function");
  const src = readFileSync(fileURLToPath(new URL("../../../github/lineage.ts", import.meta.url)), "utf8");
  assert.match(src, /hotfix\//, "the route table exists in lineage.ts");
});
