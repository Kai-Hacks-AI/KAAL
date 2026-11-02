// Implementation tests for scripts/manifest.mjs --check (testing/F64): the committed test/verify.json is what the
// publisher's step writes, and a stale or unreadable one fails without anything being written.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(PACKAGE, "test", "verify.json");
const check = (...args) => execute("node", [join(PACKAGE, "scripts", "manifest.mjs"), "--check", ...args], { cwd: PACKAGE });

describe("The publisher's manifest check", () => {
  it("finds the committed manifest current, and writes nothing", async () => {
    const before = readFileSync(MANIFEST, "utf8");
    const r = await check();
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
    assert.equal(readFileSync(MANIFEST, "utf8"), before);
  });

  it("fails on a stale manifest, naming what differs, and writes nothing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-manifest-"));
    try {
      const stale = JSON.parse(readFileSync(MANIFEST, "utf8"));
      stale.hashes["lib/model.mjs"] = "0".repeat(64);
      const at = join(dir, "verify.json");
      writeFileSync(at, `${JSON.stringify(stale, null, 2)}\n`);
      const r = await check(at);
      assert.equal(r.status, 1);
      assert.match(r.stderr, /stale: .* lib\/model\.mjs/);
      assert.equal(JSON.parse(readFileSync(at, "utf8")).hashes["lib/model.mjs"], "0".repeat(64), "the stale manifest is not regenerated");
      writeFileSync(at, readFileSync(MANIFEST, "utf8").replace(/\n$/, ""));
      assert.equal((await check(at)).status, 1, "any byte of difference is stale");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("fails when the manifest it checks cannot be read", async () => {
    const r = await check(join(tmpdir(), "kaal-testing-no-such-manifest.json"));
    assert.equal(r.status, 1);
    assert.match(r.stderr, /stale: .* cannot be read/);
  });
});
