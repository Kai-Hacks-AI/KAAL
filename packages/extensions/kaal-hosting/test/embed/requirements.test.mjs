// The Requirements loop: each case checks Requirements of Guarded File Reconciliation (docs/requirements.md)
// against the installed package, reached by its name. Each case works in a directory of its own in the
// operating system's temporary directory, and uses graceful-fs (hosting/A2) only to make the host fail.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { describe, it } from "node:test";
import gfs from "graceful-fs";
import { reconcile } from "@kaihacksai/kaal-hosting";

describe("Guarded File Reconciliation", () => {
  /** Hosting's reconcile, or the reason the tests are blocked before any behavioural assertion. */
  async function hosting() {
    const module = await import("@kaihacksai/kaal-hosting");
    if (typeof module.reconcile !== "function") assert.fail("blocked before behavioural assertion: Hosting exports no reconcile");
    return module;
  }

  const sha = (text) => createHash("sha256").update(Buffer.from(text)).digest("hex");
  const bytes = (text) => Buffer.from(text);
  const posixModes = process.platform !== "win32";

  /** A root in a parent of its own, so whatever a reconciliation leaves beside it shows. */
  function alone(files = {}) {
    const parent = mkdtempSync(join(tmpdir(), "kaal-reconcile-"));
    const root = join(parent, "root");
    mkdirSync(root);
    for (const [path, text] of Object.entries(files)) {
      const at = join(root, ...path.split("/"));
      if (path.endsWith("/")) mkdirSync(at, { recursive: true });
      else {
        mkdirSync(join(at, ".."), { recursive: true });
        writeFileSync(at, text);
      }
    }
    return { parent, root };
  }

  /** Every directory and file under `dir`, links unfollowed, with each file's bytes and executable mark. */
  function snapshot(dir, rel = "", into = {}) {
    for (const name of readdirSync(dir).sort()) {
      const path = rel ? `${rel}/${name}` : name;
      const entry = lstatSync(join(dir, name));
      if (entry.isSymbolicLink()) into[path] = "link";
      else if (entry.isDirectory()) {
        into[`${path}/`] = "directory";
        snapshot(join(dir, name), path, into);
      } else into[path] = `${readFileSync(join(dir, name)).toString("base64")}${posixModes && entry.mode & 0o111 ? " x" : ""}`;
    }
    return into;
  }

  function code(c) {
    return (e) => e?.name === "HostingError" && e.code === c;
  }

  it("hosting/T1 [hosting/I1, hosting/F1, hosting/F2, hosting/F9]: guarded writes and removals apply together, and the report names every outcome in path order", async () => {
    const { reconcile } = await hosting();
    const { root } = alone({ "keep.md": "keep", "old.md": "old", "gone.md": "gone" });
    const report = await reconcile(root, {
      write: [
        { path: "sub/deep.md", expect: "absent", bytes: bytes("deep") },
        { path: "old.md", expect: sha("old"), bytes: bytes("old 2") },
        { path: "new.md", expect: "absent", bytes: bytes("new") },
      ],
      remove: [{ path: "gone.md", expect: sha("gone") }],
    });
    assert.deepEqual(report, {
      outcomes: [
        { path: "gone.md", outcome: "removed" },
        { path: "new.md", outcome: "written" },
        { path: "old.md", outcome: "written" },
        { path: "sub/deep.md", outcome: "written" },
      ],
      pruned: [],
    });
    assert.deepEqual(snapshot(root), {
      "keep.md": bytes("keep").toString("base64"),
      "new.md": bytes("new").toString("base64"),
      "old.md": bytes("old 2").toString("base64"),
      "sub/": "directory",
      "sub/deep.md": bytes("deep").toString("base64"),
    });
  });

  it("hosting/T2 [hosting/I1, hosting/F2, hosting/F3]: one failing precondition refuses the whole reconciliation with STALE, lists every failing path, and leaves the root byte for byte as it was", async () => {
    const { reconcile } = await hosting();
    const { root } = alone({ "present.md": "here", "changed.md": "changed by someone", "dir/inside.md": "i", "fine.md": "fine" });
    const before = snapshot(root);
    await assert.rejects(
      reconcile(root, {
        write: [
          { path: "present.md", expect: "absent", bytes: bytes("x") },
          { path: "missing.md", expect: sha("expected"), bytes: bytes("x") },
          { path: "dir", expect: "absent", bytes: bytes("x") },
          { path: "fine.md", expect: sha("fine"), bytes: bytes("would apply") },
        ],
        remove: [{ path: "changed.md", expect: sha("as written") }],
      }),
      (e) => {
        assert.ok(code("STALE")(e), String(e));
        assert.deepEqual(e.findings, [
          { path: "changed.md", expected: sha("as written"), found: sha("changed by someone") },
          { path: "dir", expected: "absent", found: "not a file" },
          { path: "missing.md", expected: sha("expected"), found: "absent" },
          { path: "present.md", expected: "absent", found: sha("here") },
        ]);
        return true;
      },
    );
    assert.deepEqual(snapshot(root), before);
  });

  it("hosting/T3 [hosting/I2, hosting/F6]: a failure while applying restores the root exactly, and leaves nothing beside it", async () => {
    const { reconcile } = await hosting();
    const files = { "a.md": "a", "b/b.md": "b", "c/c.md": "c" };
    const reconciliation = () => ({
      write: [
        { path: "a.md", expect: sha("a"), bytes: bytes("a 2") },
        { path: "n/new.md", expect: "absent", bytes: bytes("new") },
      ],
      remove: [
        { path: "b/b.md", expect: sha("b") },
        { path: "c/c.md", expect: sha("c") },
      ],
    });
    const original = gfs.rename;
    let failed = 0;
    for (let k = 1; k <= 64; k++) {
      const { parent, root } = alone(files);
      const before = snapshot(root);
      let calls = 0;
      gfs.rename = (from, to, cb) => (++calls === k ? cb(Object.assign(new Error("EPERM: refused"), { code: "EPERM" })) : original(from, to, cb));
      let outcome;
      try {
        outcome = await reconcile(root, reconciliation()).then(
          () => "applied",
          () => "failed",
        );
      } finally {
        gfs.rename = original;
      }
      assert.deepEqual(readdirSync(parent), ["root"], `rename ${k}`);
      if (outcome === "applied") break;
      failed++;
      assert.deepEqual(snapshot(root), before, `rename ${k}`);
    }
    assert.ok(failed > 0, "no rename failure was exercised");
  });

  it("hosting/T4 [hosting/I3, hosting/F7]: a write marked executable is executable where the host has the mode, a write without it is not, and the mode is no precondition", async () => {
    const { reconcile } = await hosting();
    const { root } = alone({ "tool.sh": "old tool" });
    if (posixModes) chmodSync(join(root, "tool.sh"), 0o755);
    await reconcile(root, {
      write: [
        { path: "hook", expect: "absent", bytes: bytes("#!/bin/sh\n"), executable: true },
        { path: "plain.md", expect: "absent", bytes: bytes("plain") },
        { path: "tool.sh", expect: sha("old tool"), bytes: bytes("new tool") },
      ],
      remove: [],
    });
    assert.equal(readFileSync(join(root, "hook"), "utf8"), "#!/bin/sh\n");
    assert.equal(readFileSync(join(root, "tool.sh"), "utf8"), "new tool");
    if (posixModes) {
      assert.notEqual(statSync(join(root, "hook")).mode & 0o111, 0, "hook is executable");
      assert.equal(statSync(join(root, "plain.md")).mode & 0o111, 0, "plain.md is not executable");
      assert.equal(statSync(join(root, "tool.sh")).mode & 0o111, 0, "tool.sh is no longer executable");
    }
  });

  it("hosting/T5 [hosting/F4]: non-portable, non-relative, colliding and repeated paths are refused before anything is touched", async () => {
    const { reconcile } = await hosting();
    const { root } = alone({ "A.md": "a" });
    const before = snapshot(root);
    const write = (path) => ({ path, expect: "absent", bytes: bytes("x") });
    const cases = [
      [[write("/abs.md")], [], "INVALID_PATH"],
      [[write("../out.md")], [], "INVALID_PATH"],
      [[write("x//y.md")], [], "INVALID_PATH"],
      [[write("con.md")], [], "INVALID_PATH"],
      [[write("trailing.")], [], "INVALID_PATH"],
      [[write("a.md")], [], "COLLISION"],
      [[write("d/F.md"), write("D/f.md")], [], "COLLISION"],
      [[write("café.md"), write("café.md")], [], "COLLISION"],
      [[write("twice.md"), write("twice.md")], [], "INVALID_PATH"],
      [[write("both.md")], [{ path: "both.md", expect: "absent" }], "INVALID_PATH"],
    ];
    for (const [w, r, c] of cases) {
      await assert.rejects(reconcile(root, { write: w, remove: r }), code(c), JSON.stringify(w.map((e) => e.path)));
      assert.deepEqual(snapshot(root), before);
    }
  });

  it("hosting/T6 [hosting/F5]: a link at a path or above it, and a file where a directory is needed, are refused, and nothing outside the root changes", async () => {
    const { reconcile } = await hosting();
    const { root } = alone({ "file.md": "f" });
    const outside = mkdtempSync(join(tmpdir(), "kaal-reconcile-outside-"));
    writeFileSync(join(outside, "real.md"), "real");
    symlinkSync(outside, join(root, "elsewhere"), "junction");
    symlinkSync(join(outside, "real.md"), join(root, "linked.md"), "file");
    const before = snapshot(root);
    const away = snapshot(outside);
    const cases = [
      [{ write: [{ path: "elsewhere/new.md", expect: "absent", bytes: bytes("x") }], remove: [] }, "INVALID_PATH"],
      [{ write: [], remove: [{ path: "elsewhere/real.md", expect: sha("real") }] }, "INVALID_PATH"],
      [{ write: [{ path: "linked.md", expect: sha("real"), bytes: bytes("x") }], remove: [] }, "INVALID_PATH"],
      [{ write: [], remove: [{ path: "linked.md", expect: sha("real") }] }, "INVALID_PATH"],
      [{ write: [{ path: "file.md/below.md", expect: "absent", bytes: bytes("x") }], remove: [] }, "EXISTS"],
    ];
    for (const [reconciliation, c] of cases) {
      await assert.rejects(reconcile(root, reconciliation), code(c), JSON.stringify(reconciliation));
      assert.deepEqual(snapshot(root), before);
      assert.deepEqual(snapshot(outside), away);
    }
  });

  it("hosting/T7 [hosting/F8]: a removal prunes the directories it empties, up to but never including the root, and keeps every other directory", async () => {
    const { reconcile } = await hosting();
    const { root } = alone({ "a/b/only.md": "only", "s/stay.md": "stay", "s/go.md": "go", "empty/": "" });
    const report = await reconcile(root, {
      write: [],
      remove: [
        { path: "a/b/only.md", expect: sha("only") },
        { path: "s/go.md", expect: sha("go") },
      ],
    });
    assert.deepEqual(report.pruned, ["a", "a/b"]);
    assert.deepEqual(snapshot(root), { "empty/": "directory", "s/": "directory", "s/stay.md": bytes("stay").toString("base64") });

    const { root: lone } = alone({ "only.md": "only" });
    const last = await reconcile(lone, { write: [], remove: [{ path: "only.md", expect: sha("only") }] });
    assert.deepEqual(last.pruned, []);
    assert.deepEqual(snapshot(lone), {});
  });

  it("hosting/T8 [hosting/F9]: bytes and mode already in place, and a removal of what is absent, report unchanged", async () => {
    const { reconcile } = await hosting();
    const { root } = alone({ "same.md": "same" });
    const before = snapshot(root);
    const report = await reconcile(root, {
      write: [{ path: "same.md", expect: sha("same"), bytes: bytes("same") }],
      remove: [{ path: "never.md", expect: "absent" }],
    });
    assert.deepEqual(report, {
      outcomes: [
        { path: "never.md", outcome: "unchanged" },
        { path: "same.md", outcome: "unchanged" },
      ],
      pruned: [],
    });
    assert.deepEqual(snapshot(root), before);
  });

  it("hosting/T9 [hosting/N2, hosting/F3]: two reconciliations of one root, made from the same plan at once, serialize: one applies and the other is refused with STALE", async () => {
    const { reconcile } = await hosting();
    const { root } = alone();
    const results = await Promise.allSettled(["one", "two"].map((text) => reconcile(root, { write: [{ path: "x.md", expect: "absent", bytes: bytes(text) }], remove: [] })));
    const applied = results.flatMap((r, i) => (r.status === "fulfilled" ? [["one", "two"][i]] : []));
    const refused = results.filter((r) => r.status === "rejected");
    assert.equal(applied.length, 1);
    assert.equal(refused.length, 1);
    assert.ok(code("STALE")(refused[0].reason), String(refused[0].reason));
    assert.equal(readFileSync(join(root, "x.md"), "utf8"), applied[0]);
  });

  it("hosting/T10 [hosting/F10]: a missing root, or a root that is a file, is refused with MISSING", async () => {
    const { reconcile } = await hosting();
    const { parent, root } = alone({ "f.md": "f" });
    const nothing = { write: [{ path: "x.md", expect: "absent", bytes: bytes("x") }], remove: [] };
    await assert.rejects(reconcile(join(parent, "missing"), nothing), code("MISSING"));
    const before = snapshot(root);
    await assert.rejects(reconcile(join(root, "f.md"), nothing), code("MISSING"));
    assert.deepEqual(readdirSync(parent), ["root"]);
    assert.deepEqual(snapshot(root), before);
  });

  it("hosting/T11 [hosting/N3]: the same root and reconciliation give equal reports", async () => {
    const { reconcile } = await hosting();
    const files = { "a.md": "a", "d/e/f.md": "f", "z.md": "z" };
    const reconciliation = () => ({
      write: [
        { path: "z.md", expect: sha("z"), bytes: bytes("z") },
        { path: "b.md", expect: "absent", bytes: bytes("b") },
      ],
      remove: [
        { path: "d/e/f.md", expect: sha("f") },
        { path: "a.md", expect: sha("a") },
      ],
    });
    const one = await reconcile(alone(files).root, reconciliation());
    const two = await reconcile(alone(files).root, reconciliation());
    assert.deepEqual(one, two);
  });
  it("hosting/T12 [hosting/I2, hosting/F6, hosting/F11]: when the rollback fails too, the refusal is UNRESTORED, never the original failure, and the displaced original is kept with its bytes at its own path in the reported .aside-* location, while nothing staged remains", async () => {
    const { reconcile } = await hosting();
    const files = { "sub/a.md": "precious", "b.md": "b" };
    const reconciliation = () => ({
      write: [{ path: "sub/a.md", expect: sha("precious"), bytes: bytes("new") }],
      remove: [{ path: "b.md", expect: sha("b") }],
    });
    const refused = () => Object.assign(new Error("EPERM: refused"), { code: "EPERM" });
    const original = gfs.rename;

    // A rollback that succeeds rethrows the original failure, and keeps nothing.
    let { parent, root } = alone(files);
    let calls = 0;
    gfs.rename = (from, to, cb) => (++calls === 2 ? cb(refused()) : original(from, to, cb));
    try {
      await assert.rejects(reconcile(root, reconciliation()), (e) => e?.code === "EPERM" && e.name !== "HostingError");
    } finally {
      gfs.rename = original;
    }
    assert.deepEqual(readdirSync(parent), ["root"]);

    // A rollback the host refuses too is UNRESTORED, and the original is kept.
    ({ parent, root } = alone(files));
    calls = 0;
    gfs.rename = (from, to, cb) => (++calls === 1 ? original(from, to, cb) : cb(refused()));
    let error;
    try {
      await reconcile(root, reconciliation()).catch((e) => (error = e));
    } finally {
      gfs.rename = original;
    }
    assert.ok(code("UNRESTORED")(error), `expected UNRESTORED, got ${error}`);
    assert.equal(error.cause?.code, "EPERM");
    assert.equal(typeof error.kept, "string");
    assert.ok(basename(error.kept).startsWith("root.aside-"), error.kept);
    assert.equal(realpathSync.native(join(error.kept, "..")), realpathSync.native(parent));
    assert.deepEqual(readdirSync(parent).sort(), ["root", basename(error.kept)].sort());
    assert.deepEqual(snapshot(error.kept), { "sub/": "directory", "sub/a.md": bytes("precious").toString("base64") });
  });
});

describe("Guarded File Reconciliation: cleanup", () => {
  const sha = (text) => createHash("sha256").update(Buffer.from(text)).digest("hex");
  const bytes = (text) => Buffer.from(text);
  const fail = (code) => Object.assign(new Error(`${code}: refused by the test host`), { code });

  /** A root in a parent of its own, holding `files`. */
  function alone(files) {
    const parent = mkdtempSync(join(tmpdir(), "kaal-cleanup-"));
    const root = join(parent, "root");
    mkdirSync(root);
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(join(root, ...path.split("/"), ".."), { recursive: true });
      writeFileSync(join(root, ...path.split("/")), text);
    }
    return { parent, root };
  }

  /** Run `act` on a host that refuses to remove anything staged or kept aside, and fails the renames `renames` picks. */
  async function refusing(act, renames = () => false) {
    const rm = gfs.rm;
    const rename = gfs.rename;
    let calls = 0;
    gfs.rm = (path, options, cb) => (/\.(staging|aside)-/.test(String(path)) ? cb(fail("EBUSY")) : rm(path, options, cb));
    gfs.rename = (from, to, cb) => (renames(++calls) ? cb(fail("EPERM")) : rename(from, to, cb));
    try {
      return await act().then(
        (value) => ({ value }),
        (error) => ({ error }),
      );
    } finally {
      gfs.rm = rm;
      gfs.rename = rename;
    }
  }

  /** Every leftover is a directory still beside `root`, with the host's refusal; they are in path order. */
  function leftBeside(leftovers, parent, kinds) {
    assert.ok(Array.isArray(leftovers), `expected leftovers, got ${leftovers}`);
    assert.deepEqual(
      leftovers.map((l) => basename(l.path).replace(/-.*$/, "")),
      kinds.map((k) => `root.${k}`),
    );
    assert.deepEqual(
      leftovers.map((l) => l.path),
      leftovers.map((l) => l.path).sort(),
    );
    for (const l of leftovers) {
      assert.equal(realpathSync.native(join(l.path, "..")), realpathSync.native(parent));
      assert.ok(existsSync(l.path), `${l.path} is reported but not there`);
      assert.equal(l.error?.code, "EBUSY");
    }
  }

  it("hosting/T13 [hosting/I2, hosting/F9, hosting/F11, hosting/F12]: when the host refuses to remove the staging and aside directories, the outcome stands and every leftover is reported: an applied reconciliation resolves with its report plus leftovers, a held rollback rejects with the original failure plus leftovers, and a failed rollback rejects with UNRESTORED, its cause and kept intact, plus leftovers", async () => {
    const reconciliation = () => ({
      write: [{ path: "sub/a.md", expect: sha("a"), bytes: bytes("a 2") }],
      remove: [{ path: "b.md", expect: sha("b") }],
    });

    // Applied: the report, with both directories reported as left beside the root.
    let { parent, root } = alone({ "sub/a.md": "a", "b.md": "b" });
    const applied = await refusing(() => reconcile(root, reconciliation()));
    assert.equal(applied.error, undefined, `applied, yet rejected with ${applied.error}`);
    const { leftovers, ...report } = applied.value;
    assert.deepEqual(report, {
      outcomes: [
        { path: "b.md", outcome: "removed" },
        { path: "sub/a.md", outcome: "written" },
      ],
      pruned: [],
    });
    leftBeside(leftovers, parent, ["aside", "staging"]);
    assert.equal(readFileSync(join(root, "sub", "a.md"), "utf8"), "a 2");
    assert.deepEqual(readdirSync(root).sort(), ["sub"]);

    // A rollback that held: the original failure itself, with the leftovers added.
    ({ parent, root } = alone({ "sub/a.md": "a", "b.md": "b" }));
    const held = await refusing(
      () => reconcile(root, reconciliation()),
      (k) => k === 2,
    );
    assert.equal(held.error?.code, "EPERM", `expected the original EPERM, got ${held.error}`);
    assert.match(held.error.message, /refused by the test host/);
    leftBeside(held.error.leftovers, parent, ["aside", "staging"]);
    assert.equal(readFileSync(join(root, "sub", "a.md"), "utf8"), "a");
    assert.equal(readFileSync(join(root, "b.md"), "utf8"), "b");

    // A rollback that failed: UNRESTORED, cause and kept intact, the leftovers added; kept is no leftover.
    ({ parent, root } = alone({ "sub/a.md": "a", "b.md": "b" }));
    const unrestored = await refusing(
      () => reconcile(root, reconciliation()),
      (k) => k > 1,
    );
    assert.equal(unrestored.error?.name, "HostingError", `expected UNRESTORED, got ${unrestored.error}`);
    assert.equal(unrestored.error.code, "UNRESTORED");
    assert.equal(unrestored.error.cause?.code, "EPERM");
    assert.equal(readFileSync(join(unrestored.error.kept, "sub", "a.md"), "utf8"), "a");
    leftBeside(unrestored.error.leftovers, parent, ["staging"]);
  });
});

describe("Guarded File Reconciliation: kinds", () => {
  const sha = (text) => createHash("sha256").update(Buffer.from(text)).digest("hex");
  const bytes = (text) => Buffer.from(text);
  const b64 = (text) => bytes(text).toString("base64");

  /** A root in a parent of its own; a trailing "/" key makes an empty directory. */
  function alone(files) {
    const parent = mkdtempSync(join(tmpdir(), "kaal-kinds-"));
    const root = join(parent, "root");
    mkdirSync(root);
    for (const [path, text] of Object.entries(files)) {
      const at = join(root, ...path.split("/"));
      if (path.endsWith("/")) mkdirSync(at, { recursive: true });
      else {
        mkdirSync(join(at, ".."), { recursive: true });
        writeFileSync(at, text);
      }
    }
    return { parent, root };
  }

  /** Every directory and file under `dir`, links unfollowed, with each file's bytes. */
  function snapshot(dir, rel = "", into = {}) {
    for (const name of readdirSync(dir).sort()) {
      const path = rel ? `${rel}/${name}` : name;
      const entry = lstatSync(join(dir, name));
      if (entry.isSymbolicLink()) into[path] = "link";
      else if (entry.isDirectory()) {
        into[`${path}/`] = "directory";
        snapshot(join(dir, name), path, into);
      } else into[path] = readFileSync(join(dir, name)).toString("base64");
    }
    return into;
  }

  const code = (c) => (e) => e?.name === "HostingError" && e.code === c;

  const toDirectory = {
    files: { "tool": "a tool", "keep.md": "keep" },
    reconciliation: () => ({
      write: [{ path: "tool/run", expect: "absent", bytes: bytes("run") }],
      remove: [{ path: "tool", expect: sha("a tool") }],
    }),
  };
  const toFile = {
    files: { "lib/a.md": "a", "lib/b/c.md": "c", "keep.md": "keep" },
    reconciliation: () => ({
      write: [{ path: "lib", expect: "absent", bytes: bytes("a lib") }],
      remove: [
        { path: "lib/a.md", expect: sha("a") },
        { path: "lib/b/c.md", expect: sha("c") },
      ],
    }),
  };

  it("hosting/T14 [hosting/I1, hosting/F13]: a file becomes a directory of the same name, and a directory a file, each in one reconciliation, and the report names every outcome and the pruned directory", async () => {
    let { root } = alone(toDirectory.files);
    assert.deepEqual(await reconcile(root, toDirectory.reconciliation()), {
      outcomes: [
        { path: "tool", outcome: "removed" },
        { path: "tool/run", outcome: "written" },
      ],
      pruned: [],
    });
    assert.deepEqual(snapshot(root), { "keep.md": b64("keep"), "tool/": "directory", "tool/run": b64("run") });

    ({ root } = alone(toFile.files));
    assert.deepEqual(await reconcile(root, toFile.reconciliation()), {
      outcomes: [
        { path: "lib", outcome: "written" },
        { path: "lib/a.md", outcome: "removed" },
        { path: "lib/b/c.md", outcome: "removed" },
      ],
      pruned: ["lib", "lib/b"],
    });
    assert.deepEqual(snapshot(root), { "keep.md": b64("keep"), lib: b64("a lib") });
  });

  it("hosting/T15 [hosting/F3, hosting/F13]: a directory that holds anything the reconciliation does not remove is not turned into a file: the refusal is STALE, found \"not a file\", and nothing changes", async () => {
    for (const extra of [{ "lib/other.md": "other" }, { "lib/empty/": "" }]) {
      const { root } = alone({ "lib/a.md": "a", ...extra });
      const before = snapshot(root);
      await assert.rejects(
        reconcile(root, {
          write: [{ path: "lib", expect: "absent", bytes: bytes("a lib") }],
          remove: [{ path: "lib/a.md", expect: sha("a") }],
        }),
        (e) => code("STALE")(e) && JSON.stringify(e.findings) === JSON.stringify([{ path: "lib", expected: "absent", found: "not a file" }]),
      );
      assert.deepEqual(snapshot(root), before, JSON.stringify(extra));
    }
  });

  it("hosting/T16 [hosting/I2, hosting/F6, hosting/F13]: a failure while applying a kind change restores the root exactly, and leaves nothing beside it", async () => {
    const original = gfs.rename;
    for (const change of [toDirectory, toFile]) {
      let failed = 0;
      for (let k = 1; k <= 32; k++) {
        const { parent, root } = alone(change.files);
        const before = snapshot(root);
        let calls = 0;
        gfs.rename = (from, to, cb) => (++calls === k ? cb(Object.assign(new Error("EPERM: refused"), { code: "EPERM" })) : original(from, to, cb));
        let outcome;
        try {
          outcome = await reconcile(root, change.reconciliation()).then(
            () => "applied",
            (e) => (code("INVALID_PATH")(e) ? "refused" : "failed"),
          );
        } finally {
          gfs.rename = original;
        }
        assert.notEqual(outcome, "refused", "the kind change was refused instead of applied");
        assert.deepEqual(readdirSync(parent), ["root"], `rename ${k}`);
        if (outcome === "applied") break;
        failed++;
        assert.deepEqual(snapshot(root), before, `rename ${k}`);
      }
      assert.ok(failed > 0, "no rename failure was exercised");
    }
  });

  it("hosting/T17 [hosting/F13]: any nesting other than the two shapes is refused with INVALID_PATH before anything is touched", async () => {
    const cases = [
      { write: [{ path: "a", expect: "absent", bytes: bytes("a") }, { path: "a/b", expect: "absent", bytes: bytes("b") }], remove: [] },
      { write: [], remove: [{ path: "a", expect: sha("a") }, { path: "a/b", expect: sha("b") }] },
      { write: [{ path: "a", expect: "absent", bytes: bytes("a") }, { path: "a/b/c", expect: "absent", bytes: bytes("c") }], remove: [{ path: "a/b", expect: sha("b") }] },
    ];
    for (const reconciliation of cases) {
      const { root } = alone({ "keep.md": "keep" });
      const before = snapshot(root);
      await assert.rejects(reconcile(root, reconciliation), code("INVALID_PATH"), JSON.stringify(reconciliation));
      assert.deepEqual(snapshot(root), before);
    }
  });
});

describe("Guarded File Reconciliation: expectations", () => {
  const sha = (text) => createHash("sha256").update(Buffer.from(text)).digest("hex");
  const bytes = (text) => Buffer.from(text);
  const modes = process.platform !== "win32";

  /** A root in a parent of its own, holding `files`. */
  function alone(files) {
    const parent = mkdtempSync(join(tmpdir(), "kaal-expect-"));
    const root = join(parent, "root");
    mkdirSync(root);
    for (const [path, text] of Object.entries(files)) {
      const at = join(root, ...path.split("/"));
      mkdirSync(join(at, ".."), { recursive: true });
      writeFileSync(at, text);
    }
    return { parent, root };
  }

  /** Every directory and file under `dir`, links unfollowed, with each file's bytes. */
  function snapshot(dir, rel = "", into = {}) {
    for (const name of readdirSync(dir).sort()) {
      const path = rel ? `${rel}/${name}` : name;
      const entry = lstatSync(join(dir, name));
      if (entry.isSymbolicLink()) into[path] = "link";
      else if (entry.isDirectory()) {
        into[`${path}/`] = "directory";
        snapshot(join(dir, name), path, into);
      } else into[path] = readFileSync(join(dir, name)).toString("base64");
    }
    return into;
  }

  /** What identifies a file beyond its bytes: the same file, untouched, keeps all of it. */
  function identity(path) {
    const s = statSync(path, { bigint: true });
    return { ino: s.ino, mtime: s.mtimeNs, mode: s.mode, bytes: readFileSync(path).toString("base64") };
  }

  const code = (c) => (e) => e?.name === "HostingError" && e.code === c;

  it("hosting/T18 [hosting/I4, hosting/F14]: expectations that hold let the writes and removals apply, every expected file stays the same file with the same bytes and executable mark and has no outcome, and expectations alone apply nothing", async () => {
    const { root } = alone({ "engine/run": "run", "engine/lib.md": "lib", "engine/old.md": "old", "keep.md": "keep" });
    if (modes) chmodSync(join(root, "engine", "run"), 0o755);
    const run = identity(join(root, "engine", "run"));
    const lib = identity(join(root, "engine", "lib.md"));
    const report = await reconcile(root, {
      write: [{ path: "engine/new.md", expect: "absent", bytes: bytes("new") }],
      remove: [{ path: "engine/old.md", expect: sha("old") }],
      expect: [
        { path: "engine/run", expect: sha("run") },
        { path: "engine/lib.md", expect: sha("lib") },
        { path: "engine/later.md", expect: "absent" },
      ],
    });
    assert.deepEqual(report, {
      outcomes: [
        { path: "engine/new.md", outcome: "written" },
        { path: "engine/old.md", outcome: "removed" },
      ],
      pruned: [],
    });
    assert.deepEqual(identity(join(root, "engine", "run")), run);
    assert.deepEqual(identity(join(root, "engine", "lib.md")), lib);
    if (modes) assert.notEqual(statSync(join(root, "engine", "run")).mode & 0o111, 0, "the expected file lost its executable mark");

    const before = snapshot(root);
    assert.deepEqual(await reconcile(root, { write: [], remove: [], expect: [{ path: "keep.md", expect: sha("keep") }] }), { outcomes: [], pruned: [] });
    assert.deepEqual(snapshot(root), before);
  });

  it("hosting/T19 [hosting/I4, hosting/F3, hosting/F14]: a file the caller relied on and left alone changes after the caller read it, and the refusal is STALE, lists it with every other failing path, and nothing changes", async () => {
    const changes = [
      { change: (root) => writeFileSync(join(root, "engine", "lib.md"), "changed"), found: sha("changed") },
      { change: (root) => rmSync(join(root, "engine", "lib.md")), found: "absent" },
    ];
    for (const { change, found } of changes) {
      // The caller reads the Engine, verifies the plan it makes from it, and only then reconciles.
      const { root } = alone({ "engine/run": "run", "engine/lib.md": "lib", "engine/old.md": "old" });
      const read = { run: sha(readFileSync(join(root, "engine", "run"))), lib: sha(readFileSync(join(root, "engine", "lib.md"))) };
      change(root);
      const before = snapshot(root);
      await assert.rejects(
        reconcile(root, {
          write: [{ path: "engine/new.md", expect: "absent", bytes: bytes("new") }],
          remove: [{ path: "engine/old.md", expect: sha("old") }],
          expect: [
            { path: "engine/run", expect: read.run },
            { path: "engine/lib.md", expect: read.lib },
          ],
        }),
        (e) => code("STALE")(e) && JSON.stringify(e.findings) === JSON.stringify([{ path: "engine/lib.md", expected: sha("lib"), found }]),
      );
      assert.deepEqual(snapshot(root), before);
    }

    // Where the caller found nothing, something appears; it fails with a failing write, both listed in path order.
    const { root } = alone({ "a.md": "a" });
    writeFileSync(join(root, "plugin.md"), "plugin");
    const before = snapshot(root);
    await assert.rejects(
      reconcile(root, {
        write: [{ path: "a.md", expect: sha("not a"), bytes: bytes("a 2") }],
        remove: [],
        expect: [{ path: "plugin.md", expect: "absent" }],
      }),
      (e) =>
        code("STALE")(e) &&
        JSON.stringify(e.findings) ===
          JSON.stringify([
            { path: "a.md", expected: sha("not a"), found: sha("a") },
            { path: "plugin.md", expected: "absent", found: sha("plugin") },
          ]),
    );
    assert.deepEqual(snapshot(root), before);
  });

  it("hosting/T20 [hosting/F4, hosting/F5, hosting/F14]: an expected path that is repeated, also written or removed, nested with another path, not portable, or reached through a link is refused before anything is touched", async () => {
    const { root } = alone({ "a.md": "a", "d/b.md": "b", "real/c.md": "c" });
    let linked = true;
    try {
      symlinkSync(join(root, "real"), join(root, "link"), "dir");
    } catch {
      linked = false; // A host that will not make a link has no link to refuse.
    }
    const a = { path: "a.md", expect: sha("a") };
    const cases = [
      { code: "INVALID_PATH", reconciliation: { write: [], remove: [], expect: [a, a] } },
      { code: "INVALID_PATH", reconciliation: { write: [{ ...a, bytes: bytes("a 2") }], remove: [], expect: [a] } },
      { code: "INVALID_PATH", reconciliation: { write: [], remove: [a], expect: [a] } },
      { code: "INVALID_PATH", reconciliation: { write: [{ path: "d/new.md", expect: "absent", bytes: bytes("n") }], remove: [], expect: [{ path: "d", expect: "absent" }] } },
      { code: "INVALID_PATH", reconciliation: { write: [], remove: [{ path: "d", expect: "absent" }], expect: [{ path: "d/b.md", expect: sha("b") }] } },
      { code: "INVALID_PATH", reconciliation: { write: [], remove: [], expect: [{ path: "../a.md", expect: sha("a") }] } },
      { code: "INVALID_PATH", reconciliation: { write: [], remove: [], expect: [{ path: "con.md", expect: "absent" }] } },
      ...(linked ? [{ code: "INVALID_PATH", reconciliation: { write: [], remove: [], expect: [{ path: "link/c.md", expect: sha("c") }] } }] : []),
    ];
    const before = snapshot(root);
    for (const { code: c, reconciliation } of cases) {
      await assert.rejects(reconcile(root, reconciliation), code(c), JSON.stringify(reconciliation.expect));
      assert.deepEqual(snapshot(root), before);
    }
  });
});

describe("Platform coupling conformance", () => {
  /** In-memory sources, as read returns them. */
  const sources = (entries) => Object.fromEntries(Object.entries(entries).map(([p, text]) => [p, Buffer.from(text)]));

  it("hosting/T68 [hosting/F27, hosting/F29, hosting/F30, hosting/F32]: couplings reads production and test sources apart, classifies a platform skip as registration, keeps an acknowledged finding with its reason, and states its coverage", async () => {
    const { couplings } = await import("@kaihacksai/kaal-hosting/conformance");
    const report = await couplings(
      sources({
        "src/index.js": "// process.platform in a comment is no finding\nexport const answer = 42;\n",
        "test/index.test.js": 'import { it } from "node:test";\nit("a", { skip: process.platform === "win32" }, () => {});\nconst w = process.platform; // kaal-hosting: platform fixture path\n',
        "README.md": "process.platform\n",
      }),
      {},
    );
    assert.deepEqual(report.sources, [
      { file: "src/index.js", scope: "production" },
      { file: "test/index.test.js", scope: "test" },
    ]);
    assert.ok(report.skipped.some((s) => s.file === "README.md"), "a file that is no source is not listed as skipped");
    assert.ok(!report.findings.some((f) => f.file === "src/index.js"), "a comment was taken for a finding");
    assert.ok(report.findings.some((f) => f.line === 2 && f.rule === "platform-query" && f.kind === "registration"), JSON.stringify(report.findings));
    const acknowledged = report.findings.find((f) => f.line === 3);
    assert.equal(acknowledged?.acknowledged, "fixture path");
    assert.equal(acknowledged.kind, "setup");
    assert.ok(report.coverage.length > 0 && report.exclusions.length > 0, "no stated coverage");
  });

  it("hosting/T69 [hosting/F33, hosting/F39, hosting/F40]: the portability audit fails an applicability scoped by platform, puts a host exception to review under a stable id, and challenges the cases it concerns", async () => {
    const { portability } = await import("@kaihacksai/kaal-hosting/boundary");
    const root = mkdtempSync(join(tmpdir(), "kaal-hosting-audit-"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "audited" }));
    mkdirSync(join(root, "test"));
    writeFileSync(join(root, "test", "a.test.js"), 'import { it } from "node:test";\nit("scoped", () => {});\nit("needs special entries", () => {});\n');
    const applicability = {
      scoped: { platforms: ["linux"] },
      "needs special entries": { host: ["kaal-hosting/special-entries"], reason: "a FIFO and a socket in a tree", evidence: "https://example.org/evidence" },
    };
    const r = await portability({ name: "audited", root, builtins: ["node:test"], applicability });
    assert.equal(r.result, "failed");
    assert.equal(r.osBoundary, false);
    const outcome = (name) => r.cases.find((c) => c.name === name)?.outcome;
    assert.equal(outcome("inspection completes"), "pass");
    assert.equal(outcome("applicability is not scoped by platform"), "fail");
    assert.equal(outcome("host exceptions are well-formed"), "pass");
    assert.deepEqual(r.applicability.map((f) => [f.case, f.rule]), [["scoped", "platform-applicability"]]);
    assert.equal(r.review, "requested");
    assert.ok(r.reviews.some((q) => q.id === "kaal-hosting/host-applicability@needs special entries" && q.owner === "Hosting"), JSON.stringify(r.reviews));
    assert.ok(r.challenged.includes("scoped"));
    const again = await portability({ name: "audited", root, builtins: ["node:test"], applicability });
    assert.deepEqual(again.reviews.map((q) => q.id), r.reviews.map((q) => q.id));
  });
});
