// The planned outer tests of engineer-skill/C3, installed verification
// (plan/installed-verification/testing.md). Immutable to DO. A DO Change turns them GREEN.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const work = mkdtempSync(join(tmpdir(), "engineer-skill-c3-"));
after(() => rmSync(work, { recursive: true, force: true }));

const packed = () => {
  const out = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE, encoding: "utf8", shell: process.platform === "win32" });
  assert.equal(out.status, 0, out.stderr);
  return JSON.parse(out.stdout)[0].files.map((f) => f.path);
};
/** A copy of exactly the packed files, as a consumer would hold them. */
const install = (name) => {
  const dir = join(work, name);
  for (const path of packed()) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    cpSync(join(PACKAGE, path), join(dir, path));
  }
  return dir;
};
const verify = (dir) => {
  const out = spawnSync(process.execPath, [join(dir, "test", "verify.mjs")], { cwd: dir, encoding: "utf8" });
  return { status: out.status, text: `${out.stdout}${out.stderr}` };
};

describe("installed verification", () => {
  it("engineer-skill/T370 (engineer-skill/F8, engineer-skill/F11): npm test has no pretest and verifies; the source suite is test:publisher", () => {
    assert.equal(manifest.scripts.pretest, undefined);
    assert.match(manifest.scripts.test, /verify|test:all/);
    assert.doesNotMatch(manifest.scripts.test, /--test|build/);
    assert.match(manifest.scripts["test:publisher"], /check-skill\.test\.mjs/);
  });

  it("engineer-skill/T371 (engineer-skill/F9): files names the verifier and its manifest, and the pack contains both", () => {
    assert.ok(manifest.files.includes("test/verify.mjs") && manifest.files.includes("test/verify.json"), manifest.files.join());
    const files = packed();
    assert.ok(files.includes("test/verify.mjs") && files.includes("test/verify.json"), files.join());
  });

  it("engineer-skill/T372 (engineer-skill/F9, engineer-skill/N2): the manifest digests every other packed file and nothing else", () => {
    const digests = JSON.parse(readFileSync(join(PACKAGE, "test", "verify.json"), "utf8"));
    const listed = Object.keys(digests.files ?? digests).sort();
    const expected = packed().filter((p) => p !== "test/verify.json").sort();
    assert.deepEqual(listed, expected);
    const entry = (digests.files ?? digests)["package.json"];
    assert.equal(entry, createHash("sha256").update(readFileSync(join(PACKAGE, "package.json"))).digest("hex"));
  });

  it("engineer-skill/T373 (engineer-skill/F10): unaltered is verified; altered, deleted, stray are failed; an unreadable manifest is unknown", () => {
    const ok = verify(install("ok"));
    assert.equal(ok.status, 0, ok.text);
    assert.match(ok.text, /\bverified\b/);

    const altered = install("altered");
    writeFileSync(join(altered, "README.md"), `${readFileSync(join(altered, "README.md"), "utf8")}x`);
    const a = verify(altered);
    assert.notEqual(a.status, 0);
    assert.match(a.text, /\bfailed\b/);

    const deleted = install("deleted");
    rmSync(join(deleted, "payload", "BASS.md"));
    assert.match(verify(deleted).text, /\bfailed\b/);

    const stray = install("stray");
    writeFileSync(join(stray, "stray.txt"), "x");
    assert.match(verify(stray).text, /\bfailed\b/);

    const unknown = install("unknown");
    writeFileSync(join(unknown, "test", "verify.json"), "{");
    const u = verify(unknown);
    assert.notEqual(u.status, 0);
    assert.match(u.text, /\bunknown\b/);
  });
});
