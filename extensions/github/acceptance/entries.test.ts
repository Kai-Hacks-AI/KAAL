// The entries Git and the workflows run: the CLI's exit codes and the hook.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { KAAL_ROOT } from "../src/kaal.js";

const cli = join(KAAL_ROOT, "extensions/github/dist/src/cli.js");
const run = (...args: string[]) => spawnSync("node", [cli, ...args], { cwd: KAAL_ROOT, encoding: "utf8" });

test("cli: no control, an unknown control or a missing target is usage, exit 2", () => {
  assert.equal(run().status, 2);
  assert.equal(run("nonsense", "HEAD").status, 2);
  assert.equal(run("isolate-boundaries").status, 2);
  assert.match(run().stderr, /usage:/);
});
test("cli: a control that holds exits 0, and an unreadable target exits 1", () => {
  assert.equal(run("isolate-boundaries", "HEAD").status, 0);
  const bad = run("isolate-boundaries", "no-such-ref");
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /cannot compare/);
});
test("cli: preserve-seals of HEAD against HEAD holds in this repository", () => {
  const r = run("preserve-seals", "HEAD");
  assert.equal(r.status, 0, r.stderr);
});

test("pre-commit hook: runs from the repository root, is a Node entry and is executable", () => {
  const hook = join(KAAL_ROOT, "extensions/github/hooks/pre-commit");
  assert.match(readFileSync(hook, "utf8"), /^#!\/usr\/bin\/env node\n/);
  assert.ok(statSync(hook).mode & 0o100, "hook must be executable");
  const r = spawnSync(hook, [], { cwd: KAAL_ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr + r.stdout);
});

test("the extension carries no process vocabulary", () => {
  const dir = fileURLToPath(new URL("../../src/", import.meta.url));
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".ts"))) {
    const text = readFileSync(join(dir, f), "utf8");
    assert.doesNotMatch(text, /\b(retro|review|observer|worker|owner)\b/i, f);
  }
});
