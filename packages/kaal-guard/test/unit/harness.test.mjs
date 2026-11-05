// The acceptance harness hands each case a consumer that is a copy of one starting consumer built once per
// test file (guard/C142). These cases show that the copy is the same consumer the harness built before, and
// that no copy shares anything mutable with another: each case still receives an independent consumer.
import assert from "node:assert/strict";
import { appendFileSync, readFileSync, realpathSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";
import { consumer, exec, NAME, packed, sha256, tree } from "../acceptance/harness.mjs";

const installedOf = (c) => join(c.dir, "node_modules", ...NAME.split("/"));
const bytesOf = (base) => Object.fromEntries(tree(base).map((f) => [f, sha256(readFileSync(join(base, f)))]));
const head = (c) => c.git("rev-parse", "HEAD").stdout.trim();
const remoteHead = (c) => exec(c.root, "git", ["ls-remote", c.remote, "refs/heads/main"], c.env).stdout.split(/\s/)[0];
const tracked = (c) => c.git("ls-files").stdout.split(/\r?\n/).filter(Boolean).sort();
const inside = (root, path) => !relative(realpathSync(root), realpathSync(path)).startsWith("..");

describe("the acceptance harness's consumers", () => {
  it("each consumer has a root, a repository, a home and a bare remote of its own, and its origin is its own remote", () => {
    const [a, b] = [consumer(), consumer()];
    for (const key of ["root", "dir", "home", "remote"]) assert.notEqual(a[key], b[key], `two consumers share their ${key}`);
    for (const c of [a, b]) {
      for (const key of ["dir", "home", "remote"]) assert.ok(inside(c.root, c[key]), `a consumer's ${key} lies outside its own root`);
      assert.equal(realpathSync(c.git("remote", "get-url", "origin").stdout.trim()), realpathSync(c.remote), "origin is not the consumer's own remote");
    }
  });

  it("a change to one consumer reaches no other: its files, history, remote, Git configuration and installed package", () => {
    const a = consumer();
    const before = { head: head(a), remote: remoteHead(a), files: tracked(a), installed: bytesOf(installedOf(a)) };
    const b = consumer();
    // Everything a case does to a consumer: write and commit, push, configure Git, and even change the installed copy.
    b.write("only-in-b.txt", "b\n");
    assert.equal(b.git("config", "--local", "kaal.guard.test", "b").status, 0);
    b.commit("b changes");
    assert.equal(b.git("push", "-q", "origin", "main").status, 0);
    appendFileSync(join(installedOf(b), "package.json"), "\n");
    assert.notEqual(remoteHead(b), before.remote, "the push did not reach the consumer's own remote");
    // Another consumer, made before and after, is as it was.
    const c = consumer();
    for (const other of [a, c]) {
      assert.equal(head(other), before.head, "another consumer's history changed");
      assert.equal(remoteHead(other), before.remote, "another consumer's remote changed");
      assert.deepEqual(tracked(other), before.files, "another consumer's files changed");
      assert.equal(other.exists("only-in-b.txt"), false, "a file written in one consumer is in another");
      assert.equal(other.git("config", "--local", "--get", "kaal.guard.test").status, 1, "a Git setting made in one consumer is in another");
      assert.deepEqual(bytesOf(installedOf(other)), before.installed, "a change to one installed package reached another");
    }
  });

  it("a copied consumer is the consumer built from nothing: the same files, the same installed bytes and a remote that holds the history before the install", () => {
    const copy = consumer();
    const built = consumer({ install: false });
    assert.equal(exec(built.dir, "npm", ["install", "--save-dev", "--no-audit", "--no-fund", "--offline", packed()], built.env).status, 0, "npm install of the packed tarball failed");
    built.commit(`install ${NAME}`);
    assert.deepEqual(tracked(copy), tracked(built), "the copy tracks other files than a consumer built from nothing");
    for (const f of tracked(copy)) assert.equal(copy.read(f), built.read(f), `${f} differs`);
    assert.deepEqual(bytesOf(installedOf(copy)), bytesOf(installedOf(built)), "the copy's installed package is not the one npm installs");
    assert.equal(remoteHead(copy), copy.git("rev-parse", "HEAD~1").stdout.trim(), "the copy's remote does not hold the history before the install, as the first consumer's did");
    assert.equal(remoteHead(built), built.git("rev-parse", "HEAD~1").stdout.trim());
  });
});
