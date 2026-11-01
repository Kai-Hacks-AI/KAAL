import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
const canonical = value => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return Array.from(value, canonical);
  if (value && Object.getPrototypeOf(value) === Object.prototype)
    return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  throw new TypeError('digest inputs must be complete JSON values');
};
export const digest = value => sha256(new TextEncoder().encode(JSON.stringify(canonical(value))));
