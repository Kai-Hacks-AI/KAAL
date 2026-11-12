// Case coordination/T10 tests: F11
import assert from 'node:assert/strict';
import { analyzeFlow, declaration, facts } from './fixtures.mjs';
export const id = 'coordination/T10';
export const tests = ['coordination/F11'];
export const title = 'a hold makes the entry escalate for the owner; the Script prints no command and authorizes nothing';
export async function run() {
  const held = declaration({ holds: [{ target: 'col-a', reason: 'the owner holds this promotion' }] });
  const result = await analyzeFlow(facts(), held);
  const entry = result.actions.find((a) => a.action === 'OPEN' && a.target === 'col-a');
  assert.ok(entry, 'the held pair is dropped instead of shown');
  assert.equal(entry.status, 'escalate', 'a hold does not make the entry escalate');
  assert.equal(entry.authority, 'owner', 'a hold does not name the owner as the authority');
  assert.match(entry.reason, /hold/i, 'the hold is not given as the reason');
  for (const a of result.actions) assert.ok(!('command' in a) && !('run' in a), 'an entry carries a command');
  assert.ok(!/\b(?:gh |git push|git land|--auto)\b/.test(JSON.stringify(result)), 'the output contains a command');
}
