// Shared by the pull/T51 to T54 Cases. Not a Case.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const registration = () => import(pathToFileURL(join(repo, 'engineering/release-management/05-src/pull-promotion/registration.mjs')).href);
export const script = () => import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
export const ROUTES_PATH = 'engineering/release-management/05-src/pull-promotion/kaal-pull.json';
export const ROUTES = JSON.stringify({ classRoutes: { HOTFIX: ['hotfix/*'], WIRE: ['wire/*'] } });
export const capability = (name, collectors) => JSON.stringify({ capability: name, collectors });
// A tree of main's tip: the files and their texts.
export const main = (files) => ({ ref: 'main', files });
// A registry as discoverRegistrations returns it for the given files of main.
export const registryOf = async (files) => (await registration()).discoverRegistrations(main(files));
export const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
export const ok = { out: 'PASS', in: 'PASS' };
export const hot = (name = 'fix-a', over = {}) => ({ class: 'HOTFIX', source: `hotfix/${name}`, name, ...ok, ...over });
export const wire = (name = 'hooks', over = {}) => ({ class: 'WIRE', source: `wire/${name}`, name, ...ok, ...over });
export const kaal = (name, over = {}) => ({ class: 'KAAL', source: name, name, ...ok, ...over });
