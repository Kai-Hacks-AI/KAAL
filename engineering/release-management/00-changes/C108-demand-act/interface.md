# C108 interface

Drafts of the files the DO adds, each equal to its file after the DO (the Cases compare them). The judge reuses `judge-act.mjs` of release/C103 (`retrosOf`, `changeIdOf`, `applicableCases`, `judgeFinished`), so this Change's DO follows the DO of release/C103.

## Draft of I58.md

`````
---
id: release/I58
title: a collector is closed by its retro before it is promoted
---
# release/I58 a collector is closed by its retro before it is promoted

Contract: a collector whose work is finished, every Case that applies to the Changes it carries really green (release/I56), is closed by its ACT before it is promoted. The ACT is the retro of the collector (the 4L of kaal-retro, in `02-learnings/retros/`), and it names the Changes it reflects: `retro -reflects-> Change`. A collector has exactly one ACT, one retro that reflects the complete set of the Changes it carries, and a Change is closed when that retro reflects it. The ACT is the last step of the work: only when it has landed is the collector done. A collector that is not yet finished owes no ACT, and its Cases are another concern. Reason: a collector promoted without its retro leaves the retrospective of the work unwritten and the PDCA of its Changes unclosed, and nothing afterwards asks for it. Owner: release management. What the retro must contain, and its id, are not claimed here: they are kaal-retro's.
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

The promotion is judged over the Changes it carries, handed in as facts, and over the retros of the tree, read only by what they declare in their front matter, `reflects: [C…]` (their id and format are kaal-retro's). When every Case that applies to the carried Changes is really green, as release/I56 judges it, the collector must have exactly one ACT, one retro that reflects every carried Change: it says FAIL naming the Changes that no retro reflects (`Changes closed, retro due`). It says FAIL, at any time, when more than one retro reflects the Changes the collector carries, however they are divided between them. It says PASS when the work is not finished and no more than one ACT stands (that gap is another control's), when one retro reflects every carried Change, or when none is carried; and UNKNOWN, which never passes, when it cannot be told whether the work is finished and a Change is unreflected. The judgement reads nothing of the history or the titles of the pull request. The judge is one function; the places that ask it decide what a verdict does: the required check of the Promoting station blocks, an advisory reminder never does.
`````

## Draft of A74.md

`````
---
id: release/A74
title: judge-demand-act
addresses: [release/F84]
---
# release/A74 judge-demand-act

The component is the judge `05-src/phase/judge-demand-act.mjs`: a pure function `judgeDemandAct({ changes, retros, observed })` over the carried Changes (each `{ id, applicable }`), the retros (each `{ reflects: [ids] }`) and the observations of Testing, and a command line (`--root`, `--changes <dirs>`, `--observed <file>`) that reads them from a tree, the retros through `retrosOf` of release/A71, and exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN. It does not decide what is really green: it asks the judge of release/A71 (`judgeFinished`), so the controls of the ACT cannot disagree about when work is finished. Which Changes a promotion carries is derived from content by kaal-change and handed in by the wiring; this judge is given the list.

Its parent is release/A68, the ruleset of the Promoting station, once release/C105 has placed it; the DO of this Change adds `parent: release/A68` then. The job that runs it, its declaration on the Promoting station and the advisory hook are the next Changes.
`````

## Draft of CTL29.md

`````
---
id: release/CTL29
title: demand Act
description: It reveals a promotion of a finished collector whose Changes are not reflected by a retro.
type: detective
status: designed
has: [release/I58]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL29 demand Act

A detective control that is meant to become preventive. A collector is not to be promoted when its work is finished and a Change it carries is reflected by no retro, or when more than one retro reflects the Changes it carries: once the Promoting station requires the check of release/A74 on the promotion, the ACT cannot be skipped. A collector that is not finished owes no ACT yet, and a Change that has its retro is not asked for more; what a retro must contain is the control `verify Act`. It sits on the promotion and never on the collector, where it would hold back the DO that closes the last red Case. It has one Intent, release/I58, which holds the details with the Requirements and Architecture under it. It rolls out detective first: (1) its verdict is observed on real promotions without blocking; (2) it runs as an advisory CI check behind a feature flag and the evidence is collected; (3) only after validation and the Owner's explicit authorization is it declared on the Promoting station and loaded by the Owner, and from then on the control is preventive and its type changes in the Change that makes it so; release/CTL26 then observes that the requirement is in force. The judge only judges; once the check is required UNKNOWN does not pass.
`````

## Draft of judge-demand-act.mjs

`````
// demand Act: once the work of a collector is finished, does it have exactly one ACT, one retro that reflects every Change it carries? Pure over facts: nothing is read from Git or GitHub.
// judgeDemandAct({ changes, retros, observed }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', message[, due, acts] }
// changes: the Changes a promotion carries, each { id, applicable }; retros: each { reflects: [ids] } (the id and the format of a retro are not read);
// observed: the observations of Testing. Whether work is really green is decided by hold Act's judge, not here.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { retrosOf, changeIdOf, applicableCases, judgeFinished } from './judge-act.mjs';

const unknown = (message) => ({ verdict: 'UNKNOWN', message });

export function judgeDemandAct(facts) {
  const { changes, retros, observed } = facts && typeof facts === 'object' ? facts : {};
  if (!Array.isArray(changes) || !changes.every((c) => c && typeof c.id === 'string' && c.id !== '' && Array.isArray(c.applicable))) return unknown('the carried Changes could not be read');
  if (!Array.isArray(retros) || !retros.every((r) => r && Array.isArray(r.reflects) && r.reflects.every((s) => typeof s === 'string'))) return unknown('the retros could not be read');
  const count = (id) => retros.filter((r) => r.reflects.includes(id)).length;
  const acts = retros.filter((r) => r.reflects.some((id) => changes.some((c) => c.id === id)));
  const unreflected = changes.filter((c) => count(c.id) === 0).map((c) => c.id);
  const problems = [];
  let due = [], cannot = false;
  if (acts.length > 1) problems.push(`more than one ACT for the collector: ${acts.map((r) => `[${r.reflects.join(', ')}]`).join(' ')}`);
  if (unreflected.length) {
    const finished = judgeFinished({ changes, observed }).verdict;
    if (finished === 'PASS') { due = unreflected; problems.push(`Changes closed, retro due: ${due.join(', ')}`); }
    else if (finished === 'UNKNOWN') cannot = true;
  }
  if (problems.length) return { verdict: 'FAIL', message: problems.join('; '), due, acts: acts.length };
  if (cannot) return unknown(`cannot tell whether the work is finished, and these Changes are reflected by no retro: ${unreflected.join(', ')}`);
  return { verdict: 'PASS', message: 'nothing is due', due, acts: acts.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const root = arg('--root') ?? '.';
    const dirs = (arg('--changes') ?? '').split(',').filter(Boolean);
    const ids = dirs.map((d) => changeIdOf(root, d));
    if (ids.some((id) => !id) || dirs.some((d) => !existsSync(join(root, d)))) throw new Error('the carried Changes are not known');
    const retros = retrosOf(root);
    const open = ids.some((id) => !retros.some((x) => x.reflects.includes(id)));
    const observed = open ? JSON.parse(readFileSync(arg('--observed'), 'utf8')) : undefined;
    r = judgeDemandAct({ changes: dirs.map((d, i) => ({ id: ids[i], applicable: open ? applicableCases(root, d) : [] })), retros, observed });
  } catch (e) { r = unknown(String(e.message)); }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````

