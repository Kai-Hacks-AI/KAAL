# C103 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of I56.md

`````
---
id: release/I56
title: an ACT enters a collector only when the Cases its PLAN added are really green
---
# release/I56 an ACT enters a collector only when the Cases its PLAN added are really green

Contract: the work of a collector is done when the Cases its merged PLAN added are really green, and only then may its ACT enter. Real green means the PLAN added them RED and the DO turned exactly those GREEN: the same Cases, unchanged, with the inverse expectation. Reason: the PLAN states what will be true, the DO makes it true, and the ACT reviews work that is finished; an ACT on unfinished work reviews nothing. Owner: release management, which owns the stages until stages or stations have their own home. Threads own PDCA and raise their own ACT; the Dispatcher raises a PROMOTION only after an ACT has merged.
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

A check on an ACT pull request into a collector says PASS only when every Case that the merged PLAN added is really green at the head: its file `T<n>.test.mjs` exists, its content equals the one of the PLAN, and the observation of Testing at the head is GREEN. It says FAIL, with the message `finish your work first` and the Cases named, when a planned Case is absent, still a `.red.mjs`, changed since the PLAN or observed RED. It says UNKNOWN, which never passes, when a Case was not observed green or the PLAN added no Case. The planned Cases and the rules are read from the base, never from the candidate. An exit code is never a verdict: the check reads observations. It does not approve and does not merge.
`````

## Draft of A71.md

`````
---
id: release/A71
title: verify-act-from-the-plan-revision
addresses: [release/F80]
---
# release/A71 verify-act-from-the-plan-revision

The source `05-src/phase/judge-act.mjs` has three parts. `plannedCases(root, base, changeDir)` finds the merged PLAN as the oldest first-parent commit of the base that touches the Change folder and returns the `T<n>.red.mjs` Cases of that commit with their content fingerprints. `headCases(root, head)` lists the `T<n>` Case files of the head as Git data, wherever the DO moved them, with their fingerprints. `judgeAct({ planned, head, observed })` is a pure function of those and of the observations `{ T<n>: GREEN | RED | UNKNOWN }` of Testing, and returns PASS, FAIL or UNKNOWN with the findings. The command line `--root --base --head --change --observed` exits 0, 1 or 2 for them, so a workflow or a hook can use it. The control release/CTL24 declares it. The workflow, the hook mirror, the adapter from Testing's report and the gate in a ruleset are later slices.
`````

## Draft of CTL24.md

`````
---
id: release/CTL24
title: verify Act
description: It reveals whether the Cases that the merged PLAN added are really green at the head of an ACT.
type: detective
status: designed
has: [release/I56]
---
# release/CTL24 verify Act

A detective control. `verify Act` reads the Cases that the merged PLAN of a Change added, from the base, and says FAIL, with the message `finish your work first` and the Cases named, when any is absent at the head, still planned red, changed since the PLAN or observed RED. It says UNKNOWN, which never passes, when a Case was not observed green or the PLAN added no Case, and PASS only when every planned Case is really green. PASS is not an approval and not a merge decision.

It reads observations of Testing and never an exit code, and it reads the PLAN and the rules from the base, never from the candidate. It judges only the completion of the work: it does not say whether the Cases are good or the code is right. Making it a required check, in a hook for early feedback and in a ruleset, are other steps with their own Owner decisions.

It has one Intent, release/I56.
`````

## Draft of judge-act.mjs

`````
// verify Act: are the Cases that the PLAN added really green at the head of an ACT?
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SUFFIX = /(^|\/)(T\d+)\.(red|test)\.mjs$/;
const sha = (text) => createHash('sha256').update(text).digest('hex');

// The Cases a PLAN added: the .red.mjs files of the Change folder at the oldest first-parent commit that touches the folder.
// They are read from the base, never from the candidate.
export function plannedCases(root, base, changeDir) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' });
  const revs = git('log', '--first-parent', '--format=%H', base, '--', changeDir).split('\n').filter(Boolean);
  if (!revs.length) return [];
  const plan = revs[revs.length - 1];
  const out = [];
  for (const p of git('ls-tree', '-r', '--name-only', plan, '--', changeDir).split('\n').filter(Boolean)) {
    const m = p.match(SUFFIX);
    if (m && /\.red\.mjs$/.test(p)) out.push({ id: m[2], fingerprint: sha(git('show', `${plan}:${p}`)) });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

// What the head holds of each planned Case: the file that carries its id, wherever the DO moved it, as Git data.
export function headCases(root, head) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' });
  const out = {};
  for (const p of git('ls-tree', '-r', '--name-only', head).split('\n').filter(Boolean)) {
    const m = p.match(SUFFIX);
    if (!m) continue;
    out[m[2]] = { path: p, green: m[3] === 'test', fingerprint: sha(git('show', `${head}:${p}`)) };
  }
  return out;
}

// observed: { T123: 'GREEN' | 'RED' | 'UNKNOWN' } from the observation of Testing. An exit code is never a verdict.
export function judgeAct({ planned, head, observed }) {
  if (!planned || !planned.length) return { verdict: 'UNKNOWN', findings: [{ id: '-', reason: 'the PLAN added no Case, so nothing can be really green' }] };
  const findings = [];
  for (const c of planned) {
    const h = head?.[c.id];
    if (!h) findings.push({ id: c.id, reason: 'absent at the head', fail: true });
    else if (!h.green) findings.push({ id: c.id, reason: 'still planned red (a .red.mjs file)', fail: true });
    else if (h.fingerprint !== c.fingerprint) findings.push({ id: c.id, reason: 'changed since the PLAN (a changed Case is a PLAN amendment)', fail: true });
    else if (observed?.[c.id] === 'RED') findings.push({ id: c.id, reason: 'observed RED', fail: true });
    else if (observed?.[c.id] !== 'GREEN') findings.push({ id: c.id, reason: 'not observed green', fail: false });
  }
  const failed = findings.filter((f) => f.fail);
  if (failed.length) return { verdict: 'FAIL', findings, message: `finish your work first: ${failed.map((f) => f.id).join(', ')} of the PLAN are not really green` };
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

