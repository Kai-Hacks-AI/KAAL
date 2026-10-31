// Conformance: the guarantees Hosting gives KAAL, checked on whichever host
// runs this suite. CI runs it on Linux, Windows and macOS.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import gfs from "graceful-fs";
import { contribution, execute, HostingError, initialize, kind, read, readFile, reconcile, update, within } from "@kaihacksai/kaal-hosting";
import { facts, specialEntries } from "@kaihacksai/kaal-hosting/fixtures";

const run = promisify(execFile);
/** The package under test, reached by its name as a consumer reaches it. */
const hosting = import.meta.resolve("@kaihacksai/kaal-hosting");
const installed = dirname(fileURLToPath(import.meta.resolve("@kaihacksai/kaal-hosting/package.json")));

function tmp() {
  return mkdtempSync(join(tmpdir(), "kaal-hosting-"));
}

/** A directory in a parent of its own, so whatever Hosting leaves beside it shows. */
function alone() {
  const parent = tmp();
  const dir = join(parent, "d");
  mkdirSync(dir);
  return { parent, dir };
}

/** Make the host refuse every rename while `fn` runs. */
async function renamesFail(fn) {
  const original = gfs.rename;
  gfs.rename = ((_from, _to, cb) => cb(Object.assign(new Error("EPERM: refused"), { code: "EPERM" })));
  try {
    return await fn();
  } finally {
    gfs.rename = original;
  }
}

function files(entries) {
  return Object.fromEntries(Object.entries(entries).map(([p, s]) => [p, Buffer.from(s)]));
}

function code(c) {
  return (e) => e instanceof HostingError && e.code === c;
}

async function snapshot(dir) {
  const all = await read(dir);
  return JSON.stringify(Object.keys(all).sort().map((p) => [p, all[p].toString("base64")]));
}

describe("read [hosting/F45, hosting/F54]", () => {
  it("reads every file by relative path, and a missing directory as empty", async () => {
    const dir = tmp();
    mkdirSync(join(dir, "a", "b"), { recursive: true });
    writeFileSync(join(dir, "top.md"), "1");
    writeFileSync(join(dir, "a", "b", "deep.md"), "2");
    assert.deepEqual(await read(dir), files({ "top.md": "1", "a/b/deep.md": "2" }));
    assert.deepEqual(await read(join(dir, "missing")), {});
  });

  it("leaves nothing out by its name", async () => {
    const dir = tmp();
    mkdirSync(join(dir, ".staging-x"));
    writeFileSync(join(dir, ".staging-x", "kept.md"), "k");
    writeFileSync(join(dir, ".staging-notes.md"), "n");
    mkdirSync(join(dir, "d.lock"));
    writeFileSync(join(dir, "d.lock", "kept.md"), "l");
    assert.deepEqual(await read(dir), files({ ".staging-x/kept.md": "k", ".staging-notes.md": "n", "d.lock/kept.md": "l" }));
  });

  it("reads and publishes a file named __proto__ like any other", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "__proto__"), "p");
    assert.deepEqual(Object.keys(await read(dir)), ["__proto__"]);
    await update(dir, () => ({ prefix: "skills/odd", files: files({ ["__proto__"]: "q" }) }));
    assert.deepEqual(Object.keys(await read(dir)).sort(), ["__proto__", "skills/odd/__proto__"]);
  });

  it("reads a link to a file as that file, and refuses a link to a directory", async () => {
    const dir = tmp();
    const outside = tmp();
    writeFileSync(join(outside, "real.md"), "r");
    symlinkSync(join(outside, "real.md"), join(dir, "linked.md"), "file");
    assert.deepEqual(await read(dir), files({ "linked.md": "r" }));
    symlinkSync(outside, join(dir, "elsewhere"), "junction");
    await assert.rejects(read(dir), code("INVALID_PATH"));
  });
});

describe("readFile [hosting/F46]", () => {
  it("reads a file's exact bytes: empty, every byte value, and a non-ASCII NFC name", async () => {
    const dir = tmp();
    const every = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
    const name = "café-ü-日本.md".normalize("NFC");
    writeFileSync(join(dir, "empty"), Buffer.alloc(0));
    writeFileSync(join(dir, "bytes.bin"), every);
    writeFileSync(join(dir, name), "n");
    assert.deepEqual(await readFile(join(dir, "empty")), Buffer.alloc(0));
    assert.deepEqual(await readFile(join(dir, "bytes.bin")), every);
    assert.deepEqual(await readFile(join(dir, name)), Buffer.from("n"));
  });

  it("reads a link to a file as that file", async () => {
    const dir = tmp();
    const outside = tmp();
    writeFileSync(join(outside, "real.md"), "r");
    symlinkSync(join(outside, "real.md"), join(dir, "linked.md"), "file");
    assert.deepEqual(await readFile(join(dir, "linked.md")), Buffer.from("r"));
  });

  it("refuses a directory and a link to one with NOT_FILE", async () => {
    const dir = tmp();
    const outside = tmp();
    symlinkSync(outside, join(dir, "elsewhere"), "junction");
    await assert.rejects(readFile(dir), code("NOT_FILE"));
    await assert.rejects(readFile(join(dir, "elsewhere")), code("NOT_FILE"));
  });

  it("refuses a cycle of links with NOT_FILE", async () => {
    const dir = tmp();
    symlinkSync(join(dir, "b.md"), join(dir, "a.md"), "file");
    symlinkSync(join(dir, "a.md"), join(dir, "b.md"), "file");
    await assert.rejects(readFile(join(dir, "a.md")), code("NOT_FILE"));
  });

  it("refuses a missing path with MISSING: below a missing directory, below a file, and through a dangling link", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "file.md"), "f");
    writeFileSync(join(dir, "gone.md"), "g");
    symlinkSync(join(dir, "gone.md"), join(dir, "dangling.md"), "file");
    rmSync(join(dir, "gone.md"));
    await assert.rejects(readFile(join(dir, "missing.md")), code("MISSING"));
    await assert.rejects(readFile(join(dir, "missing", "x.md")), code("MISSING"));
    await assert.rejects(readFile(join(dir, "file.md", "x.md")), code("MISSING"));
    await assert.rejects(readFile(join(dir, "dangling.md")), code("MISSING"));
  });

  it("agrees with read for every file of a tree", async () => {
    const dir = tmp();
    const outside = tmp();
    mkdirSync(join(dir, "a", "b"), { recursive: true });
    writeFileSync(join(dir, "top.md"), "1");
    writeFileSync(join(dir, "a", "b", "deep.bin"), Buffer.from([0, 255, 13, 10]));
    writeFileSync(join(dir, "a", "ü.md".normalize("NFC")), "u");
    writeFileSync(join(outside, "real.md"), "r");
    symlinkSync(join(outside, "real.md"), join(dir, "a", "linked.md"), "file");
    const tree = await read(dir);
    assert.equal(Object.keys(tree).length, 4);
    for (const [path, bytes] of Object.entries(tree)) assert.deepEqual(await readFile(join(dir, ...path.split("/"))), bytes, path);
  });
});

describe("kind [hosting/F47]", () => {
  it("tells a directory from a file", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "file.md"), "f");
    assert.equal(await kind(dir), "directory");
    assert.equal(await kind(join(dir, "file.md")), "file");
  });

  it("follows a link: to a directory, a junction included, and to a file", async () => {
    const dir = tmp();
    const outside = tmp();
    writeFileSync(join(outside, "real.md"), "r");
    symlinkSync(outside, join(dir, "elsewhere"), "junction");
    symlinkSync(join(outside, "real.md"), join(dir, "linked.md"), "file");
    assert.equal(await kind(join(dir, "elsewhere")), "directory");
    assert.equal(await kind(join(dir, "linked.md")), "file");
  });

  it("finds nothing below a missing directory, below a file, or through a dangling link, as readFile does", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "file.md"), "f");
    writeFileSync(join(dir, "gone.md"), "g");
    symlinkSync(join(dir, "gone.md"), join(dir, "dangling.md"), "file");
    rmSync(join(dir, "gone.md"));
    for (const path of [join(dir, "missing"), join(dir, "missing", "x.md"), join(dir, "file.md", "x.md"), join(dir, "dangling.md")]) {
      assert.equal(await kind(path), "missing", path);
      await assert.rejects(readFile(path), code("MISSING"));
    }
  });

  it("reports a cycle of links as other: it exists, but leads to nothing", async () => {
    const dir = tmp();
    symlinkSync(join(dir, "b"), join(dir, "a"), "file");
    symlinkSync(join(dir, "a"), join(dir, "b"), "file");
    assert.equal(await kind(join(dir, "a")), "other");
  });

  it("reports a FIFO and a socket as other, wherever the host can hold them in a tree", async () => {
    // Whether the host can hold them is established by trying, as kaal-hosting/special-entries;
    // where it cannot, the fixture makes nothing and says why, with the same evidence as facts().
    const fact = (await facts())["kaal-hosting/special-entries"];
    const made = await specialEntries(tmp());
    assert.equal(made.holds, fact.holds);
    if (!made.holds) {
      assert.deepEqual([made.reason, made.evidence], [fact.reason, fact.evidence]);
      return;
    }
    try {
      assert.equal(await kind(made.fifo), "other");
      assert.equal(await kind(made.socket), "other");
    } finally {
      await made.close();
    }
  });

  it("throws a failure to look, never taking it for an answer", async () => {
    const original = gfs.stat;
    gfs.stat = ((_path, cb) => cb(Object.assign(new Error("EACCES: permission denied"), { code: "EACCES" })));
    try {
      await assert.rejects(kind(tmp()), (e) => e.code === "EACCES");
    } finally {
      gfs.stat = original;
    }
  });

  it("throws a permission the host denies, and answers where the host grants it", async () => {
    // Whether the host denies it is established by trying: some hosts ignore these modes, and a
    // privileged user passes them. Either way, kind never takes a denial for an answer.
    const dir = tmp();
    mkdirSync(join(dir, "closed"));
    writeFileSync(join(dir, "closed", "x.md"), "x");
    chmodSync(join(dir, "closed"), 0o000);
    try {
      let denied;
      try {
        readdirSync(join(dir, "closed"));
        denied = false;
      } catch (e) {
        denied = e.code === "EACCES" || e.code === "EPERM";
      }
      if (denied) await assert.rejects(kind(join(dir, "closed", "x.md")), (e) => e.code === "EACCES" || e.code === "EPERM");
      else assert.equal(await kind(join(dir, "closed", "x.md")), "file");
    } finally {
      chmodSync(join(dir, "closed"), 0o700);
    }
  });
});

describe("within [hosting/F48]", () => {
  /** A root and a sibling whose name starts with the root's, in a parent of their own. */
  function tree() {
    const parent = tmp();
    const root = join(parent, "repo");
    const sibling = join(parent, "repo2");
    mkdirSync(join(root, "a", "b"), { recursive: true });
    mkdirSync(sibling);
    writeFileSync(join(root, "a", "file.md"), "f");
    return { parent, root, sibling };
  }

  it("holds the root itself and everything below it, a file included", async () => {
    const { root } = tree();
    assert.equal(await within(root, root), true);
    assert.equal(await within(root, join(root, "a", "b")), true);
    assert.equal(await within(root, join(root, "a", "file.md")), true);
  });

  it("compares whole segments: a sibling sharing the root's name as a prefix is outside", async () => {
    const { root, sibling, parent } = tree();
    assert.equal(await within(root, sibling), false);
    assert.equal(await within(root, parent), false);
  });

  it("resolves .. before comparing", async () => {
    const { root, sibling } = tree();
    assert.equal(await within(root, join(root, "a", "..", "a", "b")), true);
    assert.equal(await within(root, join(root, "..", "repo2")), false);
    assert.equal(await within(root, join(sibling, "..", "repo", "a")), true);
  });

  it("follows links: one inside pointing out is outside, one outside pointing in is inside", async () => {
    const { root, parent } = tree();
    const outside = tmp();
    writeFileSync(join(outside, "real.md"), "r");
    symlinkSync(outside, join(root, "escape"), "junction");
    symlinkSync(join(outside, "real.md"), join(root, "a", "linked.md"), "file");
    symlinkSync(root, join(parent, "alias"), "junction");
    assert.equal(await within(root, join(root, "escape")), false);
    assert.equal(await within(root, join(root, "a", "linked.md")), false);
    assert.equal(await within(root, join(parent, "alias", "a")), true);
    assert.equal(await within(join(parent, "alias"), join(root, "a")), true);
  });

  it("refuses a missing path, a dangling link and a cycle of links, root or candidate", async () => {
    const { root } = tree();
    writeFileSync(join(root, "gone.md"), "g");
    symlinkSync(join(root, "gone.md"), join(root, "dangling.md"), "file");
    rmSync(join(root, "gone.md"));
    symlinkSync(join(root, "y"), join(root, "x"), "file");
    symlinkSync(join(root, "x"), join(root, "y"), "file");
    for (const path of [join(root, "missing"), join(root, "a", "file.md", "below"), join(root, "dangling.md"), join(root, "x")]) {
      await assert.rejects(within(root, path), code("MISSING"), path);
      await assert.rejects(within(path, root), code("MISSING"), path);
    }
  });

  it("throws a failure to resolve, never taking it for an answer", async () => {
    const { root } = tree();
    const original = gfs.realpath.native;
    gfs.realpath.native = ((_path, cb) =>
      cb(Object.assign(new Error("EACCES: permission denied"), { code: "EACCES" })));
    try {
      await assert.rejects(within(root, root), (e) => e.code === "EACCES");
    } finally {
      gfs.realpath.native = original;
    }
  });
});

// The outer tests of reconcile are in test/acceptance/requirements.test.mjs.
// These are its Code tests.
describe("reconcile", () => {
  it("refuses a path that is both a file and a directory of one reconciliation", async () => {
    const { dir } = alone();
    const before = await snapshot(dir);
    const write = (path) => ({ path, expect: "absent", bytes: Buffer.from("x") });
    await assert.rejects(reconcile(dir, { write: [write("a"), write("a/b.md")], remove: [] }), code("INVALID_PATH"));
    assert.equal(await snapshot(dir), before);
  });

  it("refuses a kind change whose write does not expect \"absent\", before looking at the host", async () => {
    const sha = (text) => createHash("sha256").update(text).digest("hex");
    const { dir } = alone();
    writeFileSync(join(dir, "tool"), "a tool");
    mkdirSync(join(dir, "lib"));
    writeFileSync(join(dir, "lib", "a.md"), "a");
    writeFileSync(join(dir, "old"), "old");
    const before = await snapshot(dir);
    const cases = [
      // File to directory, with a write under the removed file that expects bytes.
      { write: [{ path: "tool/run", expect: sha("run"), bytes: Buffer.from("run") }], remove: [{ path: "tool", expect: sha("a tool") }] },
      // Directory to file, with the write expecting bytes where the directory is.
      { write: [{ path: "lib", expect: sha("lib"), bytes: Buffer.from("lib") }], remove: [{ path: "lib/a.md", expect: sha("a") }] },
      // Directory to file, where the write's expectation holds but a file is no directory.
      { write: [{ path: "old", expect: sha("old"), bytes: Buffer.from("new") }], remove: [{ path: "old/a.md", expect: sha("a") }] },
    ];
    for (const reconciliation of cases) await assert.rejects(reconcile(dir, reconciliation), code("INVALID_PATH"), JSON.stringify(reconciliation));
    assert.equal(await snapshot(dir), before);
  });

  it("refuses with a HostingError that carries every failed precondition", async () => {
    const { dir } = alone();
    await assert.rejects(reconcile(dir, { write: [], remove: [{ path: "x.md", expect: "0".repeat(64) }] }), (e) => {
      assert.ok(e instanceof HostingError && e.code === "STALE");
      assert.deepEqual(e.findings, [{ path: "x.md", expected: "0".repeat(64), found: "absent" }]);
      return true;
    });
  });

  it("changes nothing when the host does not hold the staged bytes exactly", async () => {
    const { parent, dir } = alone();
    writeFileSync(join(dir, "a.md"), "a");
    const before = await snapshot(dir);
    const original = gfs.readFile;
    gfs.readFile = ((path, ...rest) => {
      const cb = rest.at(-1);
      if (String(path).includes(".staging-")) return cb(null, Buffer.from("not what was written"));
      return (original)(path, ...rest);
    });
    try {
      await assert.rejects(reconcile(dir, { write: [{ path: "a.md", expect: createHash("sha256").update("a").digest("hex"), bytes: Buffer.from("b") }], remove: [] }), code("UNFAITHFUL"));
    } finally {
      gfs.readFile = original;
    }
    assert.equal(await snapshot(dir), before);
    assert.deepEqual(readdirSync(parent), ["d"]);
  });

  it("keeps what it moved aside, never deleting it, when even the restore fails", async () => {
    const { parent, dir } = alone();
    writeFileSync(join(dir, "precious.md"), "precious");
    const original = gfs.rename;
    let calls = 0;
    gfs.rename = ((from, to, cb) =>
      ++calls === 1 ? original(from, to, cb) : cb(Object.assign(new Error("EPERM: refused"), { code: "EPERM" })));
    try {
      await assert.rejects(
        reconcile(dir, {
          write: [{ path: "new.md", expect: "absent", bytes: Buffer.from("new") }],
          remove: [{ path: "precious.md", expect: createHash("sha256").update("precious").digest("hex") }],
        }),
        (e) => e instanceof HostingError && e.code === "UNRESTORED" && (e.cause).code === "EPERM",
      );
    } finally {
      gfs.rename = original;
    }
    const aside = readdirSync(parent).filter((name) => name.startsWith("d.aside-"));
    assert.equal(aside.length, 1);
    assert.deepEqual(readdirSync(join(parent, aside[0])), ["precious.md"]);
    assert.equal(readFileSync(join(parent, aside[0], "precious.md"), "utf8"), "precious");
  });
});

describe("update [hosting/F49]", () => {
  it("publishes a change as a new directory, all at once, leaving nothing else inside or beside", async () => {
    const { parent, dir } = alone();
    const change = { prefix: "skills/greeting", files: files({ "Greeting.md": "g", "docs/.staging-v1.md": "d" }) };
    assert.deepEqual(await update(dir, () => change), change);
    assert.deepEqual(await read(dir), files({ "skills/greeting/Greeting.md": "g", "skills/greeting/docs/.staging-v1.md": "d" }));
    assert.deepEqual(readdirSync(dir), ["skills"]);
    assert.deepEqual(readdirSync(parent), ["d"]);
  });

  it("restores the whole directory, created parents included, when the final rename fails", async () => {
    const { parent, dir } = alone();
    mkdirSync(join(dir, "skills"));
    await assert.rejects(renamesFail(() => update(dir, () => ({ prefix: "skills/a/b", files: files({ "x.md": "1" }) }))), /EPERM/);
    await assert.rejects(renamesFail(() => update(dir, () => ({ prefix: "new/c", files: files({ "x.md": "1" }) }))), /EPERM/);
    assert.deepEqual(readdirSync(dir), ["skills"]);
    assert.deepEqual(readdirSync(join(dir, "skills")), []);
    assert.deepEqual(readdirSync(parent), ["d"]);
  });

  it("gives the plan the directory as it is, and writes nothing when the plan declines", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "a.md"), "a");
    const before = await snapshot(dir);
    let seen;
    assert.equal(await update(dir, (current) => ((seen = current), undefined)), undefined);
    assert.deepEqual(seen, files({ "a.md": "a" }));
    assert.equal(await snapshot(dir), before);
  });

  it("refuses a prefix that already exists, writing nothing", async () => {
    const dir = tmp();
    await update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "1" }) }));
    const before = await snapshot(dir);
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "b.md": "2" }) })), code("EXISTS"));
    assert.equal(await snapshot(dir), before);
  });

  it("leaves the directory unchanged when publication fails", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "skills"), "a file where the directory would go");
    const before = await snapshot(dir);
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "1" }) })));
    assert.equal(await snapshot(dir), before);
    assert.deepEqual(readdirSync(dir), ["skills"]);
  });

  it("refuses a prefix reached through a symbolic link, writing nothing outside", async () => {
    const dir = tmp();
    const outside = tmp();
    symlinkSync(outside, join(dir, "skills"), "junction");
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "1" }) })), code("INVALID_PATH"));
    assert.deepEqual(readdirSync(outside), []);
  });

  it("propagates a refusal from the plan, writing nothing", async () => {
    const dir = tmp();
    await assert.rejects(update(dir, () => { throw new Error("not admitted"); }), /not admitted/);
    assert.deepEqual(readdirSync(dir), []);
  });
});

describe("faithful publication on every host [hosting/F53]", () => {
  const collisions = [
    ["names differing only in case", { "A.md": "1", "a.md": "2" }],
    ["directories differing only in case", { "Docs/x.md": "1", "docs/y.md": "2" }],
    ["NFC and NFD spellings of one name", { "café.md": "1", "café.md": "2" }],
    ["final sigma and sigma, which case folding equates", { "ος.md": "1", "οσ.md": "2" }],
  ];
  for (const [label, entries] of collisions) {
    it(`refuses ${label}, writing nothing`, async () => {
      const dir = tmp();
      await assert.rejects(update(dir, () => ({ prefix: "skills/c", files: files(entries) })), code("COLLISION"));
      assert.deepEqual(readdirSync(dir), []);
    });
  }

  it("refuses a new path that collapses onto an existing one", async () => {
    const dir = tmp();
    await update(dir, () => ({ prefix: "skills/Greeting", files: files({ "a.md": "1" }) }));
    const before = await snapshot(dir);
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "2" }) })), code("COLLISION"));
    assert.equal(await snapshot(dir), before);
  });

  it("refuses a new path that collapses onto an existing empty directory", async () => {
    const dir = tmp();
    mkdirSync(join(dir, "Skills"));
    await assert.rejects(update(dir, () => ({ prefix: "skills/greeting", files: files({ "a.md": "1" }) })), code("COLLISION"));
    assert.deepEqual(readdirSync(dir), ["Skills"]);
  });

  const invalid = ["../escape.md", "/abs.md", "a//b.md", "con.md", "aux", "x:y.md", "trailing.", "q?.md", "back\\slash.md"];
  for (const path of invalid) {
    it(`refuses the non-portable path ${JSON.stringify(path)}, writing nothing`, async () => {
      const dir = tmp();
      await assert.rejects(update(dir, () => ({ prefix: "skills/c", files: files({ [path]: "1" }) })), code("INVALID_PATH"));
      assert.deepEqual(readdirSync(dir), []);
    });
  }
});

describe("initialize [hosting/F50]", () => {
  const payload = files({ "KERNEL.md": "k", "core/Node.md": "n" });

  it("creates a missing directory whole", async () => {
    const dir = join(tmp(), "engine");
    assert.deepEqual(await initialize(dir, payload), ["KERNEL.md", "core/Node.md"]);
    assert.deepEqual(await read(dir), payload);
  });

  it("leaves an empty directory empty, and nothing beside it, when a move fails", async () => {
    const { parent, dir } = alone();
    await assert.rejects(renamesFail(() => initialize(dir, payload)), /EPERM/);
    assert.deepEqual(readdirSync(dir), []);
    assert.deepEqual(readdirSync(parent), ["d"]);
  });

  it("fills an empty current directory in place, never removing it", async () => {
    const dir = join(tmp(), "here");
    mkdirSync(dir);
    const cwd = process.cwd();
    process.chdir(dir);
    try {
      await initialize(".", payload);
      assert.deepEqual(await read("."), payload, "the current directory itself holds the files");
    } finally {
      process.chdir(cwd);
    }
  });

  it("refuses a directory that is not empty, writing nothing", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "notes.txt"), "someone else's");
    await assert.rejects(initialize(dir, payload), code("NOT_EMPTY"));
    assert.deepEqual(readdirSync(dir), ["notes.txt"]);
  });

  it("refuses colliding paths before touching the directory", async () => {
    const dir = join(tmp(), "engine");
    await assert.rejects(initialize(dir, files({ "A.md": "1", "a.md": "2" })), code("COLLISION"));
    assert.ok(!existsSync(dir));
  });
});

describe("one writer at a time, across processes [hosting/F49, hosting/A21]", () => {
  it("serializes concurrent updates, whatever path names the directory: each plan sees every earlier change", async () => {
    const dir = tmp();
    const link = join(tmp(), "link");
    symlinkSync(dir, link, "junction");
    const script = (at) => `
      import { update } from ${JSON.stringify(hosting)};
      const change = await update(${JSON.stringify(at)}, async (current) => {
        const n = Object.keys(current).length;
        await new Promise((r) => setTimeout(r, 30));
        return { prefix: "p" + n, files: { "f.md": Buffer.from(String(n)) } };
      });
      console.log(change.prefix);`;
    const writers = 6;
    const outs = await Promise.all(Array.from({ length: writers }, (_, i) => run(process.execPath, ["--input-type=module", "-e", script(i % 2 ? link : dir)])));
    const prefixes = outs.map((o) => o.stdout.trim()).sort();
    assert.deepEqual(prefixes, Array.from({ length: writers }, (_, i) => `p${i}`).sort());
    assert.equal(Object.keys(await read(dir)).length, writers);
    assert.ok(!existsSync(`${dir}.lock`) && !existsSync(`${link}.lock`), "the lock is released");
  });
});

describe("execute [hosting/F51]", () => {
  it("runs a command found on the PATH, however the host realizes it", async () => {
    const r = await execute("npm", ["--version"], { cwd: tmp() });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /^\d+\.\d+\.\d+/);
  });

  it("runs an installed package's command with its arguments exactly as given", async () => {
    const pkg = tmp();
    writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "echo-args", version: "1.0.0", bin: { "echo-args": "echo.js" } }));
    writeFileSync(join(pkg, "echo.js"), "#!/usr/bin/env node\nprocess.stdout.write(JSON.stringify(process.argv.slice(2)));\n");
    const host = tmp();
    writeFileSync(join(host, "package.json"), JSON.stringify({ name: "host", version: "1.0.0", private: true }));
    const installed = await execute("npm", ["install", "--offline", "--no-audit", "--no-fund", "--no-package-lock", pkg], { cwd: host });
    assert.equal(installed.status, 0, installed.stderr);
    const args = ["plain", "two words", '"quoted"', "it's", "%PATH%", "$HOME", "a&b", "a|b", "a^b", "<in>", "semi;colon", "back\\slash\\", ""];
    const r = await execute(join(host, "node_modules", ".bin", "echo-args"), args, { cwd: host });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout), args);
  });

  it("reports a failing command's status and output", async () => {
    const r = await execute(process.execPath, ["-e", "process.stdout.write('out'); process.stderr.write('err'); process.exit(3)"], { cwd: tmp() });
    assert.deepEqual(r, { status: 3, stdout: "out", stderr: "err" });
  });

  it("rejects a command that cannot be started", async () => {
    await assert.rejects(execute("kaal-hosting-no-such-command", [], { cwd: tmp() }), /ENOENT/);
  });
});

describe("Hosting's Extension Node [hosting/F52]", () => {
  it("is carried as Hosting.md, typed by KAAL Extension", async () => {
    const c = await contribution();
    assert.deepEqual(Object.keys(c), ["Hosting.md"]);
    const text = c["Hosting.md"].toString("utf8");
    assert.match(text, /^---\nname: Hosting\ntype:\n  name: KAAL Extension\n  id: [0-9a-f]{64}\n---\n/);
    assert.equal(text, readFileSync(join(installed, "payload", "Hosting.md"), "utf8"));
  });
});
