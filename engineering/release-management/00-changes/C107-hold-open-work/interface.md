# C107 interface

Drafts of the files the DO adds, each equal to its file after the DO (the Cases compare them). The judge reads facts and no Git: how the facts are gathered is the next Change.

## Draft of I57.md

`````
---
id: release/I57
title: a promotion leaves no open work behind
---
# release/I57 a promotion leaves no open work behind

Contract: a branch is promoted into `main` only when no open pull request is still based on it. Work that is based on a promoted collector is work in flight that the collector's own stations have not seen land: once the collector is deleted, GitHub silently retargets such a pull request to `main`, and it can reach `main` without the checks and the review of the collector it was written for. Reason: a promotion that strands work moves it past its stations without anyone choosing to. Owner: release management. What is not claimed: a pull request opened after the judgement and before the merge, and branches that merely descend from the collector without a pull request.
`````

## Draft of F83.md

`````
---
id: release/F83
title: hold-open-work
kind: functional
serves: [release/I57]
---
# release/F83 hold-open-work

The promotion of a branch is judged against the open pull requests of the repository: it says FAIL naming every open pull request, other than the promotion itself, whose base is the promoted branch; PASS when there is none; and UNKNOWN, which never passes, when the promoted branch, the promotion or the list cannot be told, when the list is not known to be complete, or when an item cannot be read. The judge is given the facts and reads nothing from Git or GitHub. The facts are gathered through Hosting by the job that runs it, in the next Change.
`````

## Draft of A73.md

`````
---
id: release/A73
title: judge-open-work
addresses: [release/F83]
---
# release/A73 judge-open-work

The component is the judge `05-src/open-work/judge-open-work.mjs`: a pure function `judgeOpenWork({ head, self, complete, pulls })` and a command line over a facts file (`--head`, `--self`, `--facts`) that prints the verdict as JSON and exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN. It is judged and engineered like the other detections of the Promoting station: it is a prerequisite of the entry that station declares for release/CTL27, not an entry itself.

Its parent is release/A68, the ruleset of the Promoting station, once release/C105 has placed it; the DO of this Change adds `parent: release/A68` then. The gathering of the facts (the open pull requests, through Hosting), the job that runs the judge and the station's declaration are the next Change.
`````

## Draft of CTL27.md

`````
---
id: release/CTL27
title: hold Open work
description: It stops the promotion of a branch while open pull requests are still based on it.
type: preventive
status: designed
has: [release/I57]
evidence: [fixture:2, real:2, provoked:1:fail]
---
# release/CTL27 hold Open work

A preventive control. A branch is not promoted into `main` while open work is still based on it, so deleting the promoted collector cannot silently retarget that work to `main`. It has one Intent, release/I57, which holds the details with the Requirements and Architecture under it. Its detection is the judge of release/A73; the Promoting station requires that detection once the Owner has loaded the declaration, and release/CTL26 then observes that the requirement is in force.
`````

## Draft of judge-open-work.mjs

`````
// release/A73: is open work still based on the branch a promotion takes into main? Pure: the facts are given, nothing is read from Git or GitHub.
// judgeOpenWork({ head, self, complete, pulls }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', message[, based] }
// head: the branch the promotion promotes. self: the number of the promotion. pulls: the open pull requests, each { number, base }.
// complete: true only when the list is known to be the whole list. Anything else is UNKNOWN, which never passes.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const unknown = (message) => ({ verdict: 'UNKNOWN', message });

export function judgeOpenWork(facts) {
  const { head, self, complete, pulls } = facts && typeof facts === 'object' ? facts : {};
  if (typeof head !== 'string' || !head || head === 'main') return unknown('the promoted branch is not named, or is main');
  if (!Number.isInteger(self)) return unknown('the promotion is not named');
  if (complete !== true) return unknown('the open pull requests are not known to be the whole list');
  if (!Array.isArray(pulls) || !pulls.every((p) => p && Number.isInteger(p.number) && typeof p.base === 'string' && p.base)) return unknown('the open pull requests could not be read');
  const based = pulls.filter((p) => p.base === head && p.number !== self).map((p) => p.number).sort((a, b) => a - b);
  if (based.length) return { verdict: 'FAIL', message: `open work is still based on ${head}: ${based.map((n) => `#${n}`).join(', ')}`, based };
  return { verdict: 'PASS', message: `no open work is based on ${head}`, based };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const opt = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };
  let out;
  try {
    const self = /^[0-9]+$/.test(opt('--self') ?? '') ? Number(opt('--self')) : undefined;
    const given = JSON.parse(readFileSync(opt('--facts'), 'utf8'));
    out = given && typeof given === 'object' && !Array.isArray(given) ? judgeOpenWork({ head: opt('--head'), self, complete: given.complete, pulls: given.pulls }) : unknown('the facts are not an object');
  } catch { out = unknown('the facts could not be read'); }
  process.stdout.write(`${JSON.stringify(out)}\n`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[out.verdict]);
}
`````

