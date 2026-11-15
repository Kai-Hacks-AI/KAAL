// Case engineering/T453 (engineering/C16): required checks come from the effective rules of the head branch, and every unknown is exit 2
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "./helper.mjs";

const sh = fileURLToPath(new URL("../../../github/promotion-source.sh", import.meta.url));
const lineage = fileURLToPath(new URL("../../../github/lineage.ts", import.meta.url));
const runSh = (headRef, env = {}) => spawnSync("bash", [sh, lineage], { encoding: "utf8", env: { PATH: process.env.PATH, GUARD_BASE_REF: "main", KAAL_REPO: "o/r", KAAL_DEFAULT: "main", KAAL_HEAD_REPO: "o/r", KAAL_HEAD_REF: headRef, ...env } });

export const id = "engineering/T453";
export const tests = ["engineering/C16"];
export const title = "readRequired takes the union over every ruleset that applies and fails closed; the script exits 2 without a head sha";
export async function run() {
  const { readRequired } = await load();
  const rule = (...c) => ({ type: "required_status_checks", ruleset_id: 1, parameters: { required_status_checks: c.map((context) => ({ context, integration_id: 15368 })) } });
  const got = readRequired([{ type: "deletion" }, rule("Guard", "Engineering"), { ...rule("Guard", "WIRE"), ruleset_id: 2 }]);
  assert.deepEqual(got.map((r) => r.context).sort(), ["Engineering", "Guard", "WIRE"], "union across rulesets, de-duplicated");
  assert.deepEqual(readRequired([{ type: "deletion" }]), [], "no status-check rule: empty (which then fails the head)");
  assert.throws(() => readRequired({ message: "Not Found" }), /rules/, "an unreadable response cannot be judged");
  assert.equal(runSh("kaal/a/b").status, 2);
  assert.equal(runSh("wire/x").status, 2);
  assert.equal(runSh("hotfix/x").status, 2);
  // end to end through the script, with a stub for the GitHub CLI
  const dir = mkdtempSync(join(tmpdir(), "c16-"));
  try {
    const stub = join(dir, "gh");
    writeFileSync(stub, `#!/bin/bash
case "$*" in
  *rules/branches*) echo '{"type":"required_status_checks","parameters":{"required_status_checks":[{"context":"Guard","integration_id":15368}]}}' ;;
  *check-runs*) echo "{\\"id\\":$RUN_ID,\\"name\\":\\"Guard\\",\\"status\\":\\"$RUN_STATUS\\",\\"conclusion\\":$RUN_CONCLUSION,\\"appId\\":15368,\\"headSha\\":\\"$KAAL_HEAD_SHA\\"}" ;;
esac
`, { mode: 0o755 });
    const sha = "a".repeat(40);
    const env = { KAAL_GH: stub, KAAL_HEAD_SHA: sha, KAAL_ATTEMPTS: "2", KAAL_INTERVAL: "0", RUN_ID: "7" };
    assert.equal(runSh("hotfix/x", { ...env, RUN_STATUS: "completed", RUN_CONCLUSION: '"success"' }).status, 0, "green head");
    assert.equal(runSh("wire/x", { ...env, RUN_STATUS: "completed", RUN_CONCLUSION: '"failure"' }).status, 1, "red head");
    const pending = runSh("kaal/a/b", { ...env, RUN_STATUS: "in_progress", RUN_CONCLUSION: "null" });
    assert.equal(pending.status, 1, "still pending after the wait: not admitted");
    assert.match(pending.stderr + pending.stdout, /Guard \(pending\)/);
    assert.equal(runSh("claude/z").status, 1, "development branches need no sha and are never admitted");
    assert.equal(runSh("hotfix/x", { ...env, KAAL_GH: join(dir, "missing"), RUN_STATUS: "completed", RUN_CONCLUSION: '"success"' }).status, 2, "unreadable rules: cannot judge");
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
