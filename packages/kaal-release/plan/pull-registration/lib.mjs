// Shared by the pull/T460 to T463 Cases. Not a Case.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const registration = () => import(pathToFileURL(join(repo, 'engineering/release-management/05-src/pull-promotion/registration.mjs')).href);
export const script = () => import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
// A capability's Pull opt-in names the Core scope it opts in on; Engineering validates it against the accepted Core Registration (engineering/C15 evidence).
export const optIn = (scope) => JSON.stringify({ scope });
// Core evidence as engineering/C15 reads it from main: scopes claimed by holders, collisions, and the admitted Capability Nodes.
export const coreOf = (claims, extra = {}) => ({ registrations: { claims, collisions: [] }, capabilities: new Set(claims.map((c) => c.holder)), ...extra });
export const CORE = coreOf([{ scope: 'release', holder: 'Release' }, { scope: 'retro', holder: 'Retro' }]);
// A tree of main's tip: the files and their texts.
export const main = (files) => ({ ref: 'main', files });
// A registry as discoverRegistrations returns it for the given files of main.
export const discovered = async (files, core = CORE) => (await registration()).discoverRegistrations(main(files), core);
// The normalized, host-neutral registry the package consumes, as Engineering's KAAL adapter produces it from main's files.
export const registryOf = async (files, core = CORE) => (await discovered(files, core)).registry;
// A consumer's own normalized registry: no KAAL names, routes or branch conventions.
export const neutral = { accepted: true, stocks: [{ name: 'URGENT', routes: ['urg/*'] }, { name: 'ROUTINE', routes: ['rt/one/*'] }] };
export const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
// STOCK = the tests against the branch at its exact head (GREEN = PASS); IN = the destination's PR merge rules, only reported.
export const ok = { stock: 'PASS', in: 'PASS' };
export const hot = (name = 'fix-a', over = {}) => ({ class: 'HOTFIX', source: `hotfix/${name}`, name, ...ok, ...over });
export const wire = (name = 'hooks', over = {}) => ({ class: 'WIRE', source: `wire/${name}`, name, ...ok, ...over });
export const kaal = (name, over = {}) => ({ class: 'KAAL', source: name, name, ...ok, ...over });
