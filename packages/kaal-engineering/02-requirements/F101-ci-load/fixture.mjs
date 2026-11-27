// The shared set-up of the Cases of engineering/F101: the workflow source, the live workflow, and its blocks.
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
const root = new URL(import.meta.url).pathname.split('/packages/')[0];
export const srcPath = join(root, 'packages/kaal-engineering/13-source/workflows/ci.yml');
export const livePath = join(root, '.github/workflows/ci.yml');
export const read = (p) => readFileSync(p, 'utf8');
// The text with its `on:` block and its `concurrency:` block removed (each runs to the next top-level key).
export const without = (text) => text.replace(/^on:\n(?: .*\n|\n)*/m, '').replace(/^concurrency:\n(?: .*\n|\n)*/m, '');
export const onBlock = (text) => text.match(/^on:\n((?: .*\n)+)/m)?.[1] ?? '';
export const concurrencyBlock = (text) => text.match(/^concurrency:\n((?: .*\n)+)/m)?.[1] ?? '';
