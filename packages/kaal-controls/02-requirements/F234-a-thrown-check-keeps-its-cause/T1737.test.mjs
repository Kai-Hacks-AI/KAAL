// Case controls/T1737 tests: controls/F234
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const ADAPTER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
export const id = 'controls/T1737';
export const tests = ['controls/F234'];
export const title = 'a check that throws leaves an UNKNOWN verdict that carries the typed failure unchanged, or its own message, and never turns a cause into a pass or a fail';
const failure = (kind, extra = {}) => ({ kind, asked: 'read rules of branch main in a/b', place: 'GET /repos/a/b/rules/branches/main', status: 403, platformMessage: 'API rate limit exceeded', ...extra });
const throwing = (error) => () => { throw error; };
const boundary = { x: 'real', run: 'r1', sha: 'abc' };
export async function run() {
  const { runControl } = await import(pathToFileURL(ADAPTER).href);
  const go = (check, mode = 'preventive') => runControl({ id: 'c/CTL1', mode, check, input: {}, boundary });
  for (const kind of ['rate-limited', 'forbidden', 'not-found', 'network', 'other']) {
    const f = failure(kind, kind === 'rate-limited' ? { limit: { bucket: 'core', remaining: 0, resetAt: '2026-11-28T09:00:00Z', retryAfterSeconds: 3600 } } : {});
    const r = await go(throwing(Object.assign(new Error('Hosting text'), { failure: f })));
    assert.equal(r.verdict, 'UNKNOWN', `${kind} is not a pass or a fail`);
    assert.deepEqual(r.cause, f, `${kind}: the typed failure is carried unchanged`);
    assert.equal(r.blocked, true, 'a blocking mode still blocks');
    assert.deepEqual({ kind: r.log.cause?.kind, asked: r.log.cause?.asked, place: r.log.cause?.place }, { kind, asked: f.asked, place: f.place }, 'the log line says why');
  }
  const detective = await go(throwing(Object.assign(new Error('x'), { failure: failure('network') })), 'detective');
  assert.equal(detective.verdict, 'UNKNOWN'); assert.equal(detective.blocked, false);
  const plain = await go(throwing(new Error('boom')));
  assert.deepEqual(plain.cause, { kind: 'check-error', message: 'boom' }, 'a plain error is its own cause');
  for (const bad of [failure('weird'), { kind: 'network', place: 'p' }, { kind: 'network', asked: 'a' }, 'rate-limited']) {
    const r = await go(throwing(Object.assign(new Error('bad shape'), { failure: bad })));
    assert.deepEqual(r.cause, { kind: 'check-error', message: 'bad shape', malformed: true }, 'a failure of the wrong shape is never typed');
    assert.equal(r.verdict, 'UNKNOWN');
  }
  const kept = await go(throwing(Object.assign(new Error('x'), { failure: failure('forbidden'), confirmed: ['a'] })));
  assert.deepEqual(kept.confirmed, ['a'], 'what a check confirmed is kept next to the cause');
  const ok = await go(() => []);
  assert.equal(ok.verdict, 'PASS'); assert.equal('cause' in ok, false); assert.equal('guidance' in ok, false);
}
