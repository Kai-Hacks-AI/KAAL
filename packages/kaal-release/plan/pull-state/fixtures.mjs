// Shared fixtures for the Pull Promotion file-state Cases. Not a Case. The Script under test is
// packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs, exporting walkCollectors(facts, declaration).
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repo = fileURLToPath(new URL('../../../../', import.meta.url));
export const scriptPath = join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs');

export async function walkCollectors(facts, declaration) {
  const module = await import(pathToFileURL(scriptPath).href);
  if (typeof module.walkCollectors !== 'function') throw new Error('the Script does not export walkCollectors');
  return module.walkCollectors(facts, declaration);
}

// The declaration is the consumer's. The patterns are regular expressions on paths; the Script names no folder.
export const HEADINGS = ['Liked', 'Learned', 'Lacked', 'Longed For'];
export const evidence = (over = {}) => ({
  plan: ['^plan/.*(requirements|testing)\\.md$'],
  do: ['^src/'],
  cases: { files: '^test/(T\\d+)\\.test\\.mjs$' },
  act: { files: '^plan/.*00-changes\\.md$', headings: HEADINGS },
  ...over,
});
export const declaration = (over = {}) => ({
  collectors: [{ name: 'col-a' }, { name: 'col-b' }, { name: 'col-c' }],
  evidence: evidence(),
  ...over,
});

const t = (n) => `2026-11-12T0${n}:00:00Z`;
export const file = (path, changedAt, status = 'modified') => ({ path, status, changedAt });
export const retro = (headings = HEADINGS) => `# Change\n\n## ACT: retrospective (4L)\n\n${headings.map((h) => `### ${h}\n\n- something\n`).join('\n')}`;
export const execution = (caseId, head, conclusion = 'success', at = t(6)) => ({ case: caseId, head, conclusion, at });

// A collector whose delta holds PLAN, DO, two expected Cases and one 4L ACT changed last, with both Cases green at its head.
export function good(name, over = {}) {
  const head = `${name}-head`;
  return {
    name, at: head,
    delta: [
      file('plan/x/requirements.md', t(1), 'added'), file('plan/x/testing.md', t(1), 'added'),
      file('src/script.mjs', t(2), 'added'), file('test/T1.test.mjs', t(3), 'added'), file('test/T2.test.mjs', t(3), 'added'),
      file('plan/x/00-changes.md', t(4), 'added'),
    ],
    texts: { 'plan/x/00-changes.md': retro() },
    executions: [execution('T1', head), execution('T2', head)],
    ...over,
  };
}

export const facts = (over = {}) => ({ collectors: [good('col-a'), good('col-b'), good('col-c')], ...over });
export const statusOf = (result, name) => result.collectors.find((c) => c.name === name);
export const without = (collectorFile, ...paths) => collectorFile.delta.filter((f) => !paths.includes(f.path));
export const t0 = t;
