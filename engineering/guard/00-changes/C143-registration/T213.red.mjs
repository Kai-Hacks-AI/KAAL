// Case guard/T213 tests: G61
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repo } from './lib.mjs';
export const id = 'guard/T213';
export const tests = ['guard/G61'];
export const title = 'gap guard/G61 is closed: Guard is on par with the capability standard, owning its tree, installing through the Installation Contract named as Core\'s is, and defined as a capability';
const CONTRACT_FORMAT = '20c46d8e84ac4502d3b4a2b497f75f8bd999fb826ee5f85b6912b77afaaefa5b';
export function run() {
  const pkg = join(repo, 'packages/kaal-guard');
  for (const f of ['ownership.kaal.json', 'installation.kaal.json', 'capability/Guard.md']) assert.ok(existsSync(join(pkg, f)), `${f} is absent`);
  const own = JSON.parse(readFileSync(join(pkg, 'ownership.kaal.json'), 'utf8'));
  assert.equal(own.owner?.name, 'Guard');
  assert.deepEqual(own.paths, ['packages/kaal-guard/']);
  const c = JSON.parse(readFileSync(join(pkg, 'installation.kaal.json'), 'utf8'));
  assert.equal(c.format?.id, CONTRACT_FORMAT, 'the contract is not an instance of the Installation Contract');
  assert.ok(c.assets.every((a) => a.target.startsWith('.kaal/') || a.surface), 'an asset has neither a .kaal/ target nor a declared surface');
  assert.ok(!existsSync(join(pkg, 'contract.json')), 'contract.json is still there beside installation.kaal.json');
}
