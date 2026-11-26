// The shared set-up of the Cases of engineering/F98: where the definition sits, and a small matcher for its branch patterns.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = new URL(import.meta.url).pathname.split('/packages/')[0];
const refs = join(root, 'packages/kaal-engineering/skills/kaal-engineering/references');
export const definitionPath = join(refs, 'pull-request-types.json');
export const areasPath = join(refs, 'write-areas.json');
export const load = () => { if (!existsSync(definitionPath)) throw new Error('pull-request-types.json does not exist'); return JSON.parse(readFileSync(definitionPath, 'utf8')); };
export const loadAreas = () => JSON.parse(readFileSync(areasPath, 'utf8'));
// A branch matches a pattern when it has the same segments; `*` stands for any characters of one segment.
export const matches = (branch, pattern) => new RegExp(`^${pattern.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}$`).test(branch);
