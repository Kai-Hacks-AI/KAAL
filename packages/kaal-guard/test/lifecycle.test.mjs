// Inner Code tests of the lifecycle and the workflow it renders. They evolve with the code, test first.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { verify } from "../lib/github.mjs";
import { init, remove, upgrade, workflow } from "../lib/lifecycle.mjs";

/** A fresh Git working tree with guard.json holding these checks, when given. */
function tree(checks) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-guard-lifecycle-"));
  spawnSync("git", ["init", "-q", dir]);
  if (checks) writeFileSync(join(dir, "guard.json"), JSON.stringify({ checks }));
  return dir;
}

const hooksPath = (dir) => spawnSync("git", ["config", "--local", "--get", "core.hooksPath"], { cwd: dir, encoding: "utf8" }).stdout.trim();
const guard = (dir) => JSON.parse(readFileSync(join(dir, "guard.json"), "utf8"));

describe("workflow", () => {
  it("declares each ci check in Guard's declared form, so verify finds it", () => {
    const dir = tree({ a: { command: "x", runs: ["ci"] }, b: { command: "x", runs: ["ci"] } });
    mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
    writeFileSync(join(dir, ".github", "workflows", "guard.yml"), workflow(["a", "b"]));
    const { results } = verify(dir, guard(dir));
    assert.deepEqual(results.map((r) => [r.name, r.verdict]), [["a", "pass"], ["b", "pass"]]);
  });

  it("with no ci checks, leaves the check job as a comment that declares nothing", () => {
    const text = workflow([]);
    assert.match(text, /^# +check:$/m);
    assert.doesNotMatch(text, /^ {2}check:$/m);
    assert.match(text, /^ {2}guard:$/m);
  });
});

describe("lifecycle", () => {
  it("init writes, records and sets; remove takes back exactly that and keeps guard.json's checks", () => {
    const dir = tree({ a: { command: "x", runs: ["ci"] } });
    assert.ok(init(dir).lines);
    assert.equal(hooksPath(dir), ".githooks");
    const after = guard(dir);
    assert.deepEqual(Object.keys(after.managed).sort(), [".githooks/pre-push", ".github/workflows/guard.yml"]);
    assert.deepEqual(after.config, { "core.hooksPath": ".githooks" });
    assert.ok(remove(dir).lines);
    assert.ok(!existsSync(join(dir, ".githooks")) && !existsSync(join(dir, ".github")));
    assert.equal(hooksPath(dir), "");
    assert.deepEqual(guard(dir), { checks: { a: { command: "x", runs: ["ci"] } } });
  });

  it("leaves a core.hooksPath that equals its own but that it did not set", () => {
    const dir = tree();
    spawnSync("git", ["config", "core.hooksPath", ".githooks"], { cwd: dir });
    init(dir);
    assert.equal(guard(dir).config, undefined);
    remove(dir);
    assert.equal(hooksPath(dir), ".githooks");
  });

  it("upgrade rewrites an unmodified workflow from guard.json's ci checks", () => {
    const dir = tree({});
    init(dir);
    writeFileSync(join(dir, "guard.json"), JSON.stringify({ ...guard(dir), checks: { a: { command: "x", runs: ["ci"] } } }));
    assert.match(upgrade(dir).lines.join("\n"), /upgraded \.github\/workflows\/guard\.yml/);
    assert.equal(readFileSync(join(dir, ".github", "workflows", "guard.yml"), "utf8"), workflow(["a"]));
    assert.match(upgrade(dir).lines.join("\n"), /guard\.yml is current/);
  });

  it("names guard.json when it cannot be read", () => {
    const dir = tree();
    writeFileSync(join(dir, "guard.json"), "{");
    for (const step of [init, upgrade, remove]) assert.match(step(dir).problem, /guard\.json/);
  });
});
