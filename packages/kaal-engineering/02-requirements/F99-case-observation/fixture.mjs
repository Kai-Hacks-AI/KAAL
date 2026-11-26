// The shared set-up of the Cases of engineering/F99: where the workflow source sits.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = new URL(import.meta.url).pathname.split('/packages/')[0];
export const workflowPath = join(root, 'packages/kaal-engineering/13-source/workflows/observe-cases.yml');
export const load = () => { if (!existsSync(workflowPath)) throw new Error('observe-cases.yml does not exist'); return readFileSync(workflowPath, 'utf8'); };
