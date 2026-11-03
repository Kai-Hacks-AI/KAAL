import { digest } from '../../policy-identity.mjs';
const bytes = fact => new TextEncoder().encode(`kaal.executed-fact/v1:${digest(fact)}`);
export function createFactSealer({ subtle, keyId, privateKey = null, publicKeys }) {
  const keys = new Map(Object.entries(publicKeys ?? {}));
  if (!subtle?.verify || !keys.size || [...keys.values()].some(k => k.type !== 'public' || k.algorithm?.name !== 'Ed25519'))
    throw new TypeError('trusted Ed25519 fact verification keys required');
  return Object.freeze({
    async sign(fact) {
      if (!privateKey || privateKey.type !== 'private' || privateKey.algorithm?.name !== 'Ed25519' || !keys.has(keyId))
        throw new Error('fact signing key unavailable');
      return { keyId, signature: Array.from(new Uint8Array(await subtle.sign('Ed25519',privateKey,bytes(fact)))) };
    },
    async verify(fact, seal) {
      if (!seal || !keys.has(seal.keyId) || !Array.isArray(seal.signature) || seal.signature.length !== 64 ||
          seal.signature.some(x => !Number.isInteger(x) || x < 0 || x > 255)) return false;
      return subtle.verify('Ed25519',keys.get(seal.keyId),Uint8Array.from(seal.signature),bytes(fact));
    },
  });
}
