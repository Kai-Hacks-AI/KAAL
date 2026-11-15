// Case pull/T432 tests: pull/F52
import assert from 'node:assert/strict';
export const id = 'pull/T432';
export const tests = ['pull/F52'];
export const title = 'the adapter lists only this installation\'s stock branches, with GET calls only';

export async function run() {
  const mod = await import('../../../../engineering/release-management/05-src/pull-promotion/gather.mjs');
  // The routes come from the Engineering-owned kaal-pull.json, never from the adapter.
  const routes = { 'kaal/': 'KAAL', 'hotfix/': 'HOTFIX', 'wire/': 'WIRE' };
  const heads = ['main', 'kaal/hosting/a', 'hotfix/x', 'wire/y', 'feature/z', 'claude/t', 'hotfix/'].map((ref, i) => ({ ref, sha: `s${i}` }));
  const f = mod.toFacts({ heads, verdicts: [], routes, registrations: [] });
  assert.deepEqual(f.candidates.map((c) => [c.class, c.id, c.revision]), [['KAAL', 'kaal/hosting/a', 's1'], ['HOTFIX', 'hotfix/x', 's2'], ['WIRE', 'wire/y', 's3']], 'main, development branches or an empty name became stock');
  const alt = mod.toFacts({ heads, verdicts: [], routes: { 'feature/': 'KAAL' }, registrations: [] });
  assert.deepEqual(alt.candidates.map((c) => c.id), ['feature/z'], 'the adapter used a literal prefix');
  const seen = [];
  const client = async (method, path) => { seen.push(method); if (/verdict|check-runs/.test(path)) throw new Error('unreachable'); return []; };
  const facts = await mod.readFacts({ client, owner: 'o', repo: 'r' });
  assert.ok(seen.length > 0 && seen.every((m) => m === 'GET'), `a non-GET request was made: ${seen.join(',')}`);
  assert.ok(Array.isArray(facts.heads) && Array.isArray(facts.verdicts));
  assert.ok(facts.unreadable && facts.unreadable.length > 0, 'the failed read was not recorded');
}
