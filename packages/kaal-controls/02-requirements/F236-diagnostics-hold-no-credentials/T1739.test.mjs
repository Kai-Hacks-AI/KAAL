// Case controls/T1739 tests: controls/F236
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
export const id = 'controls/T1739';
export const tests = ['controls/F236'];
export const title = 'what a verdict emits of a failure is an explicit safe shape: unexpected properties at any depth and wrongly typed fields are dropped, and no credential survives in any text, including the nested limit';
const SECRETS = [['ghp_0123456789abcdefghijABCDEFGHIJ012345'], ['ghs_0123456789abcdefghijABCDEFGHIJ012345'], ['github_pat_11ABCDEFG0123456789_abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ'], ['Bearer abcdef0123456789.token-value', 'abcdef0123456789.token-value'], ['Authorization: token s3cr3t-value-123', 's3cr3t-value-123'], ['x-access-token:s3cr3tpass@github.com', 's3cr3tpass']];
const clean = { kind: 'rate-limited', asked: 'read rules of branch main in a/b', place: 'GET /repos/a/b/rules/branches/main', status: 403, platformMessage: 'API rate limit exceeded', limit: { bucket: 'core', remaining: 0, resetAt: '2026-11-28T09:00:00Z', retryAfterSeconds: 3600 } };
export async function run() {
  const { safeCause, guideCause } = await import(pathToFileURL(join(scripts, 'lib/guide-cause.mjs')).href);
  const { runControl } = await import(pathToFileURL(join(scripts, 'adapter.mjs')).href);
  const go = (error) => runControl({ id: 'c/CTL1', mode: 'preventive', check: () => { throw error; }, input: {}, boundary: {} });
  const failing = (failure, message = 'x') => Object.assign(new Error(message), { failure });
  assert.deepEqual(safeCause(clean), clean, 'a failure with only safe fields and no credential is unchanged');
  assert.deepEqual(safeCause({ kind: 'network', asked: 'a', place: 'p' }), { kind: 'network', asked: 'a', place: 'p' }, 'absent optional fields stay absent');
  // unexpected properties, at any depth, are never emitted
  const extra = { ...clean, headers: { authorization: 'token zzz-secret-header' }, token: 'zzz-secret-token', url: 'https://x/?access_token=zzz-secret-query', body: { message: 'zzz-secret-body' }, authorization: 'zzz-secret-auth', limit: { ...clean.limit, headers: { 'x-ratelimit-remaining': '0' }, token: 'zzz-secret-nested' } };
  assert.deepEqual(safeCause(extra), clean, 'only the allowlisted fields remain');
  const viaVerdict = await go(failing(extra));
  assert.ok(!JSON.stringify({ cause: viaVerdict.cause, guidance: viaVerdict.guidance, log: viaVerdict.log }).includes('zzz-secret'), 'no unexpected property reaches the verdict, its guidance or its log line');
  assert.deepEqual(viaVerdict.cause, clean);
  // wrongly typed fields are dropped, never coerced
  assert.deepEqual(safeCause({ ...clean, status: '403', limit: { bucket: 'core', remaining: '0', resetAt: 5, retryAfterSeconds: 'soon' } }), { kind: 'rate-limited', asked: clean.asked, place: clean.place, platformMessage: clean.platformMessage, limit: { bucket: 'core' } });
  assert.equal(safeCause({ kind: 'forbidden', asked: 'a', place: 'p', limit: { bucket: 'core' } }).limit, undefined, 'a limit belongs to a rate limit only');
  // a credential is redacted in every text of the shape, the nested limit included
  for (const [secret, value = secret] of SECRETS) {
    const dirty = { ...clean, asked: `read with ${secret}`, place: `${clean.place} ${secret}`, platformMessage: `denied for ${secret}`, limit: { ...clean.limit, bucket: `core ${secret}`, resetAt: secret } };
    const out = safeCause(dirty);
    for (const text of [out.asked, out.place, out.platformMessage, out.limit.bucket, out.limit.resetAt]) assert.ok(!text.includes(value), `a text still holds ${secret}`);
    assert.ok(out.platformMessage.includes('[redacted]') && out.limit.bucket.includes('[redacted]'));
    assert.deepEqual({ kind: out.kind, status: out.status, remaining: out.limit.remaining }, { kind: 'rate-limited', status: 403, remaining: 0 }, 'only the secret text changes');
    const r = await go(failing(dirty, `failed with ${secret}`));
    assert.ok(!JSON.stringify({ cause: r.cause, guidance: r.guidance, log: r.log }).includes(value), `the verdict leaks ${secret}`);
    assert.equal(r.verdict, 'UNKNOWN');
    const plain = await go(new Error(`boom ${secret}`));
    assert.ok(!JSON.stringify(plain).includes(value), `a plain error message leaks ${secret}`);
  }
  assert.ok(!guideCause(safeCause({ kind: 'other', asked: 'a', place: 'p', platformMessage: SECRETS[0][0] })).includes('ghp_'));
}
