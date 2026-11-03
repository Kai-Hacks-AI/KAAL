// hosting/C1 planned outer tests: Guarded File Reconciliation, with hosting/T12
// added by the hosting/C3 amendment. Immutable to DO and CHECK; hosting/C2 turns
// them GREEN. Each title names the contracts it checks
// (plan/reconciliation/*.md). They use kaal-hosting's public interface, and
// graceful-fs (hosting/A2) only to make the host fail while applying.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmodSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { describe, it } from "node:test";
import gfs from "graceful-fs";

/** kaal-hosting's reconcile, or the reason the tests are blocked before any behavioural assertion. */
async function hosting() {
  const module = await import("@kaihacksai/kaal-hosting");
  if (typeof module.reconcile !== "function") assert.fail("blocked before behavioural assertion: kaal-hosting exports no reconcile");
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

describe("Guarded File Reconciliation (hosting/C1)", () => {
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
