// Shared fixtures for the coordination Cases. Not a Case. The Script under test is
// packages/kaal-release/skills/kaal-release/scripts/analyze-flow.mjs, exporting analyzeFlow(facts, declaration) -> { actions, notJudged }.
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const scriptPath = join(repo, 'packages/kaal-release/skills/kaal-release/scripts/analyze-flow.mjs');

export async function analyzeFlow(facts, declaration) {
  const module = await import(pathToFileURL(scriptPath).href);
  return module.analyzeFlow(facts, declaration);
}

// The declaration is the consumer's: the target, the types of its templates, the policy, the ordered promotion pairs, the holds.
export const declaration = (over = {}) => ({
  target: 'main',
  types: { promotion: 'PROMOTION', sync: 'SYNC', change: ['PLAN', 'DO', 'ACT'], hotfix: 'HOTFIX', fallback: 'DEFAULT' },
  policy: { wipLimit: { promotion: 1 } },
  freshnessChecks: ['fresh'],
  promotions: [{ collector: 'col-a', change: 'c/C1' }],
  holds: [],
  roles: { author: 'author', reviewer: 'reviewer', owner: 'owner', lander: 'lander' },
  ...over,
});

export const collector = (name, behindTarget = 0) => ({ name, at: `${name}-head`, behindTarget });

export const facts = (over = {}) => ({
  target: { from: 't1' },
  collectors: [collector('col-a')],
  pieces: [],
  deliveries: [],
  ...over,
});

// A delivery is the evidence of a landed PROMOTION: the collector version it carried when it landed, never a version of the target.
export const delivery = (collectorName, delivered, over = {}) => ({ collector: collectorName, delivered, ref: '#30', landedOn: 'target-after', ...over });

export const ok = (name) => ({ name, conclusion: 'success' });
export const bad = (name) => ({ name, conclusion: 'failure' });

// An open piece of work (one PLAN, DO, ACT, SYNC, PROMOTION or HOTFIX of a Change) going into a collector, approved at its current
// version, checks green, set to land on approval: nothing to do but wait. Without an explicit review it is approved at whatever version it ends up with.
export const piece = (number, over = {}) => {
  const made = {
    ref: `#${number}`,
    type: 'DO',
    change: `c/C${number}`,
    into: 'col-a',
    from: `work-${number}`,
    at: `h${number}`,
    state: 'open',
    checks: [ok('build'), ok('fresh')],
    fit: 'fits',
    openComments: 0,
    landsOnApproval: true,
    ...over,
  };
  if (!('review' in over)) made.review = { state: 'approved', at: made.at };
  return made;
};

// The promotion member of a pair: into the target, from the collector, at the collector's head.
export const promotionOf = (number, collectorName, over = {}) =>
  piece(number, { type: 'PROMOTION', change: 'c/C1', into: 'main', from: collectorName, at: `${collectorName}-head`, ...over });

// The sync member of a pair, or a development sync: into the collector, for the Change it serves.
export const syncInto = (number, into, change, over = {}) => piece(number, { type: 'SYNC', change, into, review: null, landsOnApproval: false, ...over });

// The supplier: the only part that reads the host. It lives in the consumer's Delivery, never in the shipped Skill.
export const gatherPath = join(repo, 'engineering/release-management/05-src/analyze-flow/gather.mjs');
export async function gather(gh, repoName, declaration) {
  const module = await import(pathToFileURL(gatherPath).href);
  return module.gather(gh, repoName, declaration);
}

export const byTarget = (result, target) => result.actions.find((a) => a.target === target);
