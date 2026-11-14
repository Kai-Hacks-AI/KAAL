// Shared fixtures for the Show WIP Cases. Not a Case. The Script under test is
// packages/kaal-release/skills/kaal-release/scripts/show-wip.mjs, exporting showWip(facts, config) -> { stations, notObserved } and render(report) -> text.
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const scriptPath = join(repo, 'packages/kaal-release/skills/kaal-release/scripts/show-wip.mjs');
export const deliveryDir = join(repo, 'engineering/release-management/05-src/show-wip');

const load = (file) => import(pathToFileURL(file).href);
export const showWip = async (facts, config) => (await load(scriptPath)).showWip(facts, config);
export const render = async (report) => (await load(scriptPath)).render(report);
export const readOpenPulls = async (name, gh) => (await load(join(deliveryDir, 'read.mjs'))).readOpenPulls(name, gh);

export const config = (over = {}) => ({
  types: ['PLAN', 'DO', 'ACT', 'SYNC', 'PROMOTION', 'HOTFIX'],
  stations: [{ station: 'Integration', into: 'col/*' }, { station: 'Promotion', into: 'target' }],
  ...over,
});

// An open piece that is approved at its current version, with green checks, set to land by itself: nothing to do but wait.
export const piece = (number, over = {}) => ({
  ref: `#${number}`, title: `DO: change ${number}`, from: `work-${number}`, into: 'col/a',
  draft: false, review: 'approved', threads: 0, checks: 'success', fit: 'fits', landing: true, ...over,
});

export const byRef = (report, ref) => report.stations.flatMap((s) => s.pieces).find((p) => p.ref === ref);

// One open piece as the host's light query returns it, and the page around it.
export const node = (number, over = {}) => ({
  number, title: `DO: change ${number}`, isDraft: false, headRefName: `work-${number}`, headRefOid: `h${number}`, baseRefName: 'col/a',
  mergeStateStatus: 'CLEAN', autoMergeRequest: null,
  reviewThreads: { pageInfo: { hasNextPage: false }, nodes: [] },
  latestReviews: { pageInfo: { hasNextPage: false }, nodes: [{ state: 'APPROVED', commit: { oid: `h${number}` } }] },
  commits: { nodes: [{ commit: { oid: `h${number}`, statusCheckRollup: { state: 'SUCCESS', contexts: { pageInfo: { hasNextPage: false }, nodes: [{ __typename: 'CheckRun', name: 'build', conclusion: 'SUCCESS', status: 'COMPLETED', startedAt: '2026-11-12T10:00:00Z' }] } } } }] },
  ...over,
});
export const page = (nodes, endCursor = null) => ({ data: { repository: { pullRequests: { pageInfo: { hasNextPage: Boolean(endCursor), endCursor }, nodes } } } });
