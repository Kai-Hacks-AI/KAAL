// hosting/C4 planned outer test: a cleanup failure is reported as leftovers and
// never decides a reconciliation's outcome (hosting/F12), proving hosting/D1 RED. Immutable to
// DO and CHECK; hosting/C5 turns it GREEN. It uses kaal-hosting's public
// interface, and graceful-fs (hosting/A2) only to make the host refuse.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
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

describe("Guarded File Reconciliation: cleanup (hosting/C4)", () => {
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
