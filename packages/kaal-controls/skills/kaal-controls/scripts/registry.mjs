#!/usr/bin/env node
// DEPRECATED shim: the command line of the station registry, kept at its old path for callers that have not moved to hosting yet.
// It is not published (package.json files). The library is lib/registry.mjs. Delete this file when its callers read through hosting.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { registryAt } from './lib/registry.mjs';
export * from './lib/registry.mjs';
export function filesAt(repo, ref) {
  const g = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8', maxBuffer: 1 << 28 });
  return g('ls-tree', '-r', '--name-only', ref).split('\n').filter((p) => /\.(md|mjs|json)$/.test(p) && !/(^|\/)package-lock\.json$/.test(p)).map((p) => ({ path: p, text: g('show', `${ref}:${p}`).replace(/\r\n/g, '\n') }));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = Object.fromEntries(process.argv.slice(2).reduce((r, x, i, v) => (x.startsWith('--') ? [...r, [x.slice(2), v[i + 1]]] : r), []));
  console.log(JSON.stringify(registryAt(filesAt(a.repo, a.base), a.station, (a.stations ?? '').split(',').map((n) => n.trim()).filter(Boolean)), null, 2));
}
