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

export const declaration = (over = {}) => ({
  target: 'main',
  kinds: { promotion: ['PROMOTION'], sync: ['SYNC'], change: ['PLAN', 'DO', 'ACT'] },
  policy: { promotionsInFlight: 1 },
  candidates: ['col-a'],
  holds: [],
  roles: { author: 'author', reviewer: 'reviewer', owner: 'owner' },
  ...over,
});

export const facts = (over = {}) => ({
  target: { head: 't1' },
  collectors: [{ name: 'col-a', head: 'a1', behindTarget: 0 }],
  requests: [],
  ...over,
});

// An open change request into a collector, approved at its current head, CI green, auto-merge on: nothing to do but wait.
export const request = (number, over = {}) => ({
  number,
  title: 'DO: Work item',
  base: 'col-a',
  head: `work-${number}`,
  headSha: `h${number}`,
  state: 'open',
  ci: 'success',
  behind: false,
  unresolvedThreads: 0,
  review: { state: 'APPROVED', at: `h${number}` },
  autoMerge: true,
  ...over,
});

export const forTarget = (result, target) => result.actions.filter((a) => a.target === target);
