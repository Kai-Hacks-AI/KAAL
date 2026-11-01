// Unwired authentication. CryptoKey/JWKS trust, clock and atomic replay store are
// supplied by the trusted composition root; no discovery, network or credentials.
import { digest } from '../policy-identity.mjs';
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const receipts = new WeakMap();
const deliveries = new WeakMap();
const fail = why => { throw new Error(`unauthenticated: ${why}`); };
const b64 = text => {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) fail('malformed JWS encoding');
  return Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
};
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export function receiptFacts(handle) {
  const facts = handle && receipts.get(handle);
  if (!facts) fail('receipt capability unavailable');
  return facts;
}
export function deliveryFacts(handle) {
  const facts = handle && deliveries.get(handle);
  if (!facts) fail('delivery capability unavailable');
  return facts;
}
export function createAuthenticator({ subtle, webhookKey, issuerKeys, audience, attestorRef, attestorSha,
  replay, repositoryId = 1415996637, installationId, nativeTrust = null }) {
  if (!subtle?.verify || !replay?.claim || !audience || !attestorRef || !/^[a-f0-9]{40}$/.test(attestorSha) ||
      !Number.isSafeInteger(installationId)) throw new TypeError('trusted authentication dependencies required');
  const keys = new Map(Object.entries(issuerKeys ?? {}));
  if (!keys.size || [...keys.values()].some(key => key?.type !== 'public' ||
      key.algorithm?.name !== 'RSASSA-PKCS1-v1_5' || key.algorithm.hash?.name !== 'SHA-256' ||
      key.algorithm.modulusLength < 2048) || webhookKey?.type !== 'secret' ||
      webhookKey.algorithm?.name !== 'HMAC' || webhookKey.algorithm.hash?.name !== 'SHA-256')
    throw new TypeError('pinned RS256 public keys and SHA-256 HMAC key required');
  const remember = async (space, id, facts, table) => {
    if (!await replay.claim(`${space}:${id}`)) fail('duplicate/replayed authentication');
    const handle = Object.freeze({ kind: space }); table.set(handle, freeze(structuredClone(facts))); return handle;
  };
  const native = nativeTrust && freeze(structuredClone(nativeTrust));
  if (native && (repositoryId !== 1415996637 || native.workflowId !== 384461082 ||
      native.path !== '.github/workflows/lineage-synchronization.yml' || native.event !== 'pull_request_target' ||
      !/^[a-f0-9]{40}$/.test(native.workflowSha) || !/^[a-f0-9]{64}$/.test(native.sourceDigest)))
    throw new TypeError('only independently pinned native Branching source is supported');
  async function verify(token, now) {
    if (typeof token !== 'string' || token.length > 32768 || !Number.isSafeInteger(now)) fail('receipt unavailable');
    const parts = token.split('.'); if (parts.length !== 3) fail('malformed JWS');
    let header, claims;
    try { header = JSON.parse(decoder.decode(b64(parts[0]))); claims = JSON.parse(decoder.decode(b64(parts[1]))); }
    catch { fail('malformed JWS JSON'); }
    if (!header || !claims || header.alg !== 'RS256' || header.typ !== 'JWT' || !keys.has(header.kid) ||
        ['jku', 'jwk', 'x5u', 'crit', 'b64'].some(k => k in header)) fail('untrusted JWS header/key');
    if (!await subtle.verify('RSASSA-PKCS1-v1_5', keys.get(header.kid), b64(parts[2]), encoder.encode(parts[0] + '.' + parts[1]))) fail('receipt signature');
    const sec = Math.floor(now / 1000);
    if (claims.iss !== 'https://token.actions.githubusercontent.com' ||
        !Number.isSafeInteger(claims.exp) || !Number.isSafeInteger(claims.nbf) || !Number.isSafeInteger(claims.iat) ||
        claims.nbf < 0 || claims.iat < 0 || claims.nbf > sec || claims.iat > sec || claims.exp <= sec ||
        claims.exp <= claims.iat || claims.nbf >= claims.exp || claims.exp - claims.iat > 600 ||
        typeof claims.jti !== 'string' || !claims.jti) fail('receipt issuer/time');
    return {claims,header};
  }
  function bind(claims, expected) {
    for (const [key, value] of Object.entries({ ...expected, repository_id: repositoryId }))
      if (!['string', 'number'].includes(typeof value) || !['string', 'number'].includes(typeof claims[key]) ||
          String(claims[key]) !== String(value)) fail(`receipt binding ${key}`);
  }
  return Object.freeze({
    async nativeReceipt(token, expected, now) {
      if (!native || !/^[a-f0-9]{64}$/.test(expected?.nonce) || !/^[a-f0-9]{64}$/.test(expected?.proofDigest) ||
          !['run_id','run_attempt','check_run_id','workflow_ref','workflow_sha','event_name','ref','base_ref']
            .every(k => Object.hasOwn(expected.claims ?? {},k))) fail('native registration unavailable');
      const {claims,header} = await verify(token,now);
      if (claims.aud !== `${audience}/native/${expected.nonce}/${expected.proofDigest}` ||
          claims.workflow_sha !== native.workflowSha || claims.event_name !== native.event ||
          claims.workflow_ref !== `Kai-Hacks-AI/KAAL/${native.path}@${expected.claims.ref}` ||
          'job_workflow_ref' in claims || 'job_workflow_sha' in claims) fail('native source/audience/profile');
      bind(claims,expected.claims);
      // Verification alone does not consume JTI. The ingress atomically commits
      // nonce + JTI + sealed fact. An opaque verification is not a persisted fact.
      const handle = Object.freeze({kind:'native-verification'});
      receipts.set(handle,freeze(structuredClone({claims,issuerKeyId:header.kid,
        profile:'trusted-native-policy-producer/v1',source:native,nonce:expected.nonce,proofDigest:expected.proofDigest})));
      return handle;
    },
    async webhook(bytes, headers) {
      if (!(bytes instanceof Uint8Array) || !webhookKey ||
          !/^sha256=[a-f0-9]{64}$/.test(headers?.signature ?? '') || !headers.deliveryId) fail('webhook signature missing');
      const signature = Uint8Array.from(headers.signature.slice(7).match(/../g), h => parseInt(h, 16));
      if (!await subtle.verify('HMAC', webhookKey, signature, bytes)) fail('webhook signature');
      const payload = JSON.parse(decoder.decode(bytes));
      if (payload.repository?.id !== repositoryId || payload.installation?.id !== installationId) fail('webhook repository/installation');
      // Unsigned delivery/event headers are not policy authority. The authenticated
      // body fingerprint also prevents a replay with a different delivery header.
      return remember('webhook', digest(Array.from(bytes)), { deliveryId: headers.deliveryId, payload }, deliveries);
    },
    async receipt(token, expected, now) {
      const {claims} = await verify(token,now);
      if (claims.aud !== `${audience}/${expected.contextDigest}` || claims.job_workflow_ref !== attestorRef ||
          claims.job_workflow_sha !== attestorSha) fail('receipt issuer/audience/time/attestor');
      if (!/^[a-f0-9]{64}$/.test(expected?.contextDigest) || !expected.claims) fail('receipt expected context');
      bind(claims,expected.claims);
      return remember('receipt', claims.jti, { claims, contextDigest: expected.contextDigest }, receipts);
    },
  });
}
