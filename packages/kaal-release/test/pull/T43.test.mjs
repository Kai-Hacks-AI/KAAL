// Case pull/T43 tests: pull/F43
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { registry } from './fixtures.mjs';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T43';
export const tests = ['pull/F43'];
export const title = 'the next delivery is the eligible candidate of the highest class, HOTFIX then WIRE then KAAL, and within KAAL the C9 choice';

export async function run() {
  const raw = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  const mod = { ...raw, laneStep: (st) => raw.laneStep({ registry, ...st }) };
  const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
  const ok = { stock: 'PASS', in: 'PASS' };
  const hot = (over = {}) => ({ class: 'HOTFIX', source: 'hotfix/fix-a', name: 'fix-a', ...ok, ...over });
  const wire = (over = {}) => ({ class: 'WIRE', source: 'wire/hooks', name: 'hooks', ...ok, ...over });
  const kaal = (name, over = {}) => ({ class: 'KAAL', source: `kaal/release/${name}`, name: `kaal/release/${name}`, ...ok, ...over });
  const decl = { collectors: [{ name: 'kaal/release/a', value: 1, size: 1, unit: 'u' }, { name: 'kaal/release/b', value: 9, size: 1, unit: 'u' }] };
  const step = (deliveries) => mod.laneStep({ seat: null, report: { qualifiers: ['kaal/release/a', 'kaal/release/b'], next: { collector: 'kaal/release/a' } }, declaration: decl, deliveries, pulse: calm });

  let r = step([kaal('b'), wire(), hot()]);
  assert.deepEqual([r.action, r.class, r.name], ['select', 'HOTFIX', 'fix-a'], 'the HOTFIX was not selected first');
  r = step([kaal('b'), wire(), hot({ stock: 'FAIL' })]);
  assert.deepEqual([r.action, r.class], ['select', 'WIRE'], 'a failed HOTFIX blocked the eligible WIRE');
  r = step([kaal('b'), wire({ stock: 'FAIL' }), hot({ stock: 'FAIL' })]);
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'kaal/release/b'], 'higher classes that are not eligible blocked the KAAL collector');
  // Within KAAL the choice is the C9 rule over the eligible collectors only.
  assert.equal(step([kaal('a'), kaal('b')]).collector, 'kaal/release/b', 'the highest value density was not chosen within KAAL');
  assert.equal(step([kaal('a'), kaal('b', { stock: 'FAIL' })]).collector, 'kaal/release/a', 'an ineligible KAAL collector was ranked');
  // Value density does not compete with a class: a huge KAAL value never outranks a HOTFIX.
  assert.equal(step([kaal('b'), hot()]).action, 'select', 'a KAAL value outranked a HOTFIX');
  assert.equal(step([wire(), kaal('b')]).class, 'WIRE', 'a KAAL value outranked a WIRE');
}
