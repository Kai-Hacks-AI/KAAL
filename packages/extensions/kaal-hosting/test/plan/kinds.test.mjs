// hosting/C6 planned outer tests: a file and a directory exchange places in one
// reconciliation (hosting/F13). Immutable to DO and CHECK; hosting/C7 turns them
// GREEN. Each title names the contracts it checks. They use kaal-hosting's
// public interface, and graceful-fs (hosting/A2) only to make the host fail.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import gfs from "graceful-fs";
import { reconcile } from "@kaihacksai/kaal-hosting";

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

describe("Guarded File Reconciliation: kinds (hosting/C6)", () => {
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
