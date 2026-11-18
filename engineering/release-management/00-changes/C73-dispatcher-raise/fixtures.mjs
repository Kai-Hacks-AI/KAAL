// Shared scaffolding of the C73 Cases: the sources, and GitHub stood in for.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const SRC = join(repo, 'engineering/release-management/05-src/promotion-raise');
export const WORKFLOW = join(repo, 'engineering/release-management/05-src/wiring/workflows/dispatcher.yml');
export const load = (f) => import(pathToFileURL(join(SRC, f)).href).catch(() => ({}));
export const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
export const src = (f) => read(join(SRC, f));
export const code = (t) => t.split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('#')).join('\n');
// A GitHub stand-in: routes map "METHOD path" to an answer; every call is recorded; a route it does not know throws.
export function fakeApi(routes) {
  const calls = [];
  const api = async (method, path, body) => {
    calls.push({ method, path, body });
    const r = routes[`${method} ${path}`];
    if (r === undefined) throw new Error(`unexpected call ${method} ${path}`);
    return typeof r === 'function' ? r(body) : r;
  };
  api.calls = calls;
  return api;
}
export const R = 'Kai-Hacks-AI/KAAL';
export const decision = (over = {}) => ({ action: 'raise', head: 'kaal/release/small-thing', base: 'main', title: 'PROMOTION: something small, 4L retrospective (release/C99)', body: '## Change\n\nrelease/C99 something small\n\n## Reason\n\nthe ACT #7 of this collector merged, and the collector is ahead of main by 3 commit(s).\n', ...over });
