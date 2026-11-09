// release-management/T11 (audit Lineage placement), a Case beside its component (05-src/pipeline/audit-lineage).
// Run: node --test engineering/release-management/05-src/pipeline/audit-lineage/audit-lineage.test.mjs
//
// audit Lineage (requirement release-management/F5) lives in its component. The Guard check named Branching-audit
// must run the component's script, and the old path under engineering/github/ must be gone, so there is one home.
// The Guard declaration is read with Guard's own frontmatter parser (use, not build); nothing is matched by pattern.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { frontmatter } from "@kaihacksai/kaal-guard/lib/config.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = process.env.KAAL_ROOT ? resolve(process.env.KAAL_ROOT) : resolve(here, "../../../../..");
const COMPONENT = "engineering/release-management/05-src/pipeline/audit-lineage";
const CHECK = ".kaal/config/guard/Branching-audit.md";

test("the Branching-audit Guard check runs the audit-lineage component's script", () => {
  const members = frontmatter(readFileSync(join(root, CHECK), "utf8"), CHECK);
  const [shell, script, checker] = members.command.split(" ");
  assert.equal(shell, "bash");
  assert.equal(script, `${COMPONENT}/audit-lineage.sh`);
  assert.equal(checker, "engineering/github/lineage.ts", "the shared checker has not moved yet");
  assert.ok(existsSync(join(root, script)), `${script} exists`);
});

test("the old path holds no copy of the audit script", () => {
  assert.equal(existsSync(join(root, "engineering/github/branching-audit.sh")), false);
});

test("the owner's holds stay where the default branch reads them until the script has been promoted", () => {
  assert.ok(existsSync(join(root, "engineering/github/holds.json")));
  const script = readFileSync(join(root, COMPONENT, "audit-lineage.sh"), "utf8");
  assert.ok(script.includes("engineering/github/holds.json"), "the script reads holds.json at its current path");
});
