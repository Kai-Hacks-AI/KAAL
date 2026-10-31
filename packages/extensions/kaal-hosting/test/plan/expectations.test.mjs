// hosting/C8 planned outer tests: a reconciliation relies on files it leaves
// alone (hosting/F14). Immutable to DO and CHECK; hosting/C9 turns them GREEN.
// Each title names the contracts it checks. They use kaal-hosting's public
// interface only.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmodSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { reconcile } from "@kaihacksai/kaal-hosting";

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

describe("Guarded File Reconciliation: expectations (hosting/C8)", () => {
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
