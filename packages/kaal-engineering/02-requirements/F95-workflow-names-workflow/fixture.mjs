// The shared set-up of the Cases of engineering/F95: where the workflow source sits, and its steps.
import { join } from 'node:path';
const root = new URL(import.meta.url).pathname.split('/packages/')[0];
export const src = join(root, 'packages/kaal-engineering/13-source/workflows/verify-workflow-names.yml');
// The text of each `run:` of the file, a block scalar joined into one string.
export const runs = (text) => [...text.matchAll(/^\s*(?:- )?run:\s*(\|[-+]?\n((?:\s{10,}.*\n?)+)|(.+))$/gm)].map((m) => (m[2] ?? m[3]).trim());
