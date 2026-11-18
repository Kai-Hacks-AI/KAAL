// Shared scaffolding of the C72 Cases.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const SRC = join(repo, 'engineering/release-management/05-src/promotion-raise');
export const load = (f) => import(pathToFileURL(join(SRC, f)).href).catch(() => ({}));
export const read = (p) => readFileSync(join(repo, p), 'utf8');
export const act = (n = 7, change = 'release/C99 something small') => ({ number: n, title: 'ACT: something small, 4L retrospective (release/C99)', body: `## Change\n\n${change}\n\n## Reason\n\nretrospective\n` });
export const facts = (over = {}) => ({ collector: 'kaal/release/small-thing', aheadOfMain: 3, merged: [act()], open: [], ...over });
