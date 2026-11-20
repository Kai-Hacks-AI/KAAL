# C103 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of I56.md

`````
---
id: release/I56
title: an ACT enters a collector only when the Cases its approved PLAN leaves in force are really green
---
# release/I56 an ACT enters a collector only when the Cases its approved PLAN leaves in force are really green

Contract: the work of a collector is done when the Cases its merged PLAN added are really green, and only then may its ACT enter. One Change in a collector has any number of PLAN pull requests, any number of DO pull requests and exactly one ACT. The approved PLAN is the cumulative result of its merged PLAN pull requests: a PLAN amendment is a new PLAN, reviewed and approved, that adds, changes or retires a Case. Real green means the PLAN added the Cases RED and the DO turned exactly those GREEN: the same Cases, unchanged by the DO, with the inverse expectation. A DO changes what the PLAN left in force only by returning to PLAN. Reason: the PLAN states what will be true, the DO makes it true, and the ACT reviews work that is finished; an ACT on unfinished work reviews nothing. Owner: release management, which owns the stages until stages or stations have their own home. Threads own PDCA and raise their own ACT; the Dispatcher raises a PROMOTION only after an ACT has merged.
`````

## Draft of F80.md

`````
---
id: release/F80
title: verify-act
kind: functional
serves: [release/I56]
---
# release/F80 verify-act

A check on an ACT pull request into a collector says PASS only when every Case that the approved PLAN of the Change leaves in force is really green at the head: its file `T<n>.test.mjs` exists, its content equals the one the approved PLAN left in force, and the observation of Testing at the head is GREEN. It says FAIL, with the message `finish your work first` and the Cases named, when a planned Case is absent, still a `.red.mjs`, changed without an approved PLAN amendment or observed RED. It says UNKNOWN, which never passes, when a Case was not observed green or no approved PLAN leaves a Case in force. The approved PLAN is the cumulative result, in order, of the merged PLAN pull requests of the Change: a PLAN adds, changes or retires a Case, and a DO never does. The Cases in force and the rules are read from the base, never from the candidate. An exit code is never a verdict: the check reads observations. It does not approve and does not merge.
`````

## Draft of A71.md

`````
---
id: release/A71
title: verify-act-from-the-plan-revision
addresses: [release/F80]
---
# release/A71 verify-act-from-the-plan-revision

The source `05-src/phase/judge-act.mjs` has three parts. `plannedCases(root, base, changeDir)` folds, in order, the PLAN pull requests of the Change, the first-parent commits of the base that touch the Change folder and whose subject starts with PLAN. A PLAN adds a Case (a Case file in the Change folder), changes one (a Case file of a Case already in force, wherever the DO moved it) or retires one (it deletes the Case and no other file of that id remains). It returns the Cases left in force with the content fingerprint each PLAN gave them. A DO commit never changes what is in force, and nothing of the candidate is read. `headCases(root, head)` lists the `T<n>` Case files of the head as Git data, wherever the DO moved them, with their fingerprints. `judgeAct({ planned, head, observed })` is a pure function of those and of the observations `{ T<n>: GREEN | RED | UNKNOWN }` of Testing, and returns PASS, FAIL or UNKNOWN with the findings. The command line `--root --base --head --change --observed` exits 0, 1 or 2 for them, so a workflow or a hook can use it. The control release/CTL24 declares it. The workflow, the hook mirror, the adapter from Testing's report and the gate in a ruleset are later slices.
`````

## Draft of CTL24.md

`````
---
id: release/CTL24
title: verify Act
description: It reveals whether the Cases that the approved PLAN leaves in force are really green at the head of an ACT.
type: detective
status: designed
has: [release/I56]
---
# release/CTL24 verify Act

A detective control. `verify Act` reads the Cases that the approved PLAN of a Change leaves in force, the cumulative result of its merged PLAN pull requests, from the base, and says FAIL, with the message `finish your work first` and the Cases named, when any is absent at the head, still planned red, changed without an approved PLAN amendment or observed RED. It says UNKNOWN, which never passes, when a Case was not observed green or no approved PLAN leaves a Case in force, and PASS only when every planned Case is really green. PASS is not an approval and not a merge decision.

It reads observations of Testing and never an exit code, and it reads the PLAN and the rules from the base, never from the candidate. It judges only the completion of the work: it does not say whether the Cases are good or the code is right. Making it a required check, in a hook for early feedback and in a ruleset, are other steps with their own Owner decisions.

It has one Intent, release/I56.
`````

## Draft of judge-act.mjs

`````
// verify Act: are the Cases that the approved PLAN of a Change leaves in force really green at the head of its ACT?
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SUFFIX = /(^|\/)(T\d+)\.(red|test)\.mjs$/;
const digest = (text) => createHash('sha256').update(text).digest('hex');

// The cumulative approved PLAN of a Change: the Cases that its merged PLAN pull requests leave in force, folded in order.
// A PLAN pull request is a first-parent commit of the base that touches the Change folder and whose subject starts with PLAN.
// A PLAN adds a Case (a Case file in the Change folder), changes one (a Case file of a Case already in force, wherever the DO moved it)
// or retires one (it deletes the Case and no other file of that id remains). A DO never changes what is in force.
// Everything is read from the base, never from the candidate.
export function plannedCases(root, base, changeDir) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' });
  const lines = (t) => t.split('\n').filter(Boolean);
  const inForce = {};
  for (const [sha, subject] of lines(git('log', '--first-parent', '--reverse', '--format=%H%x09%s', base, '--', changeDir)).map((l) => l.split('\t'))) {
    if (!/^PLAN\b/.test(subject)) continue;
    const present = new Set(lines(git('ls-tree', '-r', '--name-only', sha)).map((p) => p.match(SUFFIX)?.[2]).filter(Boolean));
    for (const [status, path] of lines(git('show', '--no-renames', '--name-status', '--format=', sha)).map((l) => l.split('\t'))) {
      const m = path.match(SUFFIX);
      if (!m) continue;
      const id = m[2];
      if (status === 'D') { if (id in inForce && !present.has(id)) delete inForce[id]; continue; }
      if (path.startsWith(`${changeDir}/`) || id in inForce) inForce[id] = digest(git('show', `${sha}:${path}`));
    }
  }
  return Object.entries(inForce).map(([id, fingerprint]) => ({ id, fingerprint })).sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

// What the head holds of each Case: the file that carries its id, wherever the DO moved it, as Git data.
// A Case is green only when a .test.mjs file carries it and no .red.mjs file does.
export function headCases(root, head) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' });
  const out = {};
  for (const p of git('ls-tree', '-r', '--name-only', head).split('\n').filter(Boolean)) {
    const m = p.match(SUFFIX);
    if (!m) continue;
    const green = m[3] === 'test';
    const fingerprint = digest(git('show', `${head}:${p}`));
    if (m[2] in out) out[m[2]].green = out[m[2]].green && green;
    else out[m[2]] = { path: p, green, fingerprint };
  }
  return out;
}

// observed: { T123: 'GREEN' | 'RED' | 'UNKNOWN' } from the observation of Testing. An exit code is never a verdict.
export function judgeAct({ planned, head, observed }) {
  if (!planned || !planned.length) return { verdict: 'UNKNOWN', findings: [{ id: '-', reason: 'no approved PLAN leaves a Case in force, so nothing can be really green' }] };
  const findings = [];
  for (const c of planned) {
    const h = head?.[c.id];
    if (!h) findings.push({ id: c.id, reason: 'absent at the head', fail: true });
    else if (!h.green) findings.push({ id: c.id, reason: 'still planned red (a .red.mjs file)', fail: true });
    else if (h.fingerprint !== c.fingerprint) findings.push({ id: c.id, reason: 'changed without an approved PLAN amendment', fail: true });
    else if (observed?.[c.id] === 'RED') findings.push({ id: c.id, reason: 'observed RED', fail: true });
    else if (observed?.[c.id] !== 'GREEN') findings.push({ id: c.id, reason: 'not observed green', fail: false });
  }
  const failed = findings.filter((f) => f.fail);
  if (failed.length) return { verdict: 'FAIL', findings, message: `finish your work first: ${failed.map((f) => f.id).join(', ')} of the approved PLAN are not really green` };
  if (findings.length) return { verdict: 'UNKNOWN', findings, message: `cannot judge: ${findings.map((f) => f.id).join(', ')} not observed green` };
  return { verdict: 'PASS', findings: [] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const root = arg('--root') ?? '.';
    r = judgeAct({
      planned: plannedCases(root, arg('--base'), arg('--change')),
      head: headCases(root, arg('--head')),
      observed: JSON.parse(readFileSync(arg('--observed'), 'utf8')),
    });
  } catch (e) { r = { verdict: 'UNKNOWN', findings: [], message: String(e.message) }; }
  console.log(`${r.verdict}${r.message ? `: ${r.message}` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````

