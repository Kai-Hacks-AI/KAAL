// Shared fixtures for the coordination Cases. Not a Case. The Script under test is
// packages/kaal-release/skills/kaal-release/scripts/coordinate.mjs, exporting coordinate(facts, declaration) -> { actions, notJudged }.
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const scriptPath = join(repo, 'packages/kaal-release/skills/kaal-release/scripts/coordinate.mjs');

export async function coordinate(facts, declaration) {
  const module = await import(pathToFileURL(scriptPath).href);
  return module.coordinate(facts, declaration);
}

// The declaration is the consumer's: the target, the types of its templates, the policy, the ordered promotion pairs, the holds.
export const declaration = (over = {}) => ({
  target: 'main',
  types: { promotion: 'PROMOTION', sync: 'SYNC', change: ['PLAN', 'DO', 'ACT'], hotfix: 'HOTFIX', fallback: 'DEFAULT' },
  policy: { promotionsInFlight: 1 },
  freshnessChecks: ['fresh'],
  promotions: [{ collector: 'col-a', change: 'c/C1' }],
  holds: [],
  roles: { author: 'author', reviewer: 'reviewer', owner: 'owner' },
  ...over,
});

export const collector = (name, behindTarget = 0) => ({ name, head: `${name}-head`, behindTarget });

export const facts = (over = {}) => ({
  target: { head: 't1' },
  collectors: [collector('col-a')],
  requests: [],
  ...over,
});

export const ok = (name) => ({ name, conclusion: 'success' });
export const bad = (name) => ({ name, conclusion: 'failure' });

// An open change request into a collector, approved at its current head, checks green, auto-merge on: nothing to do but wait.
// Without an explicit review it is approved at whatever head it ends up with.
export const request = (number, over = {}) => {
  const made = {
    number,
    type: 'DO',
    change: `c/C${number}`,
    base: 'col-a',
    head: `work-${number}`,
    headSha: `h${number}`,
    state: 'open',
    checks: [ok('build'), ok('fresh')],
    mergeable: 'clean',
    unresolvedThreads: 0,
    autoMerge: true,
    ...over,
  };
  if (!('review' in over)) made.review = { state: 'APPROVED', at: made.headSha };
  return made;
};

// The promotion member of a pair: base is the target, head is the collector, at the collector's head.
export const promotionOf = (number, collectorName, over = {}) =>
  request(number, { type: 'PROMOTION', change: 'c/C1', base: 'main', head: collectorName, headSha: `${collectorName}-head`, ...over });

// The sync member of a pair, or a development sync: base is the collector, the change is the one it serves.
export const syncInto = (number, base, change, over = {}) => request(number, { type: 'SYNC', change, base, review: null, autoMerge: false, ...over });

export const byTarget = (result, target) => result.actions.find((a) => a.target === target);
