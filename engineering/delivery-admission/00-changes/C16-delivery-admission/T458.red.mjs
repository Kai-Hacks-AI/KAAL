// Case engineering/T458 (engineering/C16): the kaal class is Promotion Source's rule, not a copy of it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, base } from "./helper.mjs";
import { promotionSource } from "../../../github/lineage.ts";

test("engineering/T458 [engineering/C16]: the kaal class is Promotion Source's rule, not a copy of it", async () => {
  const { admit } = await load();
  for (const headRef of ["kaal/a", "kaal/", "kaal", "kaal/a/b", "Kaal/a", "feature/kaal/a", "wire-kaal/a"]) {
    for (const headRepo of ["o/r", "fork/r"]) {
      const theirs = promotionSource({ ...base, headRepo, headRef });
      const mine = admit({ ...facts(headRef, undefined), headRepo });
      if (headRef.startsWith("kaal/") || theirs.kind === "pass") assert.equal(mine.kind === "pass", theirs.kind === "pass", `${headRepo}:${headRef}`);
    }
  }
});
