// Case engineering/T453 (engineering/C16): required checks come from the effective rules of the head branch, and every unknown is exit 2
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { load } from "./helper.mjs";

const sh = fileURLToPath(new URL("../../../github/promotion-source.sh", import.meta.url));
const lineage = fileURLToPath(new URL("../../../github/lineage.ts", import.meta.url));
const runSh = (headRef, env = {}) => spawnSync("bash", [sh, lineage], { encoding: "utf8", env: { PATH: process.env.PATH, GUARD_BASE_REF: "main", KAAL_REPO: "o/r", KAAL_DEFAULT: "main", KAAL_HEAD_REPO: "o/r", KAAL_HEAD_REF: headRef, ...env } });

test("engineering/T453 [engineering/C16]: readRequired takes the union over every ruleset that applies and fails closed; the script exits 2 without a head sha", async () => {
  const { readRequired } = await load();
  const rule = (...c) => ({ type: "required_status_checks", ruleset_id: 1, parameters: { required_status_checks: c.map((context) => ({ context, integration_id: 15368 })) } });
  const got = readRequired([{ type: "deletion" }, rule("Guard", "Engineering"), { ...rule("Guard", "WIRE"), ruleset_id: 2 }]);
  assert.deepEqual(got.map((r) => r.context).sort(), ["Engineering", "Guard", "WIRE"], "union across rulesets, de-duplicated");
  assert.deepEqual(readRequired([{ type: "deletion" }]), [], "no status-check rule: empty (which then fails the head)");
  assert.throws(() => readRequired({ message: "Not Found" }), /rules/, "an unreadable response cannot be judged");
  assert.equal(runSh("kaal/a/b").status, 2);
  assert.equal(runSh("wire/x").status, 2);
  assert.equal(runSh("hotfix/x").status, 2);
});
