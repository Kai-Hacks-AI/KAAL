// The evidence of the ACT judges (release/C127): one record per judge per run, and one summary per judge computed from the records. Pure over data: it reads no file, no
// process and no history, and it flips no flag. Quantity triggers a review, quality decides readiness, the Owner authorizes advisory; this module keeps the three apart.
//
// A record (kind "run") is one line of a ledger (`04-controls/CTL<n>-<name>/evidence.jsonl`):
//   { kind: 'run', judge, check, pr, merge, run, verdict, applies, attribution: 'complete' | 'missing',
//     expected?, facts?, provoked?, handled? }
//   `expected` and `facts` are written by the person who checked the run against the pull request: the verdict the facts call for and where those facts can be read, so that
//   expected and observed can be compared by anyone later. `provoked` marks a deliberately provoked violation. `handled` is { by, open } for a verdict other than PASS.
// A review (kind "review") is one line of the same ledger: { kind: 'review', judge, outcome: 'READY' | 'NOT READY' | 'MORE EVIDENCE NEEDED', reasons, nextTrigger?, reviewer }.

export const TRIGGER = 10;
export const OUTCOMES = ['READY', 'NOT READY', 'MORE EVIDENCE NEEDED'];

// The record a run leaves for one judge. `answer` is the judge's answer, `attribution` the answer of isolate Changes (complete or not).
export const recordOf = ({ judge, check, pr, merge, run, answer, attribution }) => ({
  kind: 'run', judge, check, pr: pr ?? null, merge: merge ?? null, run: run ?? null,
  verdict: answer.verdict, applies: answer.applies, attribution: attribution && attribution.complete ? 'complete' : 'missing',
});
export const evidenceLine = (record) => `act-evidence ${JSON.stringify(record)}`;

// One run counts toward the trigger when it judged a real ACT (applies true), saw the whole pull request (attribution complete) and names its pull request. A run that is not an
// ACT is recorded and counts toward nothing; a run without attribution is unobserved.
const counted = (r) => r.applies === true && r.attribution === 'complete' && r.pr !== null && r.pr !== undefined;

// The latest record of each pull request stands: a re-run does not count twice. `records` are in the order they were recorded.
const latestPerPr = (runs) => {
  const byPr = new Map(); const loose = [];
  for (const r of runs) { if (r.pr === null || r.pr === undefined) loose.push(r); else byPr.set(r.pr, r); }
  return [...byPr.values(), ...loose];
};

// The summary of one judge over a ledger (records and reviews, in the order recorded). Facts only: the verdict of the review is a reviewer's, recorded as a review entry.
export function summarizeEvidence(ledger, judge) {
  const mine = ledger.filter((e) => e.judge === judge);
  const runs = latestPerPr(mine.filter((e) => e.kind === 'run'));
  const reviews = mine.filter((e) => e.kind === 'review');
  const real = runs.filter(counted);
  const nonPass = real.filter((r) => r.verdict !== 'PASS');
  const exercised = { PASS: real.some((r) => r.verdict === 'PASS'), FAIL: real.some((r) => r.verdict === 'FAIL'), UNKNOWN: real.some((r) => r.verdict === 'UNKNOWN'), provoked: real.some((r) => r.provoked === true) };
  const last = reviews[reviews.length - 1];
  return {
    judge,
    recorded: runs.length,
    counted: real.length,
    notAnAct: runs.filter((r) => r.applies === false).length,
    unobserved: runs.filter((r) => r.attribution !== 'complete').length,
    trigger: { needed: TRIGGER, reached: real.length >= TRIGGER },
    exercised,
    unresolved: nonPass.filter((r) => !r.handled || r.handled.open !== false).map((r) => ({ pr: r.pr, run: r.run, verdict: r.verdict })),
    mismatches: real.filter((r) => r.expected !== undefined && r.expected !== r.verdict).map((r) => ({ pr: r.pr, run: r.run, expected: r.expected, observed: r.verdict })),
    unchecked: real.filter((r) => r.expected === undefined).length,
    review: last ? { outcome: OUTCOMES.includes(last.outcome) ? last.outcome : 'no review', reasons: last.reasons, nextTrigger: last.nextTrigger, reviewer: last.reviewer } : { outcome: 'no review' },
  };
}

// The report of one summary, a few lines of plain words. It never says a judge is ready: only a review entry says so.
export const reportOfSummary = (s) => [
  `${s.judge}: ${s.counted} counted runs of ${s.recorded} recorded (${s.notAnAct} not an ACT, ${s.unobserved} unobserved): trigger ${s.trigger.reached ? 'reached' : 'not reached'} (${s.trigger.needed} needed)`,
  `${s.judge}: exercised PASS ${s.exercised.PASS}, FAIL ${s.exercised.FAIL}, UNKNOWN ${s.exercised.UNKNOWN}, provoked violation ${s.exercised.provoked}; ${s.unresolved.length} unresolved, ${s.mismatches.length} expected-versus-observed mismatches, ${s.unchecked} counted runs not yet checked against the facts`,
  `${s.judge}: review ${s.review.outcome}${s.review.nextTrigger ? `; next trigger ${s.review.nextTrigger}` : ''}`,
].join('\n');
