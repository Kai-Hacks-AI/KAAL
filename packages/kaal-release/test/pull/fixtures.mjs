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

export const file = (path, status = 'modified') => ({ path, status });
export const retro = (headings = HEADINGS) => `# Change\n\n## ACT: retrospective (4L)\n\n${headings.map((h) => `### ${h}\n\n- something\n`).join('\n')}`;
export const execution = (caseId, head, conclusion = 'success', at = '2026-11-12T06:00:00Z') => ({ case: caseId, head, conclusion, at });

// A collector whose history is four commits (PLAN files, the DO, the Cases, the 4L ACT), the last being its head. Its delta holds
// PLAN, DO, two changed Cases and one ACT; its tree also holds one unchanged Case (T0). Every Case is green at the head.
export function good(name, over = {}) {
  const head = `${name}-head`;
  const history = [
    { id: `${name}-1`, paths: ['plan/x/requirements.md', 'plan/x/testing.md'] },
    { id: `${name}-2`, paths: ['src/script.mjs'] },
    { id: `${name}-3`, paths: ['test/T1.test.mjs', 'test/T2.test.mjs'] },
    { id: head, paths: ['plan/x/00-changes.md'] },
  ];
  const delta = [...new Set(history.flatMap((c) => c.paths))].map((p) => file(p, 'added'));
  return {
    name, at: head, history, delta,
    tree: ['README.md', 'test/T0.test.mjs', ...delta.map((f) => f.path)],
    texts: { 'plan/x/00-changes.md': retro() },
    executions: [execution('T0', head), execution('T1', head), execution('T2', head)],
    ...over,
  };
}

export const facts = (over = {}) => ({ collectors: [good('col-a'), good('col-b'), good('col-c')], ...over });
export const statusOf = (result, name) => result.collectors.find((c) => c.name === name);
// The collector without some files: gone from the delta and from the tree.
export const drop = (collector, ...paths) => ({ delta: collector.delta.filter((f) => !paths.includes(f.path)), tree: collector.tree.filter((p) => !paths.includes(p)) });
// A collector whose PLAN and DO already sit in the tree without differing from main (they landed earlier or arrived by a sync):
// its history and delta hold only a changed Case and the 4L ACT, its tree holds everything.
export function carried(name, over = {}) {
  const head = `${name}-head`;
  const history = [
    { id: `${name}-1`, paths: ['test/T1.test.mjs'] },
    { id: head, paths: ['plan/x/00-changes.md'] },
  ];
  const delta = [file('test/T1.test.mjs', 'added'), file('plan/x/00-changes.md', 'added')];
  return {
    name, at: head, history, delta,
    tree: ['README.md', 'plan/x/requirements.md', 'plan/x/testing.md', 'src/script.mjs', 'test/T0.test.mjs', 'test/T1.test.mjs', 'plan/x/00-changes.md'],
    texts: { 'plan/x/00-changes.md': retro() },
    executions: [execution('T0', head), execution('T1', head)],
    ...over,
  };
}
