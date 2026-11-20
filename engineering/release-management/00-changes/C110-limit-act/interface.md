# C110 interface

Drafts of the files the DO adds, each equal to its file after the DO (the Cases compare them). The judge is independent of the judges of release/C103 and release/C108.

## Draft of I59.md

`````
---
id: release/I59
title: an ACT does only ACT work
---
# release/I59 an ACT does only ACT work

Contract: every route writes only the folders that its phase of the PDCA owns, and the ACT route writes only the folders of ACT work. The ACT reflects on finished work (today it writes the retro); it does not change the work it reflects on, so a Requirement, an Architecture element, source or a Case cannot be rewritten inside an ACT and pass as reflection. Who may write which folder is known from the layout, kept as data, the write map: a row per route (the ACT's folders are the retros; a hotfix route may write all, a wire route only the delivery folders: rows of other Changes). The folders are what makes the boundary inspectable and lockable. Reason: an ACT that changes more than its folders hides changes behind the trust a retrospective earns. Owner: release management, for the write map and its rows; the owner of a row's object owns the folders it names (the retros: kaal-retro). Whether the work is finished, whether the ACT is present and what the retro contains are other concerns.
`````

## Draft of F85.md

`````
---
id: release/F85
title: limit-act
kind: functional
serves: [release/I59]
---
# release/F85 limit-act

The judgement is made over the paths a pull request changes, handed in as facts (every path added, modified or deleted, and both ends of a rename), and over the write map, from which it reads the row of the route `act`: the folders the ACT may write. A pull request that changes no path in a folder of that row is not an ACT: it says PASS and looks at nothing more. A pull request that changes a path in such a folder is an ACT: it says PASS when every path it changes lies in the folders of the row, and FAIL naming each path outside. It says UNKNOWN, which never passes, when the paths or the map cannot be read or the map has not exactly one row for the route `act`. That a pull request is an ACT is read from the paths it changes and nothing else: not from a title, a branch name, a label or the history. The other rows of the map (a hotfix, a wire) are other controls' and are never read here. The judge is one function; the places that ask it decide what a verdict does: a required check blocks, an advisory reminder never does. A new ACT folder is a new entry of the row, not a change of the judge.
`````

## Draft of A75.md

`````
---
id: release/A75
title: judge-limit-act
addresses: [release/F85]
---
# release/A75 judge-limit-act

The component is the judge `05-src/phase/judge-limit-act.mjs`: a pure function `judgeLimitAct({ changed, map })` over the changed paths and the write map, and a command line (`--changed <file>`, `--map <file>` defaulting to the data next to the judge) that reads them from files and exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN. The write map is the data `05-src/phase/write-map.json`, owned by release: a list of `{ route, folders }`, a folder being a prefix that ends in `/` in which `*` stands for exactly one segment (the capability). No other pattern exists, so the lock a ruleset path restriction would apply is the same list. This Change adds the row of the route `act`; the rows of the hotfix and wire routes are later Changes, each added by the control that uses it. The paths a pull request changes are derived by the wiring; this judge is given them and reads nothing of Git or GitHub.

Its parent is release/A72 (GitHub) through the check that runs it, once that is placed; the job, its declaration on the station and the advisory hook are the next Changes.
`````

## Draft of CTL30.md

`````
---
id: release/CTL30
title: limit Act
description: It reveals an ACT pull request that writes a folder that the ACT route may not write.
type: detective
status: designed
has: [release/I59]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL30 limit Act

A detective control that is meant to become preventive. A pull request that changes a folder that the ACT route writes, today the retros, is an ACT, and it may change nothing outside those folders: once the station `23 - collecting` requires the check of release/A75 on pull requests into a collector, rewriting a Requirement, an Architecture element, source or a Case cannot pass as reflection. A pull request that changes no ACT folder is not asked for anything. It does not say whether the collector is ready (release/CTL24), whether the ACT is present before promotion (release/CTL29) or what the retro contains (`verify Act`). It has one Intent, release/I59, which holds the details with the Requirements and Architecture under it. It rolls out detective first: (1) its verdict is observed on real ACT pull requests without blocking; (2) it runs as an advisory CI check behind a feature flag and the evidence is collected; (3) only after validation and the Owner's explicit authorization is it declared on the station and loaded by the Owner, and from then on the control is preventive and its type changes in the Change that makes it so. The judge only judges; once the check is required UNKNOWN does not pass.
`````

## Draft of judge-limit-act.mjs

`````
// limit Act: does a pull request that is an ACT write only the folders of the ACT route? Pure over facts: nothing is read from Git or GitHub.
// judgeLimitAct({ changed, map }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', message[, outside] }
// changed: every path the pull request changes, relative to the repository (both ends of a rename); map: the write map as in write-map.json,
// [{ route, folders }]: the folders a route may write. This judge reads only the row of the route 'act'; the other rows are other controls'.
// A folder is a prefix that ends in '/'; '*' stands for exactly one segment. A pull request that changes a path in a folder of the row is an ACT.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const unknown = (message) => ({ verdict: 'UNKNOWN', message });
const usable = (p) => typeof p === 'string' && p !== '' && !p.startsWith('/') && !p.split('/').includes('..') && !p.split('/').includes('.');

// Does the path lie in the folder? Every segment of the folder matches the same segment of the path, '*' matching any one.
export function inFolder(path, folder) {
  const f = folder.split('/').slice(0, -1);
  const p = path.split('/');
  return p.length > f.length && f.every((s, i) => s === '*' || s === p[i]);
}

export function judgeLimitAct(facts) {
  const { changed, map } = facts && typeof facts === 'object' ? facts : {};
  if (!Array.isArray(changed) || !changed.every(usable)) return unknown('the changed paths could not be read');
  if (!Array.isArray(map) || !map.every((r) => r && typeof r.route === 'string' && r.route !== '' && Array.isArray(r.folders) && r.folders.length > 0 && r.folders.every((f) => typeof f === 'string' && f.endsWith('/') && f.length > 1 && !f.startsWith('/') && !f.split('/').includes('..')))) return unknown('the write map could not be read');
  const rows = map.filter((r) => r.route === 'act');
  if (rows.length !== 1) return unknown('the write map has no single row for the route act');
  const folders = rows[0].folders;
  const lies = (p) => folders.some((f) => inFolder(p, f));
  if (!changed.some(lies)) return { verdict: 'PASS', message: 'not an ACT: it changes no folder the route act writes', outside: [] };
  const outside = changed.filter((p) => !lies(p));
  if (outside.length) return { verdict: 'FAIL', message: `an ACT may write only its folders (${folders.join(', ')}): these paths are outside: ${outside.join(', ')}`, outside };
  return { verdict: 'PASS', message: 'an ACT that writes only the folders of its route', outside: [] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const map = JSON.parse(readFileSync(arg('--map') ?? join(dirname(fileURLToPath(import.meta.url)), 'write-map.json'), 'utf8'));
    r = judgeLimitAct({ changed: JSON.parse(readFileSync(arg('--changed'), 'utf8')), map });
  } catch (e) { r = unknown(String(e.message)); }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````

## Draft of write-map.json

`````
[
  { "route": "act", "folders": ["engineering/*/02-learnings/retros/"] }
]
`````
