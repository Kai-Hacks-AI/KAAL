// The delivery locations of KAAL, read from the declaration of the delivery architecture (release/A67). Pure but for the one file read.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DECLARATION = join(dirname(fileURLToPath(import.meta.url)), '../../03-architecture/A67-delivery-locations/delivery-locations.json');

const ROOT = /^[A-Za-z0-9_.-]+$/;

// Validates a parsed declaration and returns { roots, wirable }. Throws on anything malformed: a consumer never falls back to a list of its own.
export function parseLocations(json) {
  const list = json?.locations;
  if (!Array.isArray(list) || !list.length) throw new Error('the delivery declaration has no locations');
  const roots = [];
  const wirable = [];
  for (const l of list) {
    const r = l?.root;
    if (typeof r !== 'string' || !ROOT.test(r) || r === '.' || r === '..') throw new Error(`the delivery declaration has a malformed root: ${String(r)}`);
    if (roots.includes(r)) throw new Error(`the delivery declaration names ${r} twice`);
    if (typeof l.wirable !== 'boolean') throw new Error(`the delivery declaration does not say whether ${r} is wirable`);
    roots.push(r);
    if (l.wirable) wirable.push(r);
  }
  return { roots, wirable };
}

export function readLocations(path = DECLARATION) {
  return parseLocations(JSON.parse(readFileSync(path, 'utf8')));
}

// One file under a wirable root: safe characters, at least two segments, no `..`, not absolute.
export function wirableTarget(path, locations) {
  if (typeof path !== 'string' || !/^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)+$/.test(path)) return false;
  const parts = path.split('/');
  if (parts.includes('..') || parts.includes('.')) return false;
  return Boolean(locations?.wirable?.includes(parts[0]));
}
