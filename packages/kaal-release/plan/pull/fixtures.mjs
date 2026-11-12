// Shared fixtures for the Pull Promotion Cases. Not a Case. The Script under test is
// packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs, exporting
// pullPromotion(facts, declaration, flow, collector) -> the readiness of ONE collector.
// facts and flow are the data of analyze Flow (coordination/F2 and coordination/F4); this Script reads them and models no collector state of its own.
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repo = fileURLToPath(new URL('../../../../', import.meta.url));
export const scriptPath = join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs');
export const analyzePath = join(repo, 'packages/kaal-release/skills/kaal-release/scripts/analyze-flow.mjs');
export const snapshotPath = fileURLToPath(new URL('./evidence/wire-fallback-template-2026-11-12.json', import.meta.url));

export async function pullPromotion(facts, declaration, flow, collector = 'col-a') {
  const module = await import(pathToFileURL(scriptPath).href);
  return module.pullPromotion(facts, declaration, flow, collector);
}

// The declaration is the consumer's. It extends analyze Flow's declaration (coordination/F3) with one section, readiness.
export const declaration = (over = {}, readiness = {}) => ({
  target: 'main',
  types: { promotion: 'PROMOTION', sync: 'SYNC', change: ['PLAN', 'DO', 'ACT'], hotfix: 'HOTFIX', fallback: 'DEFAULT' },
  policy: { wipLimit: { promotion: 1 } },
  freshnessChecks: ['fresh'],
  promotions: [{ collector: 'col-a', change: 'c/C1' }],
  holds: [],
  roles: { author: 'author', reviewer: 'reviewer', owner: 'owner', lander: 'lander' },
  readiness: {
    // the judgments and who owns them, in the consumer's words
    owners: { lifecycle: 'Change', verification: 'Testing', protection: 'Guard', sequencing: 'Release', validation: 'Review', attribution: 'Adapter' },
    // the piece types a Change must have landed IN THE COLLECTOR before it can be promoted (for KAAL: PLAN, DO, ACT; the Check is the checks)
    lifecycle: ['PLAN', 'DO', 'ACT'],
    // explicit dependencies between Changes: { change, on: [{ change, collector }] }; a dependency must be delivered first
    dependencies: [],
    // Changes that predate the rule that a Change lives in one collector: { change, reason }
    legacy: [],
    // which judgment a check belongs to; a check named nowhere is not judged
    checkOwners: { build: 'verification', suite: 'verification', guard: 'protection', fresh: 'sequencing' },
    ...readiness,
  },
  ...over,
});

export const collector = (name, over = {}) => ({ name, at: `${name}-head`, behindTarget: 0, ...over });
export const ok = (name) => ({ name, conclusion: 'success' });
export const bad = (name) => ({ name, conclusion: 'failure' });
export const running = (name) => ({ name, conclusion: 'pending' });
export const allGreen = () => [ok('build'), ok('suite'), ok('guard'), ok('fresh')];

// One Change, one collector: its whole lifecycle (PLAN, DO, ACT) landed in that collector, each approved at the version that landed.
export const lifecycle = (over = {}, base = 10, change = 'c/C1', into = 'col-a') =>
  ['PLAN', 'DO', 'ACT'].map((type, i) => landed(base + i, type, { change, into, ...(over[type] ?? {}) }));

export const facts = (over = {}) => ({
  target: { from: 't1' },
  collectors: [collector('col-a')],
  pieces: lifecycle(),
  deliveries: [],
  ...over,
});

// A piece that landed into a collector, approved at the version it landed at.
export const landed = (number, type = 'DO', over = {}) => ({
  ref: `#${number}`, type, change: 'c/C1', into: 'col-a', from: `work-${number}`, at: `h${number}`, state: 'landed',
  landedAt: `2026-11-12T0${number % 10}:00:00Z`, checks: [ok('build')], fit: 'fits', openComments: 0, landsOnApproval: true,
  review: { state: 'approved', at: `h${number}` }, ...over,
});

// The promotion piece of a collector: open, into the target, from the collector, at the collector's head, with the checks run on it.
export const promotion = (number, from = 'col-a', over = {}) => ({
  ref: `#${number}`, type: 'PROMOTION', change: 'c/C1', into: 'main', from, at: `${from}-head`, state: 'open',
  checks: allGreen(), fit: 'fits', openComments: 0, landsOnApproval: true, review: null, ...over,
});

// The output of analyze Flow that this Script reads: its actions, what it could not judge, and its lane (the active pair).
// lane.active is analyze Flow's coordination/F8 made explicit; see pull/F3.
export const flow = (over = {}) => ({ actions: [], notJudged: [], lane: { active: 'col-a' }, ...over });

export const judgment = (result, id) => result.judgments.find((j) => j.id === id);
export const statuses = (result) => Object.fromEntries(result.judgments.map((j) => [j.id, j.status]));

// A delivery is analyze Flow's evidence of a landed PROMOTION (coordination/F13). landedAt is the one optional addition of pull/F3.
export const delivery = (collectorName, delivered, over = {}) => ({ collector: collectorName, delivered, ref: '#30', landedOn: 'target-after', ...over });
