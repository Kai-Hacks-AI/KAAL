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
  replay, repositoryId = 1415996637, installationId }) {
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
  return Object.freeze({
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
      if (typeof token !== 'string' || token.length > 32768 || !Number.isSafeInteger(now)) fail('receipt unavailable');
      const parts = token.split('.'); if (parts.length !== 3) fail('malformed JWS');
      const header = JSON.parse(decoder.decode(b64(parts[0]))), claims = JSON.parse(decoder.decode(b64(parts[1])));
      if (header.alg !== 'RS256' || header.typ !== 'JWT' || !keys.has(header.kid) ||
          ['jku', 'jwk', 'x5u', 'crit', 'b64'].some(k => k in header)) fail('untrusted JWS header/key');
      if (!await subtle.verify('RSASSA-PKCS1-v1_5', keys.get(header.kid), b64(parts[2]), encoder.encode(parts[0] + '.' + parts[1]))) fail('receipt signature');
      const sec = Math.floor(now / 1000);
      if (claims.iss !== 'https://token.actions.githubusercontent.com' || claims.aud !== `${audience}/${expected.contextDigest}` ||
          !Number.isSafeInteger(claims.exp) || !Number.isSafeInteger(claims.nbf) || !Number.isSafeInteger(claims.iat) ||
          claims.nbf < 0 || claims.iat < 0 || claims.nbf > sec || claims.iat > sec || claims.exp <= sec ||
          claims.exp <= claims.iat || claims.nbf >= claims.exp || claims.exp - claims.iat > 600 ||
          typeof claims.jti !== 'string' || !claims.jti || claims.job_workflow_ref !== attestorRef ||
          claims.job_workflow_sha !== attestorSha) fail('receipt issuer/audience/time/attestor');
      if (!/^[a-f0-9]{64}$/.test(expected?.contextDigest) || !expected.claims) fail('receipt expected context');
      for (const [key, value] of Object.entries({ ...expected.claims, repository_id: repositoryId }))
        if (!['string', 'number'].includes(typeof value) || !['string', 'number'].includes(typeof claims[key]) ||
            String(claims[key]) !== String(value)) fail(`receipt binding ${key}`);
      return remember('receipt', claims.jti, { claims, contextDigest: expected.contextDigest }, receipts);
    },
  });
}
