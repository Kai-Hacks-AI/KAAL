// Shared fixtures for the Pull Promotion v1 Cases. Not a Case. The Script under test is
// packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs, exporting walkCollectors(facts, declaration).
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repo = fileURLToPath(new URL('../../../../', import.meta.url));
export const scriptPath = join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs');
export const snapshotPath = join(repo, 'packages/kaal-release/test/pull/evidence/wire-fallback-template-2026-11-12.json');

export async function walkCollectors(facts, declaration) {
  const module = await import(pathToFileURL(scriptPath).href);
  if (typeof module.walkCollectors !== 'function') throw new Error('the Script does not export walkCollectors');
  return module.walkCollectors(facts, declaration);
}

// The declaration is the consumer's. v1 reads three things from it: the collectors in their promotion order, the
// piece types of the lifecycle, and the checks that are the Check phase.
export const declaration = (over = {}) => ({
  collectors: [{ name: 'col-a' }, { name: 'col-b' }, { name: 'col-c' }],
  lifecycle: ['PLAN', 'DO', 'ACT'],
  checks: ['build', 'suite'],
  ...over,
});

export const ok = (name) => ({ name, conclusion: 'success' });
export const bad = (name) => ({ name, conclusion: 'failure' });
export const running = (name) => ({ name, conclusion: 'pending' });
export const green = () => [ok('build'), ok('suite')];
export const collector = (name, checks = green()) => ({ name, at: `${name}-head`, checks });

// A piece landed into a collector. landedAt orders the pieces against deliveries.
export const landed = (ref, type, change, into, landedAt = '2026-11-12T08:00:00Z') => ({ ref, type, change, into, state: 'landed', landedAt });
export const open = (ref, type, change, into) => ({ ref, type, change, into, state: 'open' });

// One Change with its whole lifecycle landed in one collector.
export const lifecycle = (into, change = `c/${into}`, base = 10) =>
  ['PLAN', 'DO', 'ACT'].map((type, i) => landed(`#${base + i}-${into}`, type, change, into, `2026-11-12T0${i + 1}:00:00Z`));

export const delivery = (collectorName, landedAt) => ({ collector: collectorName, delivered: `${collectorName}-head`, landedAt });

export const facts = (over = {}) => ({
  collectors: [collector('col-a'), collector('col-b'), collector('col-c')],
  pieces: [...lifecycle('col-a'), ...lifecycle('col-b', undefined, 20), ...lifecycle('col-c', undefined, 30)],
  deliveries: [],
  ...over,
});

export const statusOf = (result, name) => result.collectors.find((c) => c.name === name);
