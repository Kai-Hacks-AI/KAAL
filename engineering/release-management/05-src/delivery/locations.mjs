// The delivery locations of KAAL, read from the declaration of the delivery architecture (release/A67). Pure but for the one file read.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DECLARATION = join(dirname(fileURLToPath(import.meta.url)), '../../03-architecture/A67-delivery-locations/delivery-locations.json');

const NAME = /^[A-Za-z0-9_.-]+$/;

// One entry of `locations` (a root) or of `files` (a file at the repository root): a safe single-segment name and a boolean `wirable`.
function entry(e, key, kind, seen) {
  const n = e?.[key];
  if (typeof n !== 'string' || !NAME.test(n) || n === '.' || n === '..') throw new Error(`the delivery declaration has a malformed ${kind}: ${String(n)}`);
  if (seen.has(n)) throw new Error(`the delivery declaration names ${n} twice`);
  seen.add(n);
  if (typeof e.wirable !== 'boolean') throw new Error(`the delivery declaration does not say whether ${n} is wirable`);
  return n;
}

// Validates a parsed declaration and returns { roots, wirable, files }. `roots` and `files` are the delivery locations (every one is delivery),
// `wirable` the roots a WIRE may install into. Throws on anything malformed: a consumer never falls back to a list of its own.
export function parseLocations(json) {
  const list = json?.locations;
  if (!Array.isArray(list) || !list.length) throw new Error('the delivery declaration has no locations');
  const named = json.files ?? [];
  if (!Array.isArray(named)) throw new Error('the delivery declaration has a malformed files list');
  const seen = new Set();
  const roots = [], wirable = [], files = [];
  for (const l of list) {
    const r = entry(l, 'root', 'root', seen);
    roots.push(r);
    if (l.wirable) wirable.push(r);
  }
  for (const f of named) files.push(entry(f, 'path', 'file', seen));
  return { roots, wirable, files };
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

// Is this repository-relative path a delivery path: under a delivery root, or one of the delivery files at the root?
export function isDelivery(path, locations) {
  const parts = String(path).split('/');
  return Boolean(locations) && (parts.length > 1 ? locations.roots.includes(parts[0]) : locations.files.includes(parts[0]));
}
