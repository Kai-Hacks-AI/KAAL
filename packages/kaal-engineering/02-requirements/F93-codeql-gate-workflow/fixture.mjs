// The shared set-up of the Cases of engineering/F93: where the CodeQL workflow source sits.
import { join } from 'node:path';
const root = new URL(import.meta.url).pathname.split('/packages/')[0];
export const src = join(root, 'packages/kaal-engineering/13-source/workflows/codeql.yml');
