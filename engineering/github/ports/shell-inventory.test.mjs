// engineering/ports Case T1: the exact inventory of shell files (engineering/github/ports/PLAN.md R1, R2, R3).
// Shell is reviewed differently, so the list of tracked shell files is an exact allowlist: a new shell file anywhere fails here, and a
// file that is gone must leave the list. The list only shrinks: each port removes its file here in the same PR. When the ports are
// done it holds the three pre-push shims, which the byte-pin Case (added with the last port) pins to their exact bytes.
// A file is shell when its extension is .sh or .bash, or when its first line is a sh or bash shebang: bytes, not code patterns.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Exactly these tracked files are shell. Port a file, remove it here; never add one. The ported `.mjs` lands in its release-management component (PLAN R9), never as a new shell path. */
const ALLOWED = [
  ".githooks/pre-push",
  ".github/scripts/bind-group.sh",
  "engineering/github/branching-audit.sh",
  "engineering/github/branching.sh",
  "engineering/github/change-isolation.sh",
  "engineering/github/push-check.sh",
  "engineering/guard/external/templates/guard.sh",
  "engineering/guard/external/templates/pre-push",
  "packages/kaal-guard/templates/pre-push",
];

const SHEBANG = new Set(["sh", "bash"]);
const interpreter = (first) => {
  const [command, argument] = first.slice(2).trim().split(/\s+/);
  const name = command.split("/").pop();
  return name === "env" ? argument : name;
};

function tracked() {
  const r = spawnSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, "git ls-files must work: the inventory is read from the index");
  return r.stdout.split("\0").filter(Boolean);
}

function shellFiles() {
  return tracked().filter((file) => {
    const path = join(ROOT, file);
    let stat;
    try {
      stat = lstatSync(path);
    } catch {
      return false;
    }
    if (!stat.isFile()) return false;
    if (/\.(sh|bash)$/.test(file)) return true;
    const first = readFileSync(path, "utf8").split("\n", 1)[0];
    return first.startsWith("#!") && SHEBANG.has(interpreter(first));
  });
}

test("ports/T1 [R1, R2]: the tracked shell files are exactly the allowlist, so a new shell file or a stale entry fails", () => {
  const found = shellFiles().sort();
  assert.deepEqual(found, [...ALLOWED].sort());
});
