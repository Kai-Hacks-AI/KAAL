// Shared by the pull/T47 to T50 Cases. Not a Case.
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const declaration = JSON.parse(readFileSync(join(repo, 'engineering/release-management/05-src/pull-promotion/declaration.json'), 'utf8'));
const fixture = (name) => JSON.parse(readFileSync(fileURLToPath(new URL(`./${name}`, import.meta.url)), 'utf8'));
// deltas.json: the real file lists at the collector heads read on the host. inflight.json: the same lists with the open DO/ACT pull
// requests (#1652, #1659, #1661) applied, so a scope or a Case pattern is not fitted to a layout that is about to change.
export const deltas = fixture('deltas.json');
export const inflight = fixture('inflight.json');
export const LAYOUTS = [deltas, inflight];
export const NEW = ['kaal/engineering/collector-capability', 'kaal/guard/registration', 'kaal/retro/skill', 'kaal/release/githooks-split', 'kaal/release/wire-operation'];
export const entry = (name) => declaration.collectors.find((c) => c.name === name);
export const scopeOf = (name) => (entry(name)?.scope ?? []).map((p) => new RegExp(p));
export const matches = (res, path) => res.some((re) => re.test(path));
export const script = () => import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
