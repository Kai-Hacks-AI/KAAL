// Case controls/T1717 tests: controls/F220
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1717';
export const tests = ['controls/F220'];
export const title = 'the dependency runs one way: no file of the controls library imports the ratchet library, and only the public adapter, the command, the old-path shims and a specific ratchet do';
const MAY = ['adapter.mjs', 'adapter-ratchet.mjs', 'ratchet-use-ratchet.mjs', 'judge-mode.mjs', 'ratchet.mjs', 'judge-ratchet.mjs'];
export async function run() {
  assert.ok(existsSync(join(S, 'lib/ratchet')), 'scripts/lib/ratchet is absent');
  for (const f of readdirSync(join(S, 'lib')).filter((x) => x.endsWith('.mjs'))) {
    for (const s of specs(readFileSync(join(S, 'lib', f), 'utf8'))) assert.ok(!/ratchet/.test(s), `lib/${f} imports ${s}`);
  }
  for (const f of readdirSync(S).filter((x) => x.endsWith('.mjs') && !MAY.includes(x))) {
    for (const s of specs(readFileSync(join(S, f), 'utf8'))) assert.ok(!/ratchet/.test(s), `${f} imports ${s}`);
  }
  assert.ok(/lib\/ratchet\/strategy\.mjs/.test(readFileSync(join(S, 'adapter.mjs'), 'utf8')), 'the public adapter does not wire the ratchet strategy');
}
