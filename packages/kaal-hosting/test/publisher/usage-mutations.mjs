// Run sequentially, after publisher tests and before packing. Restore exact bytes even on failure.
// Only a designated behavioral assertion failure kills a mutant; syntax/setup/import failures do not.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkg = fileURLToPath(new URL("../../", import.meta.url));
const resource = resolve(pkg, "skills/kaal-hosting/references/operations.md");
const original = readFileSync(resource);
const source = original.toString();
const rows = [
  ["fabricate-readback", 72, "intent", 'text: (await readFile(join(root, "welcome.md"))).toString("utf8"),', 'text: "fabricated",'],
  ["ignore-guard", 73, "requirements", "path, expect, bytes:", 'path, expect: "absent", bytes:'],
  ["hide-stale", 73, "requirements", "return await reconcile(root, {", "try { return await reconcile(root, {", "    remove: [],\n  });", "    remove: [],\n  }); } catch { return { outcomes: [], pruned: [] }; }"],
  ["erase-nonzero-exit", 74, "requirements", "return await execute(command, args, { cwd, ...(env === undefined ? {} : { env }) });", "return { ...(await execute(command, args, { cwd, ...(env === undefined ? {} : { env }) })), status: 0 };"],
];
const killed = [];
try {
  for (const [name, id, file, before, after, before2, after2] of rows) {
    assert.equal(source.split(before).length, 2, `${name}: mutation point must be unique`);
    let changed = source.replace(before, after);
    if (before2) {
      assert.equal(changed.split(before2).length, 2);
      changed = changed.replace(before2, after2);
    }
    writeFileSync(resource, changed);
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(process.execPath, ["--test", `--test-name-pattern=hosting/T${id} `, `test/embed/${file}.test.mjs`], { cwd: pkg, env, encoding: "utf8", timeout: 30000 });
    const output = result.stdout + result.stderr;
    assert.equal(result.signal, null, `${name}: timeout/signal is not a kill`);
    assert.ok(result.status !== 0 && output.includes(`✖ hosting/T${id} `) && output.includes("AssertionError") && !/SyntaxError|ERR_MODULE_NOT_FOUND/.test(output), `${name}: no designated assertion kill\n${output}`);
    killed.push({ name, case: `hosting/T${id}`, outcome: "assertion-killed" });
  }
} finally {
  writeFileSync(resource, original);
}
assert.deepEqual(readFileSync(resource), original);
console.log("hosting-usage-mutations " + JSON.stringify({ resourceSha256: createHash("sha256").update(original).digest("hex"), killed }));
