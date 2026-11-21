// The final step of a collector, decided from its tree (release/C116). Pure over the tree facts of tree.mjs and the text of the PROMOTION template: no network, no branch code.
// The ACT is final when demand, verify and limit Act each answer PASS and apply (lib/result.mjs judgedAndFine); anything else is a skip that names the judge.
// hold Act is not asked: it needs Testing's observation of the Cases, which has no adapter yet. The Engineering check, required on the pull request, holds what it guards.
import { judgeDemandAct } from '../phase/judge-demand-act.mjs';
import { judgeVerifyAct } from '../phase/judge-verify-act.mjs';
import { judgeLimitAct } from '../phase/judge-limit-act.mjs';
import { unknown, judgedAndFine } from '../phase/lib/result.mjs';

const COLLECTOR = /^kaal\/([a-z0-9-]+)\/([a-z0-9-]+)$/;
export const titleOf = (base) => { const m = COLLECTOR.exec(String(base)); return m ? `PROMOTION: ${m[1]} ${m[2]}` : null; };

const ask = (judge, facts) => { try { return judge(facts); } catch (e) { return unknown(String(e.message)); } };
export function judgeTree(tree) {
  const ids = tree.carried.map((c) => c.id);
  return {
    demand: ask(judgeDemandAct, { changes: tree.carried.map((c) => ({ id: c.id, applicable: [] })), retros: tree.demandRetros }),
    verify: ask(judgeVerifyAct, { carried: ids, retros: tree.retros, refused: tree.refused }),
    limit: ask(judgeLimitAct, { changed: tree.changed, map: tree.map, roots: tree.roots }),
  };
}

// The chapters of HOW TO WORK, read from the source template: the table of its rows. Nothing else of the template is copied.
export function tableOf(template) {
  const rest = String(template).split(/^## HOW TO WORK[ \t]*$/m)[1] ?? '';
  const rows = rest.split('\n').filter((l) => /^\|.*\|$/.test(l.trim())).map((l) => l.trim());
  if (rows.length < 3) throw new Error('the template has no HOW TO WORK table');
  return rows;
}

export const WHY_NOW = 'To be written by Promoting: why deliver to main now rather than later. The Dispatcher raised this draft when the ACT of the collector merged; it does not judge the timing.';

export function bodyOf({ tree, base, number, template }) {
  const lines = tree.carried.map((c) => `${c.id} ${c.name}: ${[c.plan && 'PLAN', c.done && 'DO', tree.retros.some((r) => r.reflects.includes(c.id)) && 'ACT'].filter(Boolean).join(', ')}`);
  const [head, rule, ...rows] = tableOf(template);
  const first = rows[0].split('|');
  first[first.length - 2] = ` source ${base}, ACT #${number} `;
  const table = [head, rule, first.join('|'), ...rows.slice(1)].join('\n');
  return `## Change\n\n${lines.join('\n')}\n\n## Why now\n\n${WHY_NOW}\n\n## HOW TO WORK\n\n${table}\n`;
}

export function decideFromTree({ merged, base, mergeSha, number, tree, template }) {
  const skip = (reason, detail = '') => ({ action: 'skip', reason, detail });
  if (merged !== true) return skip('not-merged');
  const title = titleOf(base);
  if (!title) return skip('not-an-integration-branch', String(base));
  if (!/^[0-9a-f]{40}$/.test(String(mergeSha))) return skip('no-revision');
  if (!tree) return skip('tree-unreadable');
  const answers = judgeTree(tree);
  for (const [name, r] of Object.entries(answers)) {
    if (!judgedAndFine(r)) return skip('not-a-final-step', `${name} Act: ${r.verdict}${r.verdict === 'PASS' ? ' (not applicable)' : ''}: ${r.message}`);
  }
  let body;
  try { body = bodyOf({ tree, base, number: Number.isInteger(number) && number > 0 ? number : 0, template }); } catch (e) { return skip('no-template', String(e.message)); }
  return { action: 'raise', head: base, base: 'main', revision: mergeSha, class: 'KAAL', step: 'ACT', title, body };
}
