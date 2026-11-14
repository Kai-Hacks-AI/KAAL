// Shared by the pull-declare Cases. Not a Case.
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const declaration = JSON.parse(readFileSync(join(repo, 'engineering/release-management/05-src/pull-promotion/declaration.json'), 'utf8'));
export const deltas = JSON.parse(readFileSync(fileURLToPath(new URL('./fixtures/deltas.json', import.meta.url)), 'utf8'));
export const NEW = ['kaal/engineering/collector-capability', 'kaal/guard/registration', 'kaal/retro/skill'];
export const entry = (name) => declaration.collectors.find((c) => c.name === name);
export const scopeOf = (name) => (entry(name)?.scope ?? []).map((p) => new RegExp(p));
export const matches = (res, path) => res.some((re) => re.test(path));
export const script = () => import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
