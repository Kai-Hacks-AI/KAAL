// Case controls/T1738 tests: controls/F235
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const FILE = join(scripts, 'lib/guide-cause.mjs');
export const id = 'controls/T1738';
export const tests = ['controls/F235'];
export const title = 'guideCause gives one pure line by kind that names the bucket and reset, the place and what was asked, quotes the platform message verbatim, and runControl returns it as guidance';
const base = { asked: 'read rules of branch main in a/b', place: 'GET /repos/a/b/rules/branches/main', status: 403, platformMessage: 'You have exceeded "a" limit' };
export async function run() {
  assert.ok(existsSync(FILE), 'scripts/lib/guide-cause.mjs is absent');
  const src = readFileSync(FILE, 'utf8');
  assert.doesNotMatch(src, /^\s*import /m, 'guideCause imports something, so it is not pure');
  const { guideCause } = await import(pathToFileURL(FILE).href);
  assert.equal(guideCause(undefined), null);
  const rate = guideCause({ ...base, kind: 'rate-limited', limit: { bucket: 'core', remaining: 0, resetAt: '2026-11-28T09:00:00Z', retryAfterSeconds: 3600 } });
  for (const part of ['rate-limited', 'core', '2026-11-28T09:00:00Z', base.asked]) assert.ok(rate.includes(part), `the rate-limit line names ${part}`);
  assert.ok(!rate.includes('\n'), 'one line');
  const forbidden = guideCause({ ...base, kind: 'forbidden' });
  for (const part of ['forbidden', '403', base.asked, base.place]) assert.ok(forbidden.includes(part), `the forbidden line names ${part}`);
  const missing = guideCause({ kind: 'not-found', asked: base.asked, place: base.place });
  for (const part of ['not-found', base.asked, base.place]) assert.ok(missing.includes(part), `the not-found line names ${part}`);
  assert.ok(guideCause({ kind: 'network', asked: base.asked, place: base.place }).includes(base.place));
  assert.ok(guideCause({ ...base, kind: 'other' }).includes(`"${base.platformMessage}"`) || guideCause({ ...base, kind: 'other' }).includes(base.platformMessage), 'the platform message is shown verbatim');
  assert.ok(guideCause({ kind: 'check-error', message: 'boom' }).includes('boom'));
  const { runControl } = await import(pathToFileURL(join(scripts, 'adapter.mjs')).href);
  const cause = { ...base, kind: 'forbidden' };
  const r = await runControl({ id: 'c/CTL1', mode: 'preventive', check: () => { throw Object.assign(new Error('x'), { failure: cause }); }, input: {}, boundary: {} });
  assert.equal(r.guidance, guideCause(cause), 'the result carries the same line');
}
