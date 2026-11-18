// Fixtures of release/C62. Not a Case.
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const finderPath = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
export const releaseDir = join(repo, 'engineering/release-management');
export const loadFinder = () => import(pathToFileURL(finderPath).href);
export const control = (over = {}) => {
  const f = { id: 'demo/CTL1', title: 'check Demo', description: 'It reveals a demo.', type: 'detective', status: 'implemented', has: '[demo/I1]', ...over };
  return { path: 'demo/CTL1.md', text: `---\n${Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n# ${f.id}\n` };
};
