// The shared set-up of the Cases of engineering/F102: the entry points, the workflow sources, and the live workflows.
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
export const root = new URL(import.meta.url).pathname.split('/packages/')[0];
export const dir = join(root, 'packages/kaal-engineering/13-source/controls');
export const RUNNERS = ['judge-run.mjs', 'check-run.mjs', 'evidence-run.mjs', 'registry-run.mjs'];
export const FILES = ['hosting-files.mjs', ...RUNNERS];
export const text = (p) => readFileSync(p, 'utf8');
export const entry = (name) => { const p = join(dir, name); return existsSync(p) ? text(p) : null; };
export const source = (name) => text(join(root, 'packages/kaal-engineering/13-source/workflows', name));
export const live = (name) => text(join(root, '.github/workflows', name));
export const scripts = join(root, 'packages/kaal-controls/skills/kaal-controls/scripts');
// The platform modules an entry point must not import: the reading is Hosting's.
export const PLATFORM = /from\s+['"]node:(fs|fs\/promises|child_process|path|os)['"]|require\(['"]node:(fs|child_process|path|os)/;
