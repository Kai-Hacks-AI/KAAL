// Discriminating challenges for the frozen defect regressions. Each mutation
// restores the exact input bytes in finally and must die by assertion, not setup.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
const challenges = [
  { name: "accept-duplicate-inventory", file: "04-test/package-check/verify.mjs", test: "04-test/engineering-check/publisher/defects.test.mjs", pattern: "^hosting/T79 ",
    before: "if (duplicate !== undefined) add(causes,", after: "if (false) add(causes," },
  { name: "erase-observed-failure", file: "04-test/package-check/verify.mjs", test: "04-test/engineering-check/publisher/defects.test.mjs", pattern: "^hosting/T79 ",
    mutate: (s) => s.replace('if (o.outcome === "fail") add(failures,', 'if (false) add(failures,').replace('else if (outcome.get(o.name) !== "fail") outcome.set', 'else outcome.set') },
  { name: "delete-caller-fixture", file: "dist/skills/kaal-hosting/scripts/fixtures.js", test: "04-test/engineering-check/publisher/defects.test.mjs", pattern: "^hosting/T80 controlled host:",
    mutate: (s) => s.replace(/for \(const path of \[fifo, socket\]\)\s*if \(look\(path\)\)\s*return \{ failed: `\$\{path\} already exists` \};/, "").replace(/if \(made === undefined\)\s*remove\(fifo\);/, 'remove(fifo);') },
  { name: "lose-staging-cleanup", file: "dist/skills/kaal-hosting/scripts/index.js", test: "04-test/package-check/allocation.test.mjs", pattern: "^hosting/T81 ",
    before: "await rm(staging, { maxRetries: 3 }).catch", after: "await Promise.resolve().catch" },
];
const evidence = [];
for (const c of challenges) {
  const path = join(root, c.file), original = readFileSync(path);
  const source = original.toString("utf8");
  const changed = c.mutate ? c.mutate(source) : source.replace(c.before, c.after);
  assert.notEqual(changed, source, `${c.name}: mutation did not apply`);
  try {
    writeFileSync(path, changed);
    const run = spawnSync(process.execPath, ["--test", `--test-name-pattern=${c.pattern}`, c.test], { cwd: root, env, encoding: "utf8" });
    const output = run.stdout + run.stderr;
    assert.notEqual(run.status, 0, `${c.name}: survived`);
    assert.match(output, /AssertionError|ERR_ASSERTION/, `${c.name}: not an assertion kill\n${output}`);
    assert.doesNotMatch(output, /SyntaxError|ERR_MODULE_NOT_FOUND/, `${c.name}: setup failure is not evidence`);
    evidence.push({ name: c.name, outcome: "assertion-killed" });
  } finally { writeFileSync(path, original); }
}
console.log(`hosting-defect-mutations ${JSON.stringify(evidence)}`);
