import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import gfs from "graceful-fs";
import { reconcile } from "@kaihacksai/kaal-hosting";

it("hosting/T81 [hosting/F6, hosting/F12]: aside allocation failure cleans staging or reports its exact leftover without changing the original failure or root", async (t) => {
  const parent = mkdtempSync(join(tmpdir(), "hosting-allocation-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const original = { mkdtemp: gfs.mkdtemp, rm: gfs.rm };
  try {
    for (const cleanupDenied of [false, true]) {
      const root = join(parent, String(cleanupDenied));
      mkdirSync(root);
      writeFileSync(join(root, "unrelated"), "preserved");
      const allocationError = Object.assign(new Error("aside allocation denied"), { code: "EACCES" });
      const cleanupError = Object.assign(new Error("staging cleanup denied"), { code: "EPERM" });
      let staged;
      gfs.mkdtemp = function (prefix, ...args) {
        const callback = args.at(-1);
        if (String(prefix).includes(".aside-")) return queueMicrotask(() => callback(allocationError));
        return original.mkdtemp.call(this, prefix, ...args.slice(0, -1), (error, path) => {
          if (!error) staged = path;
          callback(error, path);
        });
      };
      gfs.rm = function (path, ...args) {
        if (cleanupDenied && path === staged) return queueMicrotask(() => args.at(-1)(cleanupError));
        return original.rm.call(this, path, ...args);
      };
      await assert.rejects(reconcile(root, { write: [{ path: "new", expect: "absent", bytes: Buffer.from("new") }], remove: [] }), (error) => {
        assert.equal(error, allocationError, "preserve the original error object");
        assert.ok(staged, "the staging allocation actually succeeded");
        assert.deepEqual(error.leftovers, cleanupDenied ? [{ path: staged, error: cleanupError }] : undefined);
        return true;
      });
      assert.deepEqual(readdirSync(root), ["unrelated"]);
      assert.equal(readFileSync(join(root, "unrelated"), "utf8"), "preserved");
      assert.deepEqual(readdirSync(parent).filter((p) => p.startsWith(`${cleanupDenied}.`)), cleanupDenied ? [staged.split(/[\\/]/).at(-1)] : []);
      gfs.mkdtemp = original.mkdtemp;
      gfs.rm = original.rm;
    }
  } finally { Object.assign(gfs, original); }
});
