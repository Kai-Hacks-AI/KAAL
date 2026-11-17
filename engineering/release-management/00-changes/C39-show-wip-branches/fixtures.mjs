// Shared fixtures for the C39 Cases. Not a Case.
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const scriptPath = join(repo, 'packages/kaal-release/skills/kaal-release/scripts/show-wip.mjs');
export const readerPath = join(repo, 'engineering/release-management/05-src/show-wip/read.mjs');
export const load = (file) => import(pathToFileURL(file).href);

export const config = (over = {}) => ({
  types: ['PLAN', 'DO', 'ACT', 'SYNC', 'PROMOTION', 'HOTFIX'],
  stations: [{ station: 'Integration', into: 'kaal/*' }, { station: 'Promotion', into: 'main' }],
  default: 'main',
  places: [{ place: 'hotfix', branch: 'hotfix/*' }, { place: 'wire', branch: 'wire/*' }, { place: 'kaal', branch: 'kaal/*' }],
  development: 'development',
  ...over,
});

export const piece = (number, over = {}) => ({
  ref: `#${number}`, title: `DO: change ${number}`, from: 'kaal/release/a', into: 'main',
  draft: false, review: 'approved', threads: 0, checks: 'success', fit: 'fits', landing: true, ...over,
});

export const branches = (...names) => names.map((name) => ({ name }));
export const entryOf = (report, branch) => report.inventory.places.flatMap((p) => p.branches).find((b) => b.branch === branch);
export const placeOf = (report, place) => report.inventory.places.find((p) => p.place === place);
