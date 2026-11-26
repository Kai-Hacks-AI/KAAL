// The shared set-up of the Cases of engineering/F93: where the CodeQL workflow source sits.
import { join } from 'node:path';
const root = new URL(import.meta.url).pathname.split('/packages/')[0];
export const src = join(root, 'packages/kaal-engineering/13-source/workflows/codeql.yml');
// The two gate jobs of the source, found by their names (the control names of release/CTL34 and CTL35), and the text of the whole file.
export const GATES = ['verify CodeQL analysis', 'verify CodeQL findings'];
export const gateJobs = (text) => GATES.map((name) => ({ name, job: text.split(/\n  (?=[a-z-]+:\n)/).find((j) => j.includes(`name: ${name}\n`)) }));
