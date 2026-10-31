// foundation/C5 publisher tests for the shipped verifier (foundation/F8, amended by foundation/F12): the
// interface it verifies is Foundation's approved one, never the candidate's own export inventory. A
// candidate that drops, misdirects or breaks ./sha256 cannot be exercised (cannot verify); one that
// runs and answers wrongly failed. None of them is ever verified. Renamed by foundation/C8: each copy
// ships every file test/verify.json lists, and each mutation rewrites the manifest digests, so the
// verifier judges the interface, not tampering (foundation/T17's). Not shipped.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LINE = "kaal-foundation-verification ";

/** An installed copy under node_modules/@kaihacksai/, changed by `mutate`, and its verifier's result. */
function verifyInstalled(mutate) {
  const root = mkdtempSync(join(tmpdir(), "kaal-foundation-verifier-"));
  try {
    const installed = join(root, "node_modules", "@kaihacksai", "kaal-foundation");
    const listed = JSON.parse(readFileSync(join(PACKAGE, "test", "verify.json"), "utf8"));
    for (const path of [...Object.keys(listed.files), "test/verify.json"]) {
      mkdirSync(dirname(join(installed, path)), { recursive: true });
      cpSync(join(PACKAGE, path), join(installed, path));
    }
    mutate(installed);
    for (const path of Object.keys(listed.files)) if (existsSync(join(installed, path))) listed.files[path] = createHash("sha256").update(readFileSync(join(installed, path))).digest("hex");
    writeFileSync(join(installed, "test", "verify.json"), JSON.stringify(listed, null, 2) + "\n");
    const r = spawnSync(process.execPath, [join(installed, "test", "verify.mjs")], { cwd: root, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
    const last = r.stdout.trim().split(/\r?\n/).pop() ?? "";
    const result = last.startsWith(LINE) ? JSON.parse(last.slice(LINE.length)).result : last;
    return { status: r.status, result, out: r.stdout + r.stderr };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const exportsTo = (target) => (dir) => {
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  if (target === undefined) delete pkg.exports["./sha256"];
  else pkg.exports["./sha256"] = { types: "./lib/sha256.d.ts", default: target };
  writeFileSync(join(dir, "package.json"), JSON.stringify(pkg, null, 2));
};

describe("the shipped verifier's interface (foundation/C5)", () => {
  it("verifies the unchanged installed copy", () => {
    const r = verifyInstalled(() => {});
    assert.deepEqual([r.status, r.result], [0, "verified"], r.out);
  });

  const unexercisable = {
    "./sha256 removed from exports": exportsTo(undefined),
    "./sha256 misdirected to a missing file": exportsTo("./lib/missing.mjs"),
    "./sha256 misdirected to a module without sha256": (dir) => {
      writeFileSync(join(dir, "lib", "other.mjs"), "export const nothing = 1;\n");
      exportsTo("./lib/other.mjs")(dir);
    },
    "lib/sha256.mjs throwing on import": (dir) => writeFileSync(join(dir, "lib", "sha256.mjs"), 'throw new Error("broken");\n'),
  };
  for (const [name, mutate] of Object.entries(unexercisable)) {
    it(`gives cannot verify, never verified, for ${name}`, () => {
      const r = verifyInstalled(mutate);
      assert.deepEqual([r.status, r.result], [2, "cannot verify"], r.out);
    });
  }

  it("gives failed, never verified, when ./sha256 loads and answers wrongly", () => {
    const r = verifyInstalled((dir) => writeFileSync(join(dir, "lib", "sha256.mjs"), 'export const sha256 = () => "0".repeat(64);\n'));
    assert.deepEqual([r.status, r.result], [1, "failed"], r.out);
  });
});
