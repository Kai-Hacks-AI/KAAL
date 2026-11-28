// Case controls/T1739 tests: controls/F236
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
export const id = 'controls/T1739';
export const tests = ['controls/F236'];
export const title = 'a cause carried into the verdict, its guidance and its log line holds no token, bearer value, authorization value or URL secret, and a cause without one is unchanged';
const SECRETS = ['ghp_0123456789abcdefghijABCDEFGHIJ012345', 'ghs_0123456789abcdefghijABCDEFGHIJ012345', 'github_pat_11ABCDEFG0123456789_abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ', 'Bearer abcdef0123456789.token-value', 'Authorization: token s3cr3t-value-123', 'x-access-token:s3cr3tpass@github.com'];
const VALUES = { 'x-access-token:s3cr3tpass@github.com': 's3cr3tpass', 'Authorization: token s3cr3t-value-123': 's3cr3t-value-123', 'Bearer abcdef0123456789.token-value': 'abcdef0123456789.token-value' };
export async function run() {
  const { redactCause, guideCause } = await import(pathToFileURL(join(scripts, 'lib/guide-cause.mjs')).href);
  const { runControl } = await import(pathToFileURL(join(scripts, 'adapter.mjs')).href);
  const clean = { kind: 'forbidden', asked: 'read rules of branch main in a/b', place: 'GET /repos/a/b/rules/branches/main', status: 403, platformMessage: 'Resource not accessible by integration' };
  assert.deepEqual(redactCause(clean), clean, 'a cause with no credential is unchanged');
  for (const secret of SECRETS) {
    const dirty = { ...clean, asked: `read with ${secret}`, place: `${clean.place} ${secret}`, platformMessage: `denied for ${secret}` };
    const out = redactCause(dirty);
    const value = VALUES[secret] ?? secret;
    for (const field of ['asked', 'place', 'platformMessage']) assert.ok(!out[field].includes(value), `${field} still holds ${secret}`);
    assert.ok(out.platformMessage.includes('[redacted]'));
    assert.deepEqual({ kind: out.kind, status: out.status }, { kind: 'forbidden', status: 403 }, 'only the secret text changes');
    const r = await runControl({ id: 'c/CTL1', mode: 'preventive', check: () => { throw Object.assign(new Error(`failed with ${secret}`), { failure: dirty }); }, input: {}, boundary: {} });
    const seen = JSON.stringify({ cause: r.cause, guidance: r.guidance, log: r.log });
    assert.ok(!seen.includes(value), `the verdict leaks ${secret}`);
    assert.equal(r.verdict, 'UNKNOWN');
    const plain = await runControl({ id: 'c/CTL1', mode: 'preventive', check: () => { throw new Error(`boom ${secret}`); }, input: {}, boundary: {} });
    assert.ok(!JSON.stringify(plain).includes(value), `a plain error message leaks ${secret}`);
  }
  assert.ok(!guideCause(redactCause({ kind: 'other', asked: 'a', place: 'p', platformMessage: SECRETS[0] })).includes('ghp_'));
}
