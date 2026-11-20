// Case release/T1310 tests: release/I61, release/F87, release/A77
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const LIB = join(RM, '05-src/phase/lib');
const use = (name) => { const f = join(LIB, name); assert.ok(existsSync(f), `lib/${name} is absent`); return import(pathToFileURL(f).href); };
const text = (p) => { assert.ok(existsSync(p), `${p.slice(RM.length + 1)} is absent`); return readFileSync(p, 'utf8'); };
export const id = 'release/T1310';
export const tests = ['release/I61', 'release/F87', 'release/A77'];
export const title = 'the Intent release/I61 is justified by the Requirement release/F87 and the Architecture element release/A77 under it, which names the library and its modules';
export async function run() {
  const i = text(join(RM, '01-intent/I61-act-lib/I61.md'));
  const f = text(join(RM, '02-requirements/F87-act-lib/F87.md'));
  const a = text(join(RM, '03-architecture/A77-act-lib/A77.md'));
  assert.match(i, /^id: release\/I61$/m);
  assert.match(f, /^id: release\/F87$/m);
  assert.match(f, /^serves: \[release\/I61\]$/m);
  assert.match(a, /^id: release\/A77$/m);
  assert.match(a, /^addresses: \[release\/F87\]$/m);
  for (const m of ['tree', 'collector', 'cases-green', 'write-map']) assert.ok(a.includes(`${m}.mjs`), `A77 does not name ${m}.mjs`);
}
