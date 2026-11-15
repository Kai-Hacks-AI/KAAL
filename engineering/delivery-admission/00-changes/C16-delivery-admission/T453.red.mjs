// Case engineering/T453 (engineering/C16): the script gives exit 2 (cannot judge) when a hotfix or wire head has no sha to read checks at
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const sh = fileURLToPath(new URL("../../../github/promotion-source.sh", import.meta.url));
const lineage = fileURLToPath(new URL("../../../github/lineage.ts", import.meta.url));
const run = (headRef, env = {}) => spawnSync("bash", [sh, lineage], { encoding: "utf8", env: { PATH: process.env.PATH, GUARD_BASE_REF: "main", KAAL_REPO: "o/r", KAAL_DEFAULT: "main", KAAL_HEAD_REPO: "o/r", KAAL_HEAD_REF: headRef, ...env } });

test("engineering/T453 [engineering/C16]: no head sha for a hotfix or wire head is exit 2, never a pass or a plain fail", () => {
  assert.equal(run("wire/x").status, 2);
  assert.equal(run("hotfix/x").status, 2);
  assert.equal(run("kaal/a/b").status, 0, "kaal/* needs no sha");
});
