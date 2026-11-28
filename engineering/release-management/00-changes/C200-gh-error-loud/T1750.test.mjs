// Case release/T1750 tests: release/C200. A failed read of the Promotion Source entries says why it failed: the thrown message keeps the exit status and the first line of what gh printed, so a rate limit is not taken for a problem of the rules.
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RUN = join(repo, 'engineering/release-management/05-src/promotion-source/lib/run.mjs');
export const id = 'release/T1750';
export const tests = ['release/D22'];
export const title = 'a failed gh read names its exit status and the first line of its error, and still says the path cannot be read';
export async function run() {
  const { gh } = await import(pathToFileURL(RUN).href);
  const dir = mkdtempSync(join(tmpdir(), 't1750-'));
  try {
    const stub = (name, body) => { const p = join(dir, name); writeFileSync(p, `#!/usr/bin/env node\n${body}\n`); chmodSync(p, 0o755); return p; };
    const failing = stub('limit', "console.error('HTTP 403: API rate limit exceeded'); console.error('a second line that is left out'); process.exit(1);");
    let message;
    try { gh(['repos/o/r/rulesets'], { env: { KAAL_GH: failing } }); } catch (e) { message = e.message; }
    assert.ok(message, 'a non-zero exit throws');
    assert.match(message, /repos\/o\/r\/rulesets cannot be read/, 'the path still cannot be read');
    assert.match(message, /exit 1/, 'the exit status is named');
    assert.match(message, /HTTP 403: API rate limit exceeded/, 'the first line of the error is named');
    assert.doesNotMatch(message, /second line/, 'only the first line of the error is kept');

    const missing = join(dir, 'no-such-gh');
    let spawned;
    try { gh(['repos/o/r/rulesets'], { env: { KAAL_GH: missing } }); } catch (e) { spawned = e.message; }
    assert.match(spawned ?? '', /ENOENT/, 'a gh that cannot be started names why');

    const ok = stub('ok', "console.log(JSON.stringify({a:1})); console.log(JSON.stringify({a:2}));");
    assert.deepEqual(gh(['x'], { env: { KAAL_GH: ok } }), [{ a: 1 }, { a: 2 }], 'a read that works is unchanged');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
