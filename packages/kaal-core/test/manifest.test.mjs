// core/T97, added by the Owner's review of core/C29 (#704): the shipped manifest is committed, and the
// publisher's tests require it to be current. `scripts/manifest.mjs --check` writes nothing and fails
// on a stale or missing manifest; the build never writes it, so nothing repairs a stale one silently.
// The installed-file and case verification of test/verify.mjs stays independent of this check.
// Commands run through Hosting (core/F88). Not shipped.
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const CORE = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(CORE, "scripts", "manifest.mjs");
const MANIFEST = "test/verify.json";
const env = { ...process.env, NODE_TEST_CONTEXT: undefined };
const check = (root) => execute(process.execPath, [SCRIPT, "--check", ...(root ? ["--root", root] : [])], { cwd: CORE, env });

describe("kaal-core's committed manifest (core/C29, the Owner's review on #704)", () => {
  it("core/T97 [core/F85, core/A43]: the committed test/verify.json is exactly what the generator writes, --check writes nothing, and the build never writes it", async () => {
    const before = readFileSync(join(CORE, MANIFEST));
    const r = await check();
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /test\/verify\.json is current/);
    assert.deepEqual(readFileSync(join(CORE, MANIFEST)), before, "--check leaves the manifest as it was");
    const scripts = JSON.parse(readFileSync(join(CORE, "package.json"), "utf8")).scripts;
    assert.doesNotMatch(scripts.build, /manifest/, "the build never writes the manifest");
    assert.match(scripts.prepack, /npm run build/);
    assert.doesNotMatch(scripts.prepack, /manifest\.mjs(?! --check)/, "packing never regenerates the manifest");
    assert.match(scripts["test:publisher"], /scripts\/manifest\.mjs --check/, "the publisher's tests require a current manifest");
  });

  it("core/T97 [core/F85, core/A43]: a shipped file changed after the manifest, or a missing manifest, fails --check and nothing is written", async () => {
    const work = mkdtempSync(join(tmpdir(), "kaal-core-manifest-"));
    try {
      const pkg = join(work, "kaal-core");
      mkdirSync(pkg);
      const listed = JSON.parse(readFileSync(join(CORE, MANIFEST), "utf8"));
      for (const f of [...Object.keys(listed.files), MANIFEST, "package.json"]) cpSync(join(CORE, f), join(pkg, f), { recursive: true });
      const same = await check(pkg);
      assert.equal(same.status, 0, `the copy is current before any change: ${same.stdout}${same.stderr}`);

      const committed = readFileSync(join(pkg, MANIFEST));
      writeFileSync(join(pkg, "docs", "intent.md"), `${readFileSync(join(pkg, "docs", "intent.md"), "utf8")}\nchanged\n`);
      const stale = await check(pkg);
      assert.equal(stale.status, 1, `${stale.stdout}${stale.stderr}`);
      assert.match(stale.stderr, /test\/verify\.json is stale/);
      assert.deepEqual(readFileSync(join(pkg, MANIFEST)), committed, "--check never repairs a stale manifest");

      rmSync(join(pkg, MANIFEST));
      const missing = await check(pkg);
      assert.equal(missing.status, 1, `${missing.stdout}${missing.stderr}`);
      assert.match(missing.stderr, /test\/verify\.json is missing/);
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });
});
