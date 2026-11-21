// Case release/T1315 tests: release/I62, release/F88, release/A78
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const PHASE = join(RM, '05-src/phase');
const use = (name) => { const f = join(PHASE, name); assert.ok(existsSync(f), `${name} is absent`); return import(pathToFileURL(f).href); };
const text = (p) => { assert.ok(existsSync(p), `${p.slice(RM.length + 1)} is absent`); return readFileSync(p, 'utf8'); };
export const id = 'release/T1315';
export const tests = ['release/I62', 'release/F88', 'release/A78'];
export const title = 'the Intent release/I62 is justified by the Requirement release/F88 and the Architecture element release/A78 under it, which names the module of the answer';
export async function run() {
  const i = text(join(RM, '01-intent/I62-judge-applies/I62.md'));
  const f = text(join(RM, '02-requirements/F88-judge-applies/F88.md'));
  const a = text(join(RM, '03-architecture/A78-judge-applies/A78.md'));
  assert.match(i, /^id: release\/I62$/m);
  assert.match(f, /^id: release\/F88$/m);
  assert.match(f, /^serves: \[release\/I62\]$/m);
  assert.match(a, /^id: release\/A78$/m);
  assert.match(a, /^addresses: \[release\/F88\]$/m);
  assert.ok(a.includes('lib/result.mjs'), 'A78 does not name lib/result.mjs');
}
