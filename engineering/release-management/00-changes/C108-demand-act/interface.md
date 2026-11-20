# C108 interface

Drafts of the files the DO adds, each equal to its file after the DO (the Cases compare them). The judge reuses `judge-act.mjs` of release/C103 (`actOf`, `applicableCases`, `judgeAct`), so this Change's DO follows the DO of release/C103.

## Draft of I58.md

`````
---
id: release/I58
title: a Change is closed by its ACT before it is promoted
---
# release/I58 a Change is closed by its ACT before it is promoted

Contract: a Change whose work is finished, every Case that applies to it really green (release/I56), is closed by its ACT, the ACT beside its Change folder (`<Change>.act.md`), before the collector that carries it is promoted. The ACT is the last step of the work: only when it has landed is the collector done. A Change that is not yet finished owes no ACT, and its Cases are another concern. Reason: a collector promoted without its ACT leaves the retrospective of the work unwritten and the PDCA of its Change unclosed, and nothing afterwards asks for it. Owner: release management. What the ACT must contain is not claimed here: that is the format of the ACT, its own concern.
`````

## Draft of F84.md

`````
---
id: release/F84
title: demand-act
kind: functional
serves: [release/I58]
---
# release/F84 demand-act

The promotion is judged over the Changes it carries, read from the checked-out tree: for each Change that is not closed, that is with no ACT beside its folder, the judgement of release/I56 decides whether its work is finished. It says FAIL naming each Change that is finished and has no ACT (`Change closed, ACT due`); PASS when every carried Change has its ACT, or is not finished, or none is carried; and UNKNOWN, which never passes, when it cannot be told whether a Change is finished or has its ACT. A Change that has its ACT is not looked at further. The judgement reads nothing of the history or the titles of the pull request. The judge is one function; the places that ask it decide what a verdict does: the required check of the Promoting station blocks, an advisory reminder never does.
`````

## Draft of A74.md

`````
---
id: release/A74
title: judge-demand-act
addresses: [release/F84]
---
# release/A74 judge-demand-act

The component is the judge `05-src/phase/judge-demand-act.mjs`: a pure function `judgeDemandAct({ changes })` over the carried Changes, each with its folder, whether an ACT stands beside it, and the facts of hold Act, and a command line (`--root`, `--changes <dirs>`, `--observed <file>`) that reads them from a tree and exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN. It does not decide what is really green: it asks the judge of release/A71 (`judgeAct`), so the two controls of the ACT cannot disagree about when work is finished. Which Changes a promotion carries is derived from content by kaal-change and handed in by the wiring; this judge is given the list.

Its parent is release/A68, the ruleset of the Promoting station, once release/C105 has placed it; the DO of this Change adds `parent: release/A68` then. The job that runs it, its declaration on the Promoting station and the advisory hook are the next Changes.
`````

## Draft of CTL29.md

`````
---
id: release/CTL29
title: demand Act
description: It reveals a promotion that carries a finished Change without its ACT.
type: detective
status: designed
has: [release/I58]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL29 demand Act

A detective control that is meant to become preventive. A collector is not to be promoted while a Change it carries is finished and has no ACT: once the Promoting station requires the check of release/A74 on the promotion, the ACT cannot be skipped. A Change that is not finished owes no ACT, and a Change that has its ACT is not asked for more; what an ACT must contain is the control `verify Act`. It sits on the promotion and never on the collector, where it would hold back the DO that closes the last red Case. It has one Intent, release/I58, which holds the details with the Requirements and Architecture under it. It rolls out detective first: (1) its verdict is observed on real promotions without blocking; (2) it runs as an advisory CI check behind a feature flag and the evidence is collected; (3) only after validation and the Owner's explicit authorization is it declared on the Promoting station and loaded by the Owner, and from then on the control is preventive and its type changes in the Change that makes it so; release/CTL26 then observes that the requirement is in force. The judge only judges; once the check is required UNKNOWN does not pass.
`````

## Draft of judge-demand-act.mjs

`````
// demand Act: has every Change that is finished been closed by its ACT? Pure over facts: nothing is read from Git or GitHub.
// judgeDemandAct({ changes }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', message[, due] }
// changes: the Changes a promotion carries, each { dir, acted, applicable, observed }: its folder, whether an ACT stands beside it, and the facts
// of hold Act (the applicable Cases and the observations of Testing). Whether work is really green is decided by hold Act's judge, not here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { actOf, applicableCases, judgeAct } from './judge-act.mjs';

const unknown = (message) => ({ verdict: 'UNKNOWN', message });

export function judgeDemandAct(facts) {
  const changes = facts && typeof facts === 'object' ? facts.changes : undefined;
  if (!Array.isArray(changes) || !changes.every((c) => c && typeof c.dir === 'string' && c.dir)) return unknown('the carried Changes could not be read');
  const due = [], cannot = [];
  for (const c of changes) {
    if (c.acted === true) continue;
    if (c.acted !== false) { cannot.push(c.dir); continue; }
    const finished = judgeAct({ applicable: c.applicable, observed: c.observed, acted: true }).verdict;
    if (finished === 'PASS') due.push(c.dir);
    else if (finished === 'UNKNOWN') cannot.push(c.dir);
  }
  if (due.length) return { verdict: 'FAIL', message: `Change closed, ACT due: ${due.join(', ')}`, due };
  if (cannot.length) return unknown(`cannot tell whether these Changes are finished or closed: ${cannot.join(', ')}`);
  return { verdict: 'PASS', message: 'every finished Change has its ACT', due };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const root = arg('--root') ?? '.';
    const dirs = (arg('--changes') ?? '').split(',').filter(Boolean);
    const changes = dirs.map((dir) => ({ dir, acted: actOf(root, dir) }));
    if (changes.some((c) => c.acted === false)) {
      const observed = JSON.parse(readFileSync(arg('--observed'), 'utf8'));
      for (const c of changes) if (c.acted === false) { c.applicable = applicableCases(root, c.dir); c.observed = observed; }
    }
    r = judgeDemandAct({ changes });
  } catch (e) { r = unknown(String(e.message)); }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````

