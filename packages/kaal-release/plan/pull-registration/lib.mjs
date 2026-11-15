// Shared by the pull/T460 to T463 Cases. Not a Case.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const registration = () => import(pathToFileURL(join(repo, 'engineering/release-management/05-src/pull-promotion/registration.mjs')).href);
export const script = () => import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
export const ROUTES_PATH = 'engineering/release-management/05-src/pull-promotion/kaal-pull.json';
export const ROUTES = JSON.stringify({ classRoutes: { HOTFIX: ['hotfix/*'], WIRE: ['wire/*'] } });
// A capability registers its STOCK (every branch under the scope is one stock item), never a list of branches.
export const capability = (name, stock = `kaal/${name}/*`) => JSON.stringify({ capability: name, stock });
// A tree of main's tip: the files and their texts.
export const main = (files) => ({ ref: 'main', files });
// A registry as discoverRegistrations returns it for the given files of main.
export const discovered = async (files) => (await registration()).discoverRegistrations(main(files));
// The normalized, host-neutral registry the package consumes, as Engineering's KAAL adapter produces it from main's files.
export const registryOf = async (files) => (await discovered(files)).registry;
// A consumer's own normalized registry: no KAAL names, routes or branch conventions.
export const neutral = { accepted: true, authority: 'consumer .kaal configuration', classes: [{ name: 'URGENT', routes: ['urg/*'] }, { name: 'ROUTINE', routes: ['rt/one/*'] }] };
export const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
export const ok = { out: 'PASS', in: 'PASS' };
export const hot = (name = 'fix-a', over = {}) => ({ class: 'HOTFIX', source: `hotfix/${name}`, name, ...ok, ...over });
export const wire = (name = 'hooks', over = {}) => ({ class: 'WIRE', source: `wire/${name}`, name, ...ok, ...over });
export const kaal = (name, over = {}) => ({ class: 'KAAL', source: name, name, ...ok, ...over });
