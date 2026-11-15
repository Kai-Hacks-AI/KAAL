// Case pull/T433 tests: pull/F53, pull/F54
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pkg } from './lib.mjs';
export const id = 'pull/T433';
export const tests = ['pull/F53', 'pull/F54'];
export const title = 'the same unmodified package works for another host, and auto-pull is opt-in';

export async function run() {
  const { resolveDeliveries } = await pkg();
  const src = readFileSync(new URL('../../skills/kaal-release/scripts/deliveries.mjs', import.meta.url), 'utf8').toLowerCase();
  for (const word of ['kaal/', 'hotfix/', 'wire/', 'github', 'branch', '.kaal', 'node:fs', 'fetch(']) {
    assert.ok(!src.includes(word), `the package knows "${word}"`);
  }
  // Another host: ticket ids, other class names, other revision forms, no Git at all.
  const registry = { accepted: true, stocks: [{ name: 'URGENT', routes: ['TICKET-7'] }, { name: 'ROUTINE', routes: ['NOTHING-*'] }] };
  const other = {
    classes: ['URGENT', 'ROUTINE'],
    candidates: [
      { id: 'TICKET-7', class: 'URGENT', name: 'seven', revision: 'rev:42' },
      { id: 'TICKET-9', class: 'ROUTINE', name: 'nine', revision: 'rev:7' },
    ],
    authorities: { URGENT: 'qa', ROUTINE: 'qa' },
    verdicts: [
      { candidate: 'TICKET-7', verdict: 'PASS', revision: 'rev:42', authority: 'qa' },
      { candidate: 'TICKET-9', verdict: 'PASS', revision: 'rev:6', authority: 'qa' },
    ],
    registry,
  };
  const [t7, t9] = resolveDeliveries(other).deliveries;
  assert.deepEqual([t7.source, t7.ready, t7.pull], ['TICKET-7', true, 'auto']);
  assert.deepEqual([t9.source, t9.ready, t9.pull], ['TICKET-9', false, 'judge'], 'an item with no matching route is listed for judge-pull, and a stale verdict is not ready');
  // The registry decides the mode only: it never makes an item ready, and a bad one makes everything judge.
  for (const bad of [undefined, { accepted: false, stocks: registry.stocks }, { accepted: true, stocks: 'nope' }, { stocks: registry.stocks }]) {
    const first = resolveDeliveries({ ...other, registry: bad }).deliveries[0];
    assert.deepEqual([first.ready, first.pull], [true, 'judge'], 'a missing, unaccepted or malformed registry allowed auto-pull');
  }
  const none = resolveDeliveries({ ...other, verdicts: [] }).deliveries[0];
  assert.deepEqual([none.ready, none.pull], [false, 'auto'], 'registration made an item ready');
}
