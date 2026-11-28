// Case release/T1685 tests: release/C173
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repo } from './fixture.mjs';
export const id = 'release/T1685';
export const tests = ['release/C173'];
export const title = 'the Cases of C58, C60 and C65 that judge the entry and not the workflow source stay green with the new entries';
const CARRIED = ['T754', 'T755', 'T756', 'T758', 'T759', 'T791', 'T792', 'T852', 'T853', 'T854', 'T936'];
export async function run() {
  const rm = join(repo, 'engineering/release-management');
  const found = [];
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) { if (e.name !== 'node_modules') walk(join(d, e.name)); } else if (/^T\d+\.test\.mjs$/.test(e.name) && CARRIED.includes(e.name.split('.')[0])) found.push(join(d, e.name)); } };
  walk(rm);
  assert.equal(found.length, CARRIED.length, `carried Cases not found: ${CARRIED.filter((c) => !found.some((f) => f.includes(`${c}.`))).join(', ')}`);
  for (const f of found) await (await import(pathToFileURL(f).href)).run();
}
