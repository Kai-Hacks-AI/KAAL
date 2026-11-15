// Case pull/T54 tests: pull/F53
import assert from 'node:assert/strict';
export const id = 'pull/T54';
export const tests = ['pull/F53'];
export const title = 'the reader makes only GET requests and an unreadable fact stays UNKNOWN';

export async function run() {
  const mod = await import('../../../../engineering/release-management/05-src/pull-promotion/gather.mjs');
  const seen = [];
  const client = async (method, path) => { seen.push(method); if (/check-runs/.test(path)) throw new Error('unreachable'); return []; };
  const facts = await mod.readFacts({ client, owner: 'o', repo: 'r' });
  assert.ok(seen.length > 0 && seen.every((m) => m === 'GET'), `a non-GET request was made: ${seen.join(',')}`);
  assert.ok(Array.isArray(facts.heads) && Array.isArray(facts.checks));
  assert.ok(facts.unreadable && facts.unreadable.length > 0, 'the failed read was not recorded');
}
