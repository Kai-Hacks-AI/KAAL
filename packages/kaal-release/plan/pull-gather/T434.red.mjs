// Case pull/T434 tests: pull/F54, pull/F55
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pkg } from './lib.mjs';
export const id = 'pull/T434';
export const tests = ['pull/F54', 'pull/F55'];
export const title = 'the same unmodified package works for another host, and auto-pull is opt-in';

export async function run() {
  const { resolveDeliveries } = await pkg();
  const src = readFileSync(new URL('../../skills/kaal-release/scripts/deliveries.mjs', import.meta.url), 'utf8').toLowerCase();
  for (const word of ['kaal/', 'hotfix/', 'wire/', 'github', 'branch', '.kaal', 'node:fs', 'fetch(']) {
    assert.ok(!src.includes(word), `the package knows "${word}"`);
  }
  // Another host: ticket ids, other class names, other revision forms, no Git at all.
  const other = {
    classes: ['URGENT', 'ROUTINE'],
    candidates: [
      { id: 'TICKET-7', class: 'URGENT', name: 'seven', revision: 'rev:42', stock: 'billing' },
      { id: 'TICKET-9', class: 'ROUTINE', name: 'nine', revision: 'rev:7', stock: 'ledger' },
    ],
    authorities: { URGENT: { out: 'qa', in: 'board' }, ROUTINE: { out: 'qa', in: 'board' } },
    verdicts: [
      { candidate: 'TICKET-7', side: 'out', verdict: 'PASS', revision: 'rev:42', authority: 'qa' },
      { candidate: 'TICKET-7', side: 'in', verdict: 'PASS', revision: 'rev:42', authority: 'board' },
      { candidate: 'TICKET-9', side: 'out', verdict: 'PASS', revision: 'rev:6', authority: 'qa' },
    ],
    registrations: ['billing'],
  };
  const [t7, t9] = resolveDeliveries(other).deliveries;
  assert.deepEqual([t7.source, t7.out, t7.in, t7.ready, t7.pull], ['TICKET-7', 'PASS', 'PASS', true, 'auto']);
  assert.deepEqual([t9.source, t9.out, t9.in, t9.pull], ['TICKET-9', 'UNKNOWN', null, 'judge'], 'an unregistered stock is listed for judge-pull and a stale verdict is unknown');
  // Registration decides the mode only: it never changes a verdict.
  const unreg = resolveDeliveries({ ...other, registrations: [] }).deliveries[0];
  assert.deepEqual([unreg.out, unreg.in, unreg.pull], ['PASS', 'PASS', 'judge']);
  // No IN verdict at all: still ready, in not yet evaluated.
  const bare = resolveDeliveries({ ...other, verdicts: other.verdicts.filter((v) => v.side === 'out') }).deliveries[0];
  assert.deepEqual([bare.ready, bare.in], [true, null]);
}
