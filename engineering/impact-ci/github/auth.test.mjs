import test from 'node:test';
import assert from 'node:assert/strict';
import { receiptFacts, deliveryFacts } from './auth.mjs';
import { authFixture, signedBody, token, providerFixture, claimsFor } from './fixtures.mjs';
function receiptInput() {
  const h = providerFixture(), w = Object.values(h.f.context.producers)[0];
  const workflow = { path: Object.keys(h.f.context.producers)[0], event: 'pull_request' };
  const claims = claimsFor(h.f, workflow, w);
  return { h, claims, expected: { contextDigest: h.f.authority.contextDigest, claims: {
    run_id: w.runId, run_attempt: w.attempt, check_run_id: w.attestorCheckRunId,
    workflow_sha: w.workflowSha, workflow_ref: claims.workflow_ref, event_name: 'pull_request', ref: w.ref,
  } } };
}
test('signed raw webhook authenticates installation/repository and mints opaque facts', async () => {
  const auth = authFixture(), signed = await signedBody({ repository: { id: 1415996637 }, installation: { id: 777 } });
  const handle = await auth.webhook(signed.bytes, signed.headers);
  assert.equal(deliveryFacts(handle).payload.repository.id, 1415996637);
  assert.throws(() => deliveryFacts(structuredClone(handle)), /capability/);
  await assert.rejects(auth.webhook(signed.bytes, { ...signed.headers, deliveryId: 'different-unsigned-id' }), /replay/);
});
for (const defect of ['tamper', 'repository', 'installation', 'missing signature']) test(`webhook refuses ${defect}`, async () => {
  const body = { repository: { id: defect === 'repository' ? 1 : 1415996637 }, installation: { id: defect === 'installation' ? 1 : 777 } };
  const signed = await signedBody(body);
  // Keep valid JSON and the same repository/installation. Only HMAC validation
  // can reject this changed body; a JSON/schema error must not mask its removal.
  if (defect === 'tamper') signed.bytes = new TextEncoder().encode(JSON.stringify({ ...body, action: 'forged' }));
  if (defect === 'missing signature') delete signed.headers.signature;
  await assert.rejects(authFixture().webhook(signed.bytes, signed.headers), /unauthenticated/);
});
test('RS256 receipt validates bindings and cannot be manufactured from JSON', async () => {
  const { h, claims, expected } = receiptInput(), auth = authFixture(), jwt = await token(claims);
  const handle = await auth.receipt(jwt, expected, h.f.now);
  assert.equal(receiptFacts(handle).claims.run_id, claims.run_id);
  assert.throws(() => receiptFacts({ claims }), /capability/);
  await assert.rejects(auth.receipt(jwt, expected, h.f.now), /replay/);
});
for (const [claim, value] of Object.entries({ iss: 'https://attacker.invalid', aud: 'other-context', exp: 0,
  nbf: 9999999999, iat: 9999999999, job_workflow_ref: 'candidate-controlled', job_workflow_sha: '0'.repeat(40),
  repository_id: 1, run_id: 2, run_attempt: 2, check_run_id: 1, workflow_sha: '0'.repeat(40),
  workflow_ref: 'wrong-workflow', event_name: 'push', ref: 'refs/heads/other', jti: '' }))
  test(`validly signed receipt refuses incorrect ${claim}`, async () => {
    const { h, claims, expected } = receiptInput();
    await assert.rejects(authFixture().receipt(await token({ ...claims, [claim]: value }), expected, h.f.now), /unauthenticated/);
  });
for (const header of [{ alg: 'none' }, { alg: 'HS256' }, { kid: 'unknown' }, { jku: 'https://attacker.invalid' }, { jwk: {} }, { crit: [] }])
  test(`receipt refuses untrusted JWS header ${JSON.stringify(header)}`, async () => {
    const { h, claims, expected } = receiptInput();
    await assert.rejects(authFixture().receipt(await token(claims, header), expected, h.f.now), /unauthenticated/);
  });
test('modified signature and overlong validity fail authentication', async () => {
  const { h, claims, expected } = receiptInput();
  const jwt = await token(claims), parts = jwt.split('.');
  parts[2] = (parts[2][0] === 'a' ? 'b' : 'a') + parts[2].slice(1);
  await assert.rejects(authFixture().receipt(parts.join('.'), expected, h.f.now), /signature/);
  await assert.rejects(authFixture().receipt(await token({ ...claims, exp: claims.iat + 601 }), expected, h.f.now), /time/);
});
