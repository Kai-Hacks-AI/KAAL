// The runner of the workflow act-judges (release/C122): asks one judge of the ACT about a pull request into a collector and says what the flag of that judge does with the answer.
//   node run-act-judges.mjs <hold|demand|verify|limit> --main <default branch folder> --pr <merge result folder>
// The flag is the variable KAAL_RELEASE_<CONTROL> handed in as KAAL_FLAG. It decides the exit code and nothing else: exactly `on` makes a FAIL or an UNKNOWN exit 1 (advisory:
// a red check that no ruleset requires); anything else exits 0 with the same verdict written (detective). Printing and writing the summary are the same in both states.
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readTree } from './lib/tree-facts.mjs';
import { applicableCases } from './lib/collector.mjs';
import { pass, unknown } from './lib/result.mjs';
import { judgeLimitAct } from './judge-limit-act.mjs';
import { judgeDemandAct } from './judge-demand-act.mjs';
import { judgeVerifyAct } from './judge-verify-act.mjs';

// The paths a revision changed against its first parent, both ends of a rename. A squash commit has one parent and the merge result of a pull request has two;
// with any other number of parents the base is not known and nothing is read.
export function changedPaths(tree, git = (...args) => execFileSync('git', ['-C', tree, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }), parents = [1, 2]) {
  const n = git('rev-list', '--parents', '-n', '1', 'HEAD').trim().split(' ').length - 1;
  if (!parents.includes(n)) throw new Error(`the revision has ${n} parents, not ${parents.join(' or ')}`);
  return git('diff', '--name-only', '--no-renames', 'HEAD^1', 'HEAD').split('\n').filter(Boolean);
}

export const JUDGES = ['hold', 'demand', 'verify', 'limit'];
export const NO_OBSERVATION = "Testing's observation of the Cases at this revision is not available";

// The answer of one judge over the facts of a tree (see readTree). Pure over the facts, except that the Cases that apply are read from the collector folder.
export function judgeOf(name, tree, collector) {
  if (!JUDGES.includes(name)) return unknown(`${name} is not a judge of the ACT`);
  const limit = judgeLimitAct({ changed: tree.changed, map: tree.map, roots: tree.roots });
  if (name === 'limit') return limit;
  if (limit.verdict === 'UNKNOWN') return unknown(`cannot tell whether this is an ACT: ${limit.message}`);
  if (limit.verdict === 'PASS' && limit.applies === false) return pass('not an ACT: it changes no folder the route act writes', { applies: false });
  if (name === 'hold') return unknown(NO_OBSERVATION);
  const ids = tree.carried.map((c) => c.id);
  if (!tree.carried.length || ids.some((id) => !id)) return unknown('the carried Changes could not be read');
  if (name === 'verify') return judgeVerifyAct({ carried: ids, retros: tree.retros, refused: tree.refused });
  const open = ids.some((id) => !tree.demandRetros.some((r) => r.reflects.includes(id)));
  return judgeDemandAct({ changes: tree.carried.map((c) => ({ id: c.id, applicable: open ? applicableCases(join(collector, c.root), c.dir) : [] })), retros: tree.demandRetros, observed: undefined });
}

// The exit code: the verdict decides it only when the flag is exactly `on`.
export const exitCodeOf = (answer, flag) => (flag === 'on' && answer.verdict !== 'PASS' ? 1 : 0);

export const reportOf = (name, answer, flag) => {
  const live = flag === 'on';
  const note = answer.verdict === 'PASS' ? '' : live ? ' (advisory, not required: no ruleset makes this check required)' : ' (reported only: the flag is not on, the check passes)';
  return `${answer.verdict}: ${name} Act: ${answer.message}${note}`;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  const name = process.argv[2];
  const flag = process.env.KAAL_FLAG;
  let answer;
  try {
    const main = arg('--main'), collector = arg('--pr');
    if (!main || !collector) throw new Error('--main and --pr are required');
    answer = judgeOf(name, await readTree({ main, collector, changed: changedPaths(collector) }), collector);
  } catch (e) { answer = unknown(String(e.message)); }
  const line = reportOf(name, answer, flag);
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n`);
  process.exit(exitCodeOf(answer, flag));
}
