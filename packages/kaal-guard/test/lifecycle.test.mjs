// Inner Code tests of the lifecycle and the workflow it renders. They evolve with the code, test first.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { declarations, verify } from "../lib/github.mjs";
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

  it("says apart what it installed, what it left untouched and what is still to do, and claims no execution", () => {
    const dir = tree();
    mkdirSync(join(dir, ".githooks"));
    writeFileSync(join(dir, ".githooks", "pre-push"), "#!/bin/sh\n");
    const out = init(dir).lines.join("\n");
    assert.match(out, /installed by Guard:\n {2}\.github\/workflows\/guard\.yml\n/);
    assert.match(out, /left untouched:\n {2}\.githooks\/pre-push: it was there before Guard\n/);
    assert.match(out, /still to do in this repository:\n {2}To run Guard's local checks from \.githooks\/pre-push/);
    assert.match(out, /does not show that Git runs the hook, that CI runs these jobs, or that a merge requires them/);
    assert.match(out, /declared integration only/);
    assert.deepEqual(Object.keys(guard(dir).managed), [".github/workflows/guard.yml"]);
  });

  it("does not set core.hooksPath over hooks Git already runs, nor for a hook it did not install", () => {
    const dir = tree();
    writeFileSync(join(dir, ".git", "hooks", "pre-commit"), "#!/bin/sh\n");
    assert.match(init(dir).lines.join("\n"), /core\.hooksPath: unset, so Git runs pre-commit from \.git\/hooks; setting it would turn them off/);
    assert.equal(hooksPath(dir), "");
    assert.equal(guard(dir).config, undefined);

    const other = tree();
    mkdirSync(join(other, ".githooks"));
    writeFileSync(join(other, ".githooks", "pre-push"), "#!/bin/sh\n");
    assert.match(init(other).lines.join("\n"), /git config core\.hooksPath \.githooks/);
    assert.equal(hooksPath(other), "");
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

  it("edits only its own entries of an existing guard.json, so init then remove leaves it byte for byte", () => {
    const texts = {
      pretty: '{\n    "$schema": "./guard.schema.json",\n    "checks": {\n        "a": { "command": "x", "runs": ["ci"] }\n    },\n    "note": "keep"\n}\n',
      compact: '{"checks":{"a":{"command":"x","runs":["ci"]}},"z":1}',
      crlf: '{\r\n  "checks": {},\r\n  "z": [1, 2]\r\n}\r\n',
    };
    for (const [name, text] of Object.entries(texts)) {
      const dir = tree();
      writeFileSync(join(dir, "guard.json"), text);
      init(dir);
      const written = readFileSync(join(dir, "guard.json"), "utf8");
      assert.ok(written.startsWith(text.slice(0, text.lastIndexOf("}")).trimEnd()), `${name}: init keeps every byte before its own entries`);
      assert.deepEqual(Object.keys(guard(dir).managed).sort(), [".githooks/pre-push", ".github/workflows/guard.yml"], name);
      remove(dir);
      assert.equal(readFileSync(join(dir, "guard.json"), "utf8"), text, `${name}: remove restores it byte for byte`);
    }
  });

  it("writes guard.json not at all when its own entries are unchanged", () => {
    const dir = tree({ a: { command: "x", runs: ["ci"] } });
    init(dir);
    const text = '{ "checks":   { "a": { "command": "x", "runs": ["ci"] } }, "managed": ' + JSON.stringify(guard(dir).managed) + ', "config": {"core.hooksPath": ".githooks"}, "writers": ' + JSON.stringify(guard(dir).writers) + " }";
    writeFileSync(join(dir, "guard.json"), text);
    upgrade(dir);
    assert.equal(readFileSync(join(dir, "guard.json"), "utf8"), text);
  });

  it("replaces the value of its own entry in place and keeps the rest", () => {
    const dir = tree({});
    init(dir);
    const before = readFileSync(join(dir, "guard.json"), "utf8");
    const edited = before.replace('"checks":{}', '"checks": { "a": { "command": "x", "runs": ["ci"] } }');
    assert.notEqual(edited, before);
    writeFileSync(join(dir, "guard.json"), edited);
    upgrade(dir);
    const after = readFileSync(join(dir, "guard.json"), "utf8");
    assert.ok(after.startsWith(edited.slice(0, edited.indexOf('"managed"'))));
    assert.notEqual(guard(dir).managed[".github/workflows/guard.yml"], JSON.parse(edited).managed[".github/workflows/guard.yml"]);
  });

  it("upgrade installs and records a managed asset the repository lacks, only where no file exists", () => {
    const dir = tree({});
    mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
    writeFileSync(join(dir, ".github", "workflows", "guard.yml"), "name: Own\n");
    init(dir);
    assert.equal(guard(dir).managed[".github/workflows/guard.yml"], undefined);
    const kept = upgrade(dir).lines.join("\n");
    assert.match(kept, /left untouched \.github\/workflows\/guard\.yml: it is there and Guard did not write it/);
    assert.equal(guard(dir).managed[".github/workflows/guard.yml"], undefined);

    rmSync(join(dir, ".github", "workflows", "guard.yml"));
    assert.match(upgrade(dir).lines.join("\n"), /installed \.github\/workflows\/guard\.yml/);
    assert.equal(readFileSync(join(dir, ".github", "workflows", "guard.yml"), "utf8"), workflow([]));
    assert.ok(guard(dir).managed[".github/workflows/guard.yml"]);
  });

  it("upgrade adopts nothing in a repository where Guard installed nothing", () => {
    const dir = tree({ a: { command: "x", runs: ["ci"] } });
    const before = readFileSync(join(dir, "guard.json"), "utf8");
    assert.deepEqual(upgrade(dir).lines, ["Guard manages nothing here; kaal-guard init installs it"]);
    assert.ok(!existsSync(join(dir, ".github")) && !existsSync(join(dir, ".githooks")));
    assert.equal(readFileSync(join(dir, "guard.json"), "utf8"), before);
  });

  it("init installs no workflow where the repository's own workflows declare every ci check and verify, and reports them as not managed", () => {
    const dir = tree({ a: { command: "x", runs: ["ci"] }, b: { command: "x", runs: ["ci"] } });
    mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
    writeFileSync(join(dir, ".github", "workflows", "ci.yml"), "jobs:\n  own:\n    steps:\n      - run: npx --no kaal-guard run --check a --github\n      - run: kaal-guard run --check b\n  consistency:\n    steps:\n      - run: npx kaal-guard verify --github\n");
    const out = init(dir, declarations(dir)).lines.join("\n");
    assert.ok(!existsSync(join(dir, ".github", "workflows", "guard.yml")));
    assert.equal(guard(dir).managed[".github/workflows/guard.yml"], undefined);
    assert.match(out, /executed by Guard, not managed:\n {2}a in job own of \.github\/workflows\/ci\.yml\n {2}b in job own of \.github\/workflows\/ci\.yml\n {2}verify in job consistency of \.github\/workflows\/ci\.yml/);
  });

  it("init's workflow carries jobs only for what the repository does not declare", () => {
    const dir = tree({ a: { command: "x", runs: ["ci"] }, b: { command: "x", runs: ["ci"] } });
    mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
    writeFileSync(join(dir, ".github", "workflows", "ci.yml"), "jobs:\n  own:\n    steps:\n      - run: kaal-guard run --check a\n");
    init(dir, declarations(dir));
    const text = readFileSync(join(dir, ".github", "workflows", "guard.yml"), "utf8");
    assert.equal(text, workflow(["b"]));
    assert.deepEqual(verify(dir, guard(dir)).results.map((r) => r.verdict), ["pass", "pass"]);
  });

  it("does not count Guard's own managed workflow as the repository's declaration", () => {
    const dir = tree({ a: { command: "x", runs: ["ci"] } });
    init(dir, declarations(dir));
    assert.match(upgrade(dir, declarations(dir)).lines.join("\n"), /guard\.yml is current/);
    assert.equal(readFileSync(join(dir, ".github", "workflows", "guard.yml"), "utf8"), workflow(["a"]));
  });

  it("records the version that wrote each managed asset, and upgrade names the versions it moves between", () => {
    const version = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
    const dir = tree({});
    init(dir);
    assert.deepEqual(guard(dir).writers, { ".githooks/pre-push": version, ".github/workflows/guard.yml": version });
    const list = guard(dir);
    delete list.writers;
    writeFileSync(join(dir, ".githooks", "pre-push"), "#!/bin/sh\n# mine\n");
    writeFileSync(join(dir, "guard.json"), JSON.stringify({ ...list, checks: { a: { command: "x", runs: ["ci"] } } }));
    const out = upgrade(dir).lines.join("\n");
    assert.match(out, new RegExp(`upgraded \\.github/workflows/guard\\.yml from 0\\.0\\.1 to ${version.replaceAll(".", "\\.")}`));
    assert.match(out, /kept \.githooks\/pre-push/);
    assert.deepEqual(guard(dir).writers, { ".github/workflows/guard.yml": version });
    remove(dir);
    assert.equal(guard(dir).writers, undefined);
  });

  it("names guard.json when it cannot be read", () => {
    const dir = tree();
    writeFileSync(join(dir, "guard.json"), "{");
    for (const step of [init, upgrade, remove]) assert.match(step(dir).problem, /guard\.json/);
  });
});

describe("pre-push template", () => {
  const BIN = resolve(dirname(fileURLToPath(import.meta.url)), "../bin/kaal-guard.mjs");
  const TEMPLATE = resolve(dirname(fileURLToPath(import.meta.url)), "../templates/pre-push");

  it("supplies no changed paths when Git cannot compute them, so a check that needs them cannot judge and blocks", { skip: process.platform === "win32" }, () => {
    const dir = tree({ scope: { command: "node -e 0", runs: ["local"], facts: ["changed"] } });
    const g = (...args) => spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd: dir, encoding: "utf8" });
    mkdirSync(join(dir, "node_modules", ".bin"), { recursive: true });
    writeFileSync(join(dir, "node_modules", ".bin", "kaal-guard"), `#!/bin/sh\nexec "${process.execPath}" "${BIN}" "$@"\n`);
    chmodSync(join(dir, "node_modules", ".bin", "kaal-guard"), 0o755);
    g("commit", "-q", "--allow-empty", "-m", "head");
    const head = g("rev-parse", "HEAD").stdout.trim();
    g("checkout", "-q", "--orphan", "unrelated");
    g("commit", "-q", "--allow-empty", "-m", "unrelated base");
    g("update-ref", "refs/remotes/origin/main", "HEAD"); // a base with no merge base: Git cannot give the changed paths
    const r = spawnSync("sh", [TEMPLATE, "origin"], { cwd: dir, encoding: "utf8", input: `refs/heads/x ${head} refs/heads/x ${"0".repeat(40)}\n` });
    assert.notEqual(r.status, 0, r.stderr);
    assert.match(r.stderr, /changed paths .* cannot be computed/);
    assert.match(r.stderr, /cannot judge: scope: the fact changed was not supplied/);
    assert.match(r.stderr, /CI decides/);
  });
});
