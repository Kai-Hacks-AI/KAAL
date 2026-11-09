/*---
tests: [foundation/F11, foundation/N23, foundation/A26]
---*/
// The Owner's review of foundation/C7 (#711): manifest generation's --check is mandatory in the
// publisher's verification. The committed 04-test/package-check/verify.json must be exactly what
// 04-test/engineering-check/publisher/manifest.mjs writes from npm's pack list, so any change to a shipped file without a
// regenerated manifest fails here (foundation/F11, foundation/A8). Not shipped.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "04-test", "engineering-check", "publisher", "manifest.mjs");

test("foundation/T71 [foundation/F11, foundation/A26]: the committed 04-test/package-check/verify.json is current: manifest.mjs --check passes", () => {
  const r = spawnSync(process.execPath, [SCRIPT, "--check"], { encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /package-check\/verify\.json is current/);
});

// A Case id names exactly one executed Case: suites and tests edges are composed by id (foundation/N23).
const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const caseFiles = (dir = PACKAGE) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (["node_modules", "dist", ".git", "00-changes", "plan"].includes(e.name)) return [];
    const path = join(dir, e.name);
    return e.isDirectory() ? caseFiles(path) : /\.test\.(mjs|ts)$/.test(e.name) ? [path] : [];
  });

test("foundation/T77 [foundation/N23]: no two Cases share an id, and a Case whose id is in a template title (a generated Case) is refused", () => {
  const seen = new Map();
  const generated = [];
  for (const file of caseFiles()) {
    for (const m of readFileSync(file, "utf8").matchAll(/(?:^|\s)(?:test|it)\(\s*(["`])(foundation\/[\w-]+) [^\n]*?\1/gm)) {
      if (m[1] === "`" && m[0].includes("${")) generated.push(`${m[2]} in ${file}`);
      seen.set(m[2], [...(seen.get(m[2]) ?? []), file]);
    }
  }
  assert.deepEqual(generated, [], "a generated Case would share one id across several Cases: make it one Case or give each its own id");
  assert.deepEqual([...seen].filter(([, files]) => files.length > 1).map(([id]) => id), [], "each Case id appears once");
});
