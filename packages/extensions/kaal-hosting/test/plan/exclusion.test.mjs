// hosting/C20 planned outer tests: excluded directories (hosting/F42–hosting/F44).
// Immutable to DO and CHECK; hosting/C21 turns them GREEN. Each title names the
// contracts it checks. They reach Hosting through its build by path, never
// through the package name, so a rename needs no edit. Directory links are made
// as junctions, which Windows allows without privilege; elsewhere the type is
// ignored and a directory link is made.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { HostingError, read } from "../../dist/index.js";

const NM = "node_modules";

/** A fresh tree from `{ path: text }`, plus `links` as `{ path: target directory }`. */
function tree(files, links = {}, base = mkdtempSync(join(tmpdir(), "kaal-exclude-"))) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(base, path)), { recursive: true });
    writeFileSync(join(base, path), text);
  }
  for (const [path, target] of Object.entries(links)) {
    mkdirSync(dirname(join(base, path)), { recursive: true });
    symlinkSync(target, join(base, path), "junction");
  }
  return base;
}

/** The sorted paths `read` returns, with each file's text. */
const texts = (files) => Object.fromEntries(Object.keys(files).sort().map((p) => [p, files[p].toString("utf8")]));

const refused = (e) => e instanceof HostingError && e.code === "INVALID_PATH";

describe("hosting/C20: excluded directories", () => {
  it("hosting/T49 [hosting/F42, hosting/I11]: a tree read refuses because a linked dependency directory sits inside node_modules, at the root and nested, and because node_modules itself is a link to a directory, reads with exclude: [\"node_modules\"] as every other file, and nothing under any node_modules", async () => {
    const outside = tree({ "dep/index.js": "dep" });
    const cases = {
      "a linked dependency in the root node_modules": [{ "a.md": "a", [`${NM}/real/index.js`]: "real" }, { [`${NM}/linked`]: join(outside, "dep") }],
      "a linked dependency in a nested node_modules": [{ "a.md": "a", "lib/b.md": "b", [`lib/${NM}/real/index.js`]: "real" }, { [`lib/${NM}/linked`]: join(outside, "dep") }],
      "node_modules itself a link to a directory": [{ "a.md": "a", "lib/b.md": "b" }, { [NM]: outside }],
    };
    for (const [label, [files, links]] of Object.entries(cases)) {
      const root = tree(files, links);
      await assert.rejects(read(root), refused, `${label}: the fixture holds no directory link read refuses`);
      const expected = Object.fromEntries(Object.entries(files).filter(([p]) => !p.split("/").includes(NM)));
      assert.deepEqual(texts(await read(root, { exclude: [NM] })), texts(Object.fromEntries(Object.entries(expected).map(([p, t]) => [p, Buffer.from(t)]))), label);
    }
  });

  it("hosting/T50 [hosting/F42]: exclusion is by whole, exact directory name: node_modules_extra/, a Node_Modules/ directory and a file named node_modules are read, and a root directory named node_modules is read", async () => {
    const files = { "a.md": "a", [`${NM}_extra/x.md`]: "x", "cased/Node_Modules/y.md": "y", [`lib/${NM}`]: "a file", [`${NM}/gone.md`]: "excluded" };
    const root = tree(files);
    const read_ = texts(await read(root, { exclude: [NM] }));
    assert.deepEqual(read_, { "a.md": "a", "cased/Node_Modules/y.md": "y", "lib/node_modules": "a file", "node_modules_extra/x.md": "x" });

    const parent = mkdtempSync(join(tmpdir(), "kaal-exclude-"));
    const named = tree({ "z.md": "z", [`inner/${NM}/w.md`]: "w" }, {}, join(parent, NM));
    assert.deepEqual(texts(await read(named, { exclude: [NM] })), { "z.md": "z" });
  });

  it("hosting/T51 [hosting/F43]: outside excluded directories nothing changes: the result equals read's for the same files, a link to a directory that is not excluded is still refused with INVALID_PATH, a missing directory reads as empty, and read(dir), read(dir, {}) and exclude: [] agree", async () => {
    const files = { "a.md": "a", "lib/b.md": "b", "lib/deep/c.md": "c", "__proto__": "p" };
    const plain = tree(files);
    const whole = texts(await read(plain));
    assert.deepEqual(texts(await read(plain, { exclude: [NM] })), whole);
    assert.deepEqual(texts(await read(plain, {})), whole);
    assert.deepEqual(texts(await read(plain, { exclude: [] })), whole);

    const outside = tree({ "dep/index.js": "dep" });
    const linked = tree({ "a.md": "a", [`${NM}/x.md`]: "x" }, { "vendor/linked": join(outside, "dep") });
    await assert.rejects(read(linked, { exclude: [NM] }), refused, "a directory link outside an excluded directory was not refused");
    await assert.rejects(read(linked, { exclude: ["vendor-other"] }), refused);

    assert.deepEqual(await read(join(plain, "missing"), { exclude: [NM] }), {});
  });

  it("hosting/T52 [hosting/F44]: a wrong exclusion is refused with INVALID_PATH before anything is read: not an array, an empty name, ., .., a name with /, \\ or NUL, a repeated name, a non-string, and an unknown option such as exlude", async () => {
    const outside = tree({ "dep/index.js": "dep" });
    // Read whole, this tree is refused for its link, so only a refusal of the options before reading passes each case.
    const root = tree({ "a.md": "a" }, { [`${NM}/linked`]: join(outside, "dep") });
    const wrong = {
      "not an array": { exclude: NM },
      "an empty name": { exclude: [""] },
      ".": { exclude: ["."] },
      "..": { exclude: [".."] },
      "a name with /": { exclude: [`a/${NM}`] },
      "a name with \\": { exclude: [`a\\${NM}`] },
      "a name with NUL": { exclude: [`${NM}\0`] },
      "a repeated name": { exclude: [NM, NM] },
      "a non-string": { exclude: [NM, 1] },
      "an unknown option": { exlude: [NM] },
    };
    for (const [label, options] of Object.entries(wrong)) {
      await assert.rejects(read(root, options), (e) => refused(e) && !/link to a directory/.test(e.message), label);
    }
    // The empty tree shows the refusal does not depend on what the tree holds.
    const empty = mkdtempSync(join(tmpdir(), "kaal-exclude-"));
    for (const [label, options] of Object.entries(wrong)) await assert.rejects(read(empty, options), refused, `${label}, on an empty tree`);
  });
});
