# C107 interface

Drafts of the files the DO adds, each equal to its file after the DO (the Cases compare them). The judge reads facts and no Git: how the facts are gathered is the next Change. Revised after the CPO's direction on this PLAN (check Queue, block Queue; one judgement at several places; the merge queue path).

## Draft of I57.md

`````
---
id: release/I57
title: a collector is promoted only when its queue is empty
---
# release/I57 a collector is promoted only when its queue is empty

Definition: the **queue** of a collector is the set of open pull requests whose base is that collector: work waiting to enter it. It is the collector's own queue and has nothing to do with GitHub's merge queue, which orders the merge of pull requests into `main` (`merge_group`).

Contract: a branch is promoted into `main` only when its queue is empty. Work that enters the collector is ordinary and valid and is never blocked by this: only the promotion is. Work still queued on a promoted collector has not landed in it; once the collector is deleted, GitHub silently retargets such a pull request to `main`, and it can reach `main` without the checks and the review of the collector it was written for. Reason: a promotion that strands work moves it past its stations without anyone choosing to. Owner: release management. Not claimed: a pull request that joins the queue after the judgement and before the merge (the judgement is repeated in the merge queue to keep that window as short as GitHub allows), and branches that merely descend from the collector without a pull request.
`````

## Draft of F83.md

`````
---
id: release/F83
title: check-queue
kind: functional
serves: [release/I57]
---
# release/F83 check-queue

The promotion of a branch is judged against the queue of that branch (release/I57): it says FAIL naming every open pull request, other than the promotion itself, whose base is the promoted branch; PASS when there is none; and UNKNOWN, which never passes, when the promoted branch, the promotion or the list cannot be told, when the list is not known to be complete, or when an item cannot be read. The judge is given the facts and reads nothing from Git or GitHub. It judges the promotion only and says nothing about a pull request that joins the queue. In the merge queue the promotion is named by the ref of its merge group. The same judgement serves every place that asks it: an advisory reminder, the required check of the pull request and the required check of the merge group. Whether it blocks is decided by the place, never by the judge; at an enforcement point UNKNOWN does not pass. The facts are gathered by the job that judges, in the same run, never taken from an earlier run; gathering them is the next Change.
`````

## Draft of A73.md

`````
---
id: release/A73
title: judge-queue
addresses: [release/F83]
---
# release/A73 judge-queue

The component is the judge `05-src/queue/judge-queue.mjs`: a pure function `judgeQueue({ head, self, complete, pulls })`, a function `pullOfGroupRef(ref)` that names the pull request of a merge group, and a command line over a facts file (`--head`, `--self` or `--group-ref`, `--facts`) that prints the verdict as JSON and exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN. One judgement, several placements: the places that ask it map the exit status to what they do (a reminder, a required check, a required check of the merge group), the judge never does.

Its parent is release/A68, the ruleset of the Promoting station, once release/C105 has placed it; the DO of this Change adds `parent: release/A68` then. The gathering of the facts through Hosting, the jobs (the pull request and the merge group, as the other gates of the Promoting station have them), the advisory hook and the station's declaration are the next Changes.
`````

## Draft of CTL27.md

`````
---
id: release/CTL27
title: check Queue
description: It reveals whether open pull requests are still based on a branch that is being promoted.
type: detective
status: designed
has: [release/I57]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL27 check Queue

A detective control. `check Queue` says FAIL, naming them, when open pull requests are still based on the branch a promotion takes into `main` (the queue of the collector, release/I57, not GitHub's merge queue), PASS when there are none and UNKNOWN, which never passes, when the facts cannot be read or are not known to be complete. PASS is not an approval and not a merge decision, and it says nothing about work that enters the collector. It has one Intent, release/I57, which holds the details with the Requirements and Architecture under it. It rolls out detective first, as every new control does: (1) its verdict is observed on real promotions without blocking; (2) it runs as an advisory CI check behind a feature flag, on the promotion and in the merge queue, and the evidence is collected; (3) only after validation and the Owner's explicit go is it required on the Promoting station, by the Owner's load, and the preventive control `block Queue` is then declared in the Change that makes it so. The judge only judges; once the check is required UNKNOWN does not pass.
`````

## Draft of judge-queue.mjs

`````
// release/A73: the queue of a collector. Is any open pull request still based on the branch a promotion takes into main? Pure: the facts are given, nothing is read from Git or GitHub.
// judgeQueue({ head, self, complete, pulls }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', message[, based] }
// head: the branch the promotion promotes. self: the number of the promotion. pulls: the open pull requests, each { number, base }.
// complete: true only when the list is known to be the whole list. Anything else is UNKNOWN, which never passes.
// pullOfGroupRef(ref): the number of the pull request a merge queue group is made for (gh-readonly-queue/<base>/pr-<n>-<sha>), or undefined.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const unknown = (message) => ({ verdict: 'UNKNOWN', message });

export function judgeQueue(facts) {
  const { head, self, complete, pulls } = facts && typeof facts === 'object' ? facts : {};
  if (typeof head !== 'string' || !head || head === 'main') return unknown('the promoted branch is not named, or is main');
  if (!Number.isInteger(self)) return unknown('the promotion is not named');
  if (complete !== true) return unknown('the open pull requests are not known to be the whole list');
  if (!Array.isArray(pulls) || !pulls.every((p) => p && Number.isInteger(p.number) && typeof p.base === 'string' && p.base)) return unknown('the open pull requests could not be read');
  const based = pulls.filter((p) => p.base === head && p.number !== self).map((p) => p.number).sort((a, b) => a - b);
  if (based.length) return { verdict: 'FAIL', message: `the queue of ${head} is not empty: ${based.map((n) => `#${n}`).join(', ')}`, based };
  return { verdict: 'PASS', message: `the queue of ${head} is empty`, based };
}

export function pullOfGroupRef(ref) {
  const m = typeof ref === 'string' ? /^(?:refs\/heads\/)?gh-readonly-queue\/.+\/pr-([1-9][0-9]*)-[0-9a-f]{40}$/.exec(ref) : null;
  return m ? Number(m[1]) : undefined;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const opt = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };
  let out;
  try {
    const number = opt('--self'), ref = opt('--group-ref');
    const self = number !== undefined && ref === undefined ? (/^[0-9]+$/.test(number) ? Number(number) : undefined) : number === undefined && ref !== undefined ? pullOfGroupRef(ref) : undefined;
    const given = JSON.parse(readFileSync(opt('--facts'), 'utf8'));
    out = given && typeof given === 'object' && !Array.isArray(given) ? judgeQueue({ head: opt('--head'), self, complete: given.complete, pulls: given.pulls }) : unknown('the facts are not an object');
  } catch { out = unknown('the facts could not be read'); }
  process.stdout.write(`${JSON.stringify(out)}\n`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[out.verdict]);
}
`````

