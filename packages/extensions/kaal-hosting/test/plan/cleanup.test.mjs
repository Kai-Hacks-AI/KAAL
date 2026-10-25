// hosting/C4 planned outer test: a cleanup failure never decides a
// reconciliation's outcome (hosting/F12), proving hosting/D1 RED. Immutable to
// DO and CHECK; hosting/C5 turns it GREEN. It uses kaal-hosting's public
// interface, and graceful-fs (hosting/A2) only to make the host refuse.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import gfs from "graceful-fs";
import { reconcile } from "kaal-hosting";

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

describe("Guarded File Reconciliation: cleanup (hosting/C4)", () => {
  it("hosting/T13 [hosting/I2, hosting/F12]: when the host refuses to remove the staging and aside directories, the outcome still stands: an applied reconciliation resolves with its report, a held rollback rethrows the original failure, and a failed rollback is UNRESTORED", async () => {
    const reconciliation = () => ({
      write: [{ path: "sub/a.md", expect: sha("a"), bytes: bytes("a 2") }],
      remove: [{ path: "b.md", expect: sha("b") }],
    });

    // Applied: the report, not the removal's error.
    let { root } = alone({ "sub/a.md": "a", "b.md": "b" });
    const applied = await refusing(() => reconcile(root, reconciliation()));
    assert.equal(applied.error, undefined, `applied, yet rejected with ${applied.error}`);
    assert.deepEqual(applied.value, {
      outcomes: [
        { path: "b.md", outcome: "removed" },
        { path: "sub/a.md", outcome: "written" },
      ],
      pruned: [],
    });
    assert.equal(readFileSync(join(root, "sub", "a.md"), "utf8"), "a 2");
    assert.deepEqual(readdirSync(root).sort(), ["sub"]);

    // A rollback that held: the original failure, not the removal's error.
    ({ root } = alone({ "sub/a.md": "a", "b.md": "b" }));
    const held = await refusing(
      () => reconcile(root, reconciliation()),
      (k) => k === 2,
    );
    assert.equal(held.error?.code, "EPERM", `expected the original EPERM, got ${held.error}`);
    assert.equal(readFileSync(join(root, "sub", "a.md"), "utf8"), "a");
    assert.equal(readFileSync(join(root, "b.md"), "utf8"), "b");

    // A rollback that failed: UNRESTORED and its kept location, not the removal's error.
    ({ root } = alone({ "sub/a.md": "a", "b.md": "b" }));
    const unrestored = await refusing(
      () => reconcile(root, reconciliation()),
      (k) => k > 1,
    );
    assert.equal(unrestored.error?.name, "HostingError", `expected UNRESTORED, got ${unrestored.error}`);
    assert.equal(unrestored.error.code, "UNRESTORED");
    assert.equal(unrestored.error.cause?.code, "EPERM");
    assert.equal(readFileSync(join(unrestored.error.kept, "sub", "a.md"), "utf8"), "a");
  });
});
