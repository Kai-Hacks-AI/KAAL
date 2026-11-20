# C103 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of I56.md

`````
---
id: release/I56
title: an ACT enters a collector only when the Cases that apply to its Change are really green
---
# release/I56 an ACT enters a collector only when the Cases that apply to its Change are really green

Contract: the work of a collector is done when every Case that applies to its Change is really green, and only then may its ACT enter. A collector is an evolving workspace of KAAL artifacts, not a history. It may receive any number of PLANs while the work is underway: each adds or amends Cases together with the Intents, Requirements, Architecture and Defects that justify them, and so changes which Cases are applicable. Any number of DOs then implement the work and turn those Cases GREEN, and exactly one ACT reviews it. What applies, and how far the work is, is measured from the content of the branch (its files, their relationships and the observed results of its Cases). Pull requests and commits transport the work and give it provenance; their titles, their first-parent history and their merge shapes are never the way to find or measure it. Real green means no applicable Case is still parked red and Testing observes each GREEN. Reason: the PLAN states what will be true, the DO makes it true, and the ACT reviews work that is finished; an ACT on unfinished work reviews nothing. Whether a given pull request may change Cases or artifacts is a different concern, authorization of the transport, with its own control. Owner: release management, which owns the stages until stages or stations have their own home. Threads own PDCA and raise their own ACT; the Dispatcher raises a PROMOTION only after an ACT has merged.
`````

## Draft of F80.md

`````
---
id: release/F80
title: hold-act
kind: functional
serves: [release/I56]
---
# release/F80 hold-act

A check on every pull request into a collector reads the checked-out tree and holds the ACT: an ACT may stand beside a Change folder only when the Cases that apply to that Change are really green. With no ACT beside the Change folder there is no ACT to hold and the check says PASS, whatever is red, so the PLANs and DOs that precede the ACT land. With an ACT in it, the rest of this paragraph decides. The Cases that apply to the Change are those in its folder and those that test an element the Change justifies, that is the Intents its record implements and every element that reaches one of them along the one-way relationships (serves, addresses, has), whether the element is placed or still a draft in the Change folder. The check says PASS only when at least one Case applies, none is parked as a `.red.mjs`, and the observation of Testing is GREEN for each. It says FAIL, with the message `finish your work first` and the Cases named, when an applicable Case is parked red or observed RED. It says UNKNOWN, which never passes, when an applicable Case was not observed green or no Case applies. It reports the count of red, green and unknown Cases. It reads nothing of the history of the branch: the same tree gives the same answer however it was transported. An exit code is never a verdict: the check reads observations. It does not approve and does not merge. Judgement is kept apart from enforcement: the judge says PASS, FAIL or UNKNOWN and never blocks; the place that asks it decides what a verdict does (a report, an advisory check, a required check), and once the check is required UNKNOWN does not count as PASS.
`````

## Draft of A71.md

`````
---
id: release/A71
title: hold-act-from-the-tree
addresses: [release/F80]
---
# release/A71 hold-act-from-the-tree

The source `05-src/phase/judge-act.mjs` has three parts and reads a folder, never Git. `elementsOf(root, changeDir)` reads the elements of the tree, the Markdown files with a frontmatter id and the drafts fenced by five backticks in the Change folder (a placed element wins over its draft). `applicableCases(root, changeDir)` takes the Intents implemented by the Change record, widens them along the one-way relationships to every element that reaches one, and returns the Cases that are in the Change folder or test any of those elements, each parked red when any file carrying its id is a `.red.mjs`. `actOf(root, changeDir)` says whether the Change folder holds an ACT. `judgeAct({ applicable, observed, acted })` is a pure function of those and of the observations `{ <scope>/T<n>: GREEN | RED | UNKNOWN }` of Testing, and returns PASS, FAIL or UNKNOWN with the counts and the findings. The command line `--root --change --observed` exits 0, 1 or 2 for them, so a workflow or a hook can use it. Which folder is handed over is the wiring's decision. The control release/CTL24 declares it. The workflow, the hook mirror, the adapter from Testing's report, the control that authorizes what a pull request may change and the gate in a ruleset are later slices.
`````

## Draft of CTL24.md

`````
---
id: release/CTL24
title: hold Act
description: It reveals an ACT that stands beside a Change folder while the Cases that apply to its Change are not really green.
type: detective
status: designed
has: [release/I56]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL24 hold Act

A detective control that is meant to become preventive. `hold Act` holds the ACT of a collector back until the work is done: it reveals an ACT that has come too early. It measures the tree of a collector: with no ACT beside the Change folder it says PASS, there is no ACT to hold; with one it finds the Cases that apply to the Change from the content (its folder, and the Cases that test the elements the Change justifies along the relationships) and says FAIL, with the message `finish your work first` and the Cases named, while any is parked red or observed RED. It says UNKNOWN, which never passes, when an applicable Case was not observed green or no Case applies, and PASS only when every applicable Case is really green. It reports how many are red, green and unknown. PASS is not an approval and not a merge decision.

It reads the tree it is handed and the observations of Testing, never an exit code and never the history of the branch. It judges only the completion of the work: it does not say whether the Cases are good or the code is right, and not whether a pull request was entitled to change them. Making it a required check, in a hook for early feedback and in a ruleset, are other steps with their own Owner decisions.

It rolls out detective first, as the other controls of this repository did: (1) its verdict is observed on real collector pull requests without blocking anything; (2) it runs as an advisory CI check behind a feature flag, and the evidence is collected; (3) only after that is validated and the Owner authorizes it is the check required in the `23 - collecting` ruleset, and from then on the control is preventive and its type changes in the Change that makes it so. The judge only judges; what a verdict does is decided where it is asked, and once the check is required UNKNOWN does not pass.

It has one Intent, release/I56.
`````

## Draft of judge-act.mjs

`````
// hold Act: are the Cases that the content of a collector makes applicable really green at its head?
// It measures the checked-out tree (the folder it is handed) and nothing else. Pull requests and commits transport the work;
// their titles, their history and their shapes are never read.
// It holds the ACT: with no ACT beside the Change folder there is no ACT to hold and the answer is PASS; with one, the Cases decide.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const CASE_FILE = /(^|\/)T\d+\.(red|test)\.mjs$/;
// The relationships between elements, each one-way, from the element that declares it to the one it names.
const EDGES = ['implements', 'serves', 'addresses', 'has'];

const walk = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])) : []);

// The frontmatter of an element: `key: value` and `key: [a, b]`.
function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const v = kv[2].trim();
    out[kv[1]] = v.startsWith('[') ? v.slice(1, v.lastIndexOf(']')).split(',').map((s) => s.trim()).filter(Boolean) : v;
  }
  return out;
}

// The elements of a tree: every Markdown file with a frontmatter id, and every draft (a block fenced by five backticks)
// in the files of the Change folder, where a PLAN keeps the elements that justify its Cases until the DO places them.
// An element that is placed wins over its draft.
export function elementsOf(root, changeDir) {
  const found = new Map();
  const add = (fm, placed) => { if (fm?.id && (placed || !found.has(fm.id))) found.set(fm.id, fm); };
  for (const file of walk(root).filter((f) => f.endsWith('.md'))) {
    const text = readFileSync(file, 'utf8');
    add(frontmatter(text), true);
    if (relative(root, file).startsWith(`${changeDir}/`)) for (const block of text.matchAll(/^`````\n([\s\S]*?)\n`````$/gm)) add(frontmatter(block[1]), false);
  }
  return found;
}

// The ids the Change justifies: the Intents its record (C<n>.md) implements, and every element that reaches one of them along the relationships.
export function justifiedBy(elements, change) {
  const justified = new Set(([]).concat(change?.implements ?? []));
  for (let grew = true; grew;) {
    grew = false;
    for (const [id, fm] of elements) {
      if (justified.has(id)) continue;
      if (EDGES.some((k) => ([]).concat(fm[k] ?? []).some((t) => justified.has(t)))) { justified.add(id); grew = true; }
    }
  }
  return justified;
}

// The Cases that apply to a Change: those in its folder, and those that test an element it justifies, wherever they are.
// A Case is parked red while any file carrying its id is a .red.mjs.
export function applicableCases(root, changeDir) {
  const record = readdirSync(join(root, changeDir)).find((f) => /^C\d+\.md$/.test(f));
  const change = record ? frontmatter(readFileSync(join(root, changeDir, record), 'utf8')) : null;
  const justified = justifiedBy(elementsOf(root, changeDir), change);
  const cases = new Map();
  for (const file of walk(root).filter((f) => CASE_FILE.test(f))) {
    const text = readFileSync(file, 'utf8');
    const id = text.match(/export const id = '([^']+)'/)?.[1];
    if (!id) continue;
    const tests = (text.match(/export const tests = \[([^\]]*)\]/)?.[1] ?? '').split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    const inChange = relative(root, file).startsWith(`${changeDir}/`);
    if (!inChange && !tests.some((t) => justified.has(t))) continue;
    const parked = file.endsWith('.red.mjs');
    const known = cases.get(id);
    cases.set(id, { id, path: relative(root, file), parked: parked || (known?.parked ?? false) });
  }
  return [...cases.values()].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

// Whether the Change folder holds its ACT, the ACT. Only its presence is read here; its format is another control's.
export const actOf = (root, changeDir) => (existsSync(join(root, changeDir)) ? existsSync(join(root, `${changeDir}.act.md`)) : undefined);

// observed: { 'release/T123': 'GREEN' | 'RED' | 'UNKNOWN' } from the observation of Testing. An exit code is never a verdict.
export function judgeAct({ applicable, observed, acted }) {
  if (acted !== true && acted !== false) return { verdict: 'UNKNOWN', progress: { red: 0, green: 0, unknown: 0 }, findings: [], message: 'cannot judge: it is not known whether an ACT stands beside the Change folder' };
  if (acted === false) return { verdict: 'PASS', findings: [], message: 'no ACT beside the Change folder: there is no ACT to hold' };
  if (!applicable?.length) return { verdict: 'UNKNOWN', progress: { red: 0, green: 0, unknown: 0 }, findings: [{ id: '-', reason: 'no Case applies, so nothing can be really green' }], message: 'cannot judge: no Case applies' };
  const findings = [];
  for (const c of applicable) {
    if (c.parked) findings.push({ id: c.id, reason: 'still planned red (a .red.mjs file)', fail: true });
    else if (observed?.[c.id] === 'RED') findings.push({ id: c.id, reason: 'observed RED', fail: true });
    else if (observed?.[c.id] !== 'GREEN') findings.push({ id: c.id, reason: 'not observed green', fail: false });
  }
  const failed = findings.filter((f) => f.fail);
  const progress = { red: failed.length, green: applicable.length - findings.length, unknown: findings.length - failed.length };
  if (failed.length) return { verdict: 'FAIL', progress, findings, message: `finish your work first: ${failed.map((f) => f.id).join(', ')} of ${applicable.length} applicable Cases are not really green` };
  if (findings.length) return { verdict: 'UNKNOWN', progress, findings, message: `cannot judge: ${findings.map((f) => f.id).join(', ')} not observed green` };
  return { verdict: 'PASS', progress, findings: [] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const root = arg('--root') ?? '.';
    const acted = actOf(root, arg('--change'));
    r = acted === true
      ? judgeAct({ applicable: applicableCases(root, arg('--change')), observed: JSON.parse(readFileSync(arg('--observed'), 'utf8')), acted })
      : judgeAct({ acted });
  } catch (e) { r = { verdict: 'UNKNOWN', findings: [], message: String(e.message) }; }
  console.log(`${r.verdict}${r.message ? `: ${r.message}` : ''}${r.progress ? ` (red ${r.progress.red}, green ${r.progress.green}, unknown ${r.progress.unknown})` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````
