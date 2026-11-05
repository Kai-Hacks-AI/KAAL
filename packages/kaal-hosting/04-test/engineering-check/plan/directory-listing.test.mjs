// hosting/C105 planned outer tests: the directory listing and the scratch directory
// (hosting/F72–hosting/F74, hosting/N10; hosting/T129–hosting/T133). Immutable to DO and CHECK;
// hosting/C106 turns them GREEN. They reach Hosting through its build by path, never through
// the package name. Fixtures are built in a temporary directory.
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import * as hosting from "../../../dist/skills/kaal-hosting/scripts/index.js";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function fixture(files = {}, dirs = []) {
  const root = mkdtempSync(join(tmpdir(), "hosting-list-"));
  for (const d of dirs) mkdirSync(join(root, d), { recursive: true });
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const fails = (promise, code) =>
  assert.rejects(promise, (e) => {
    assert.equal(e?.code, code, `expected ${code}, got ${e?.code}: ${e?.message}`);
    return true;
  });

describe("hosting/F72 list", () => {
  it("hosting/T129: lists files and directories with / paths in UTF-16 order, a directory before what it holds, empty directories included", async () => {
    // The upper-case name is A.txt, not B.txt: on a case-insensitive host (Windows, macOS) B.txt and b.txt are one file, so the fixture itself could not hold both.
    const root = fixture({ "b.txt": "b", "a/z.txt": "z", "a/y/k.txt": "k", "A.txt": "A" }, ["empty", "a/hollow"]);
    const listed = await hosting.list(root);
    assert.deepEqual(listed, [
      { path: "A.txt", kind: "file" },
      { path: "a", kind: "directory" },
      { path: "a/hollow", kind: "directory" },
      { path: "a/y", kind: "directory" },
      { path: "a/y/k.txt", kind: "file" },
      { path: "a/z.txt", kind: "file" },
      { path: "b.txt", kind: "file" },
      { path: "empty", kind: "directory" },
    ]);
    assert.ok(!listed.some((e) => e.path === "" || e.path === "."), "the directory itself is not listed");
    assert.deepEqual(await hosting.list(join(root, "does-not-exist")), []);
    assert.deepEqual(await hosting.list(join(root, "empty")), []);
  });

  it("hosting/T130: a link to a file is a file, a link to a directory and a file path are refused, no bytes are read", async () => {
    const root = fixture({ "real.txt": "x", "sub/inner.txt": "i" });
    symlinkSync(join(root, "real.txt"), join(root, "alias.txt"), "file");
    const listed = await hosting.list(root);
    assert.deepEqual(listed.find((e) => e.path === "alias.txt"), { path: "alias.txt", kind: "file" });

    const linked = fixture({ "keep.txt": "k" });
    symlinkSync(join(root, "sub"), join(linked, "elsewhere"), "junction");
    await fails(hosting.list(linked), "INVALID_PATH");

    await fails(hosting.list(join(root, "real.txt")), "NOT_DIRECTORY");

    if (process.platform !== "win32" && process.getuid?.() !== 0) {
      const sealed = join(root, "sealed.txt");
      writeFileSync(sealed, "secret");
      chmodSync(sealed, 0o000);
      try {
        assert.ok((await hosting.list(root)).some((e) => e.path === "sealed.txt" && e.kind === "file"), "an unreadable file is still listed");
      } finally {
        chmodSync(sealed, 0o600);
      }
    }
  });
});

describe("hosting/F73 scratch", () => {
  it("hosting/T131: hands use an absolute path to a fresh empty directory and removes everything use made", async () => {
    let seen;
    const value = await hosting.scratch(async (dir) => {
      seen = dir;
      assert.ok(isAbsolute(dir), "the path is absolute");
      assert.ok(statSync(dir).isDirectory(), "the directory already exists when use is called");
      assert.deepEqual(await hosting.list(dir), [], "the directory is fresh and empty");
      mkdirSync(join(dir, "nested", "deeper"), { recursive: true });
      writeFileSync(join(dir, "nested", "deeper", "f.txt"), "f");
      return { answer: 42 };
    });
    assert.deepEqual(value, { answer: 42 });
    assert.equal(existsSync(seen), false, "the whole tree is removed");
  });

  it("hosting/T132: a rejecting use is cleaned up and its own error wins; a removal failure is SCRATCH_LEFTOVER; calls do not share a directory", async () => {
    let first;
    const boom = new Error("use failed");
    await assert.rejects(
      hosting.scratch(async (dir) => {
        first = dir;
        writeFileSync(join(dir, "f.txt"), "f");
        throw boom;
      }),
      (e) => e === boom,
    );
    assert.equal(existsSync(first), false, "removed although use rejected");

    const [a, b] = await Promise.all([
      hosting.scratch(async (dir) => (await new Promise((r) => setTimeout(r, 20)), dir)),
      hosting.scratch(async (dir) => (await new Promise((r) => setTimeout(r, 20)), dir)),
    ]);
    assert.notEqual(a, b, "concurrent calls get different directories");

    // A removal that cannot succeed: a read-only subdirectory holding a file, on hosts that enforce it.
    if (process.platform !== "win32" && process.getuid?.() !== 0) {
      let left;
      await assert.rejects(
        hosting.scratch(async (dir) => {
          left = dir;
          mkdirSync(join(dir, "locked"));
          writeFileSync(join(dir, "locked", "f.txt"), "f");
          chmodSync(join(dir, "locked"), 0o500);
        }),
        (e) => {
          assert.equal(e?.code, "SCRATCH_LEFTOVER");
          assert.ok(String(e.message).includes(left), "the message names the path");
          return true;
        },
      );
      chmodSync(join(left, "locked"), 0o700);
      rmSync(left, { recursive: true, force: true });

      const kept = new Error("own error");
      let left2;
      await assert.rejects(
        hosting.scratch(async (dir) => {
          left2 = dir;
          mkdirSync(join(dir, "locked"));
          writeFileSync(join(dir, "locked", "f.txt"), "f");
          chmodSync(join(dir, "locked"), 0o500);
          throw kept;
        }),
        (e) => {
          assert.equal(e, kept, "use's own error is the one thrown");
          // The leftover is reported on it, never in its place. The plan fixes no property name, so any of the usual carriers is accepted, but one must carry SCRATCH_LEFTOVER and the path.
          const carried = [e.leftover, e.cause, e.suppressed, ...(Array.isArray(e.errors) ? e.errors : [])].flat().filter(Boolean);
          assert.ok(
            carried.some((c) => c?.code === "SCRATCH_LEFTOVER" && String(c.message).includes(left2)),
            "the removal failure is reported on use's error, naming the path",
          );
          return true;
        },
      );
      chmodSync(join(left2, "locked"), 0o700);
      rmSync(left2, { recursive: true, force: true });
    }
  });
});

describe("hosting/F74 interface and hosting/N10 footprint", () => {
  it("hosting/T133: list and scratch are exported and declared, no runtime dependency is added, node:test is not loaded", () => {
    assert.equal(typeof hosting.list, "function");
    assert.equal(typeof hosting.scratch, "function");
    const contract = readFileSync(join(PACKAGE, "00-changes", "interface", "architecture.md"), "utf8");
    assert.match(contract, /`list`/, "the interface declares list");
    assert.match(contract, /`scratch`/, "the interface declares scratch");
    const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.deepEqual(Object.keys(pkg.dependencies).sort(), ["cross-spawn", "es-module-lexer", "graceful-fs", "proper-lockfile", "typescript"]);
    assert.equal(statSync(join(PACKAGE, "dist/skills/kaal-hosting/scripts", "index.js")).isFile(), true);
    assert.ok(!/node:test/.test(readFileSync(join(PACKAGE, "dist/skills/kaal-hosting/scripts", "index.js"), "utf8")), "the main entry does not load node:test");
  });
});
