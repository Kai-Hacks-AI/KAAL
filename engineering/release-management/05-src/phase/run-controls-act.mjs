// The runner of the workflow controls-act (release/C122): asks one judge of the ACT about a pull request into a collector and says what the flag of that judge does with the answer.
// One line `act-evidence {...}` follows the report of a judge (release/C127): the record of this run for the ledger of that judge. Environment: KAAL_PR, KAAL_MERGE_SHA, KAAL_RUN_ID.
//   node run-controls-act.mjs <hold|demand|verify|limit|isolate> --main <default branch folder> --pr <merge result folder> --before <collector before folder> --contained <main as the result contains it folder> [--evidence <the file Testing's observe wrote>]
// The last two feed isolate Changes (release/C123): the judges judge the pull request's own paths, and without them the answer is UNKNOWN.
// The flag is the variable KAAL_RELEASE_<CONTROL> handed in as KAAL_FLAG. It decides the exit code and nothing else: exactly `on` makes a FAIL or an UNKNOWN exit 1 (advisory:
// a red check that no ruleset requires); anything else exits 0 with the same verdict written (detective). Printing and writing the summary are the same in both states.
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readTree, readEvidenceFile } from './lib/tree-facts.mjs';
import { applicableCases } from './lib/collector.mjs';
import { isolateChanges } from './lib/isolate-changes.mjs';
import { pass, unknown } from './lib/result.mjs';
import { recordOf, evidenceLine } from './lib/evidence.mjs';
import { judgeLimitAct } from './judge-limit-act.mjs';
import { judgeHoldWithEvidence } from './judge-act.mjs';
import { judgeDemandAct } from './judge-demand-act.mjs';
import { judgeVerifyAct } from './judge-verify-act.mjs';

export const JUDGES = ['hold', 'demand', 'verify', 'limit'];
export const NO_OBSERVATION = "Testing's observation of the Cases at this revision is not available";

// The answer of one judge over the facts of a tree (see readTree). Pure over the facts, except that the Cases that apply are read from the collector folder.
// `attribution` is the answer of isolate Changes: a judge judges the paths it calls `own`, and a pull request whose origin it cannot tell is UNKNOWN, never a free PASS;
// a FAIL on an own path stays a FAIL. Without an `attribution` the paths in the tree are taken as given.
export function judgeOf(name, tree, collector, attribution, evidence) {
  if (!JUDGES.includes(name)) return unknown(`${name} is not a judge of the ACT`);
  const limit = judgeLimitAct({ changed: tree.changed, map: tree.map, roots: tree.roots });
  if (attribution && !attribution.complete && limit.verdict !== 'FAIL') return unknown(`cannot tell what the pull request changed itself: no attribution without ${attribution.missing.join(', ')}`);
  if (name === 'limit') return limit;
  if (limit.verdict === 'UNKNOWN') return unknown(`cannot tell whether this is an ACT: ${limit.message}`);
  if (limit.verdict === 'PASS' && limit.applies === false) return pass('not an ACT: it changes no folder the route act writes', { applies: false });
  const ids = tree.carried.map((c) => c.id);
  if (!tree.carried.length || ids.some((id) => !id)) return unknown('the carried Changes could not be read');
  if (name === 'hold') return judgeHoldWithEvidence({ changes: tree.carried.map((c) => ({ id: c.id, applicable: applicableCases(join(collector, c.root), c.dir) })), retros: tree.demandRetros, evidence });
  if (name === 'verify') return judgeVerifyAct({ carried: ids, retros: tree.retros, refused: tree.refused });
  const open = ids.some((id) => !tree.demandRetros.some((r) => r.reflects.includes(id)));
  return judgeDemandAct({ changes: tree.carried.map((c) => ({ id: c.id, applicable: open ? applicableCases(join(collector, c.root), c.dir) : [] })), retros: tree.demandRetros, observed: undefined });
}

// The exit code: the verdict decides it only when the flag is exactly `on`.
export const exitCodeOf = (answer, flag) => (flag === 'on' && answer.verdict !== 'PASS' ? 1 : 0);

// The report of isolate Changes itself (release/CTL33): PASS when it could attribute every changed path, UNKNOWN when a folder was missing. It names the own paths, which are the ones the judges judge.
export const isolationOf = (a) => (a.complete
  ? pass(`${a.own.length} own, ${a.inherited.length} inherited${a.own.length ? `; own: ${a.own.join(', ')}` : ''}`, { applies: true })
  : unknown(`no attribution without ${a.missing.join(', ')}`));

export const reportOf = (name, answer, flag) => {
  const live = flag === 'on';
  const note = answer.verdict === 'PASS' ? '' : live ? ' (advisory, not required: no ruleset makes this check required)' : ' (reported only: the flag is not on, the check passes)';
  return `${answer.verdict}: ${name} ${name === 'isolate' ? 'Changes' : 'Act'}: ${answer.message}${note}`;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  const name = process.argv[2];
  const flag = process.env.KAAL_FLAG;
  let answer, attribution;
  try {
    const main = arg('--main'), collector = arg('--pr');
    if (!main || !collector) throw new Error('--main and --pr are required');
    attribution = isolateChanges({ before: arg('--before'), after: collector, contained: arg('--contained') });
    answer = name === 'isolate' ? isolationOf(attribution) : judgeOf(name, await readTree({ main, collector, changed: attribution.own }), collector, attribution, readEvidenceFile(arg('--evidence')));
  } catch (e) { answer = unknown(String(e.message)); }
  const line = reportOf(name, answer, flag);
  console.log(line);
  // One record per judge per run (release/C127): the pull request, the merge result and the run come from the workflow; a missing one is null and the run is not counted.
  const record = JUDGES.includes(name) ? evidenceLine(recordOf({ judge: name, check: `${name} Act`, pr: Number(process.env.KAAL_PR) || null, merge: process.env.KAAL_MERGE_SHA || null, run: process.env.KAAL_RUN_ID || null, answer, attribution })) : '';
  if (record) console.log(record);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n${record ? `${record}\n` : ''}`);
  process.exit(exitCodeOf(answer, flag));
}
