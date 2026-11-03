// Characterize the existing writer footprint; caller authority is reviewed separately.
// These probes do not add a runtime permission gate or mock Hosting's verdict.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { it } from "node:test";
import { promisify } from "node:util";
import gfs from "graceful-fs";
import { HostingError, reconcile } from "@kaihacksai/kaal-hosting";
import { snapshot } from "../verify.mjs";

function fixture(t) {
  const parent = mkdtempSync(join(tmpdir(), "hosting-footprint-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const root = join(parent, "root");
  mkdirSync(root);
  writeFileSync(join(root, "keep.md"), "keep\n");
  writeFileSync(join(parent, "neighbor.txt"), "unrelated\0bytes");
  return { parent, root };
}

it("hosting/T88 [hosting/F5]: escaping reconciliation paths preserve the root and unrelated siblings byte for byte", async (t) => {
  const { parent, root } = fixture(t);
  const before = snapshot(parent);
  for (const path of ["../neighbor.txt", "/escape.md", "nested/../escape.md"]) {
    await assert.rejects(reconcile(root, {
      write: [{ path, expect: "absent", bytes: Buffer.from("unauthorized") }], remove: [],
    }), (e) => e instanceof HostingError && e.code === "INVALID_PATH");
    assert.deepEqual(snapshot(parent), before, path);
  }
});

it("hosting/T89 [hosting/F5, hosting/F6, hosting/A2, hosting/A21]: a real successful reconciliation uses only its root and documented sibling machinery and cleans that machinery", async (t) => {
  const { parent, root } = fixture(t);
  const at = await promisify(gfs.realpath)(root);
  const originalNeighbor = readFileSync(join(parent, "neighbor.txt"));
  const events = [];
  const originals = new Map();
  const methods = ["mkdir", "mkdtemp", "rename", "writeFile", "rm", "rmdir"];
  for (const method of methods) {
    const original = gfs[method];
    originals.set(method, original);
    gfs[method] = (...args) => {
      events.push({ method, paths: args.slice(0, method === "rename" ? 2 : 1).map((p) => resolve(p)) });
      return original(...args); // observe real host operations without replacing their outcomes
    };
  }
  let result;
  try {
    result = await reconcile(root, {
      write: [{ path: "new.md", expect: "absent", bytes: Buffer.from("new\n") }], remove: [],
    });
  } finally {
    for (const [method, original] of originals) gfs[method] = original;
  }
  assert.deepEqual(result, { outcomes: [{ path: "new.md", outcome: "written" }], pruned: [] });
  const saw = (method, path) => events.some((e) => e.method === method && e.paths[0] === path);
  assert.ok(saw("mkdir", `${at}.lock`), "the real lock directory is beside the canonical root");
  assert.ok(saw("mkdtemp", `${at}.staging-`), "the real staging allocation is beside the canonical root");
  assert.ok(saw("mkdtemp", `${at}.aside-`), "the real aside allocation is beside the canonical root");
  const existingParents = new Set([resolve(parent), dirname(at)]);
  const machinery = (p) => p === `${at}.lock` || p.startsWith(`${at}.staging-`) || p.startsWith(`${at}.aside-`);
  for (const e of events) for (const p of e.paths) {
    assert.ok(p === at || p.startsWith(`${at}${sep}`) || machinery(p) || (e.method === "mkdir" && existingParents.has(p)),
      `unexpected writer location: ${e.method} ${p}`);
  }
  assert.deepEqual(readdirSync(parent).sort(), ["neighbor.txt", "root"]);
  assert.deepEqual(readdirSync(root).sort(), ["keep.md", "new.md"]);
  assert.equal(readFileSync(join(root, "new.md"), "utf8"), "new\n");
  assert.equal(readFileSync(join(root, "keep.md"), "utf8"), "keep\n");
  assert.deepEqual(readFileSync(join(parent, "neighbor.txt")), originalNeighbor);
});
