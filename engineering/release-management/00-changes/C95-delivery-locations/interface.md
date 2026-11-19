# C95 interface

The drafts the DO takes as its files. Each is exactly what the Cases of this PLAN need; the Cases pass on them in a throwaway copy (`evidence.md`). The PLAN itself adds none of them to the tree.

## Draft of I53.md

Goes to `engineering/release-management/01-intent/I53-delivery-locations-declared-once/I53.md`.

`````
---
id: release/I53
title: delivery locations are declared once
---
# release/I53 delivery locations are declared once

Solution architecture defines what is delivered; delivery architecture defines how it is delivered. Both are code, both live in Git, and both are governed and versioned. They serve different outcomes: a functioning solution, and a reliable delivery of it. The distinction is by responsibility and outcome, not by technology, repository, directory or packaging format, so it holds in a repository that has no packages at all. Delivery locations are one concern of delivery architecture; installation, synchronization, activation and verification are others, and none of them is changed here.

Contract: the delivery locations of a consumer, the named places a delivery may write to (in KAAL `.github`, `.githooks` and `.kaal`), are declared once, in that consumer's delivery architecture, and every consumer of the declaration that decides by location reads it. Which locations exist, and which of them a WIRE may install into, is a fact of delivery and specific to the repository; it is not a property of the solution. No reader carries a list of its own. Adding a location is one edit of the declaration and changes no reading code.

Owner: release management.
`````

## Draft of F72.md

Goes to `engineering/release-management/02-requirements/F72-consumers-read-the-declaration/F72.md`.

`````
---
id: release/F72
title: consumers-read-the-declaration
kind: functional
serves: [release/I53]
---
# release/F72 consumers-read-the-declaration

A WIRE target is one file under a wirable delivery location: a repository-relative path of safe characters (letters, digits, `.`, `_`, `-`), at least two segments, no `..`, not absolute, whose first segment is a root the declaration marks wirable. The merge-event classifier (`wireTarget` of `final-step.mjs`, release/C93) and the install judge (`wire-judge.mjs`, release/F22) decide this from the declaration and from nothing else. A path outside every wirable root, the bare root, a path with `..`, and an absolute path are not WIRE targets in either consumer.

Declared today: `.github`, `.githooks` and `.kaal`, each wirable. Adding a root to the declaration makes both consumers accept targets under it; removing one makes both refuse it, with no change of consumer code.

When the declaration cannot be read or is malformed, no path is a WIRE target: the classifier skips with the reason `no-delivery-declaration` and the judge calls the install wrong. A consumer never falls back to a list of its own.
`````

## Draft of A67.md

Goes to `engineering/release-management/03-architecture/A67-delivery-locations/A67.md`.

`````
---
id: release/A67
title: delivery-locations
addresses: [release/F72]
---
# release/A67 delivery-locations

This is the delivery architecture of KAAL for one concern, delivery locations: a declaration, `03-architecture/A67-delivery-locations/delivery-locations.json`, a list of named locations, each a root of the repository with a statement of what is delivered there and whether a WIRE may install into it (`wirable`). It is the declaration of the consumer, KAAL; another repository declares its own, with the same shape, whether or not it uses packages. It names things and places and holds no logic. The wider delivery architecture (installation, synchronization, activation, verification) is not declared here; this declaration is the first concern anchored in it, and the others join it in their own Changes.

One reader, `05-src/delivery/locations.mjs`, is the only code that knows the file's shape. `readLocations(path?)` reads and validates it (it throws on anything malformed: not JSON, no locations, a root with `/`, `..` or a leading `/`, a duplicate root, `wirable` that is not a boolean). `wirableTarget(path, locations)` answers whether a path is one file under a wirable root. The consumers import these; none spells a root.

Consumers in this slice: `wireTarget` and `decideFinal` of `05-src/promotion-raise/final-step.mjs` (`decideFinal` takes an optional reader `read`, `readLocations` by default), and `judge` of `05-src/wiring/wire-judge.mjs` (the same optional reader). Both read the declaration from the default branch, as the scripts do: a pull request cannot change what it is judged against.

Not in this slice, named so they are not forgotten: the evidence rule of Pull Promotion (`pull-promotion/declaration.json`, `evidence.do`) and Change Isolation (`engineering/change-isolation/check.mjs`, its `.github` and Core paths) carry lists of their own. They have other owners and their own Changes. This Change alters neither, and does not change that Core travels alone or that `.github` travels alone.

What the solution declares it installs stays what it is. In KAAL a package is the solution unit and its contract (`assets[].target`) says what it installs, which is solution architecture; the delivery architecture says where this repository allows delivery. A repository without packages declares the same locations the same way. Checking the one against the other is a later question.
`````

## Draft of delivery-locations.json

Goes to `engineering/release-management/03-architecture/A67-delivery-locations/delivery-locations.json`.

`````
{
  "locations": [
    { "root": ".github", "what": "the hosting platform's configuration: workflows, templates, dependabot", "wirable": true },
    { "root": ".githooks", "what": "the git hooks of a clone", "wirable": true },
    { "root": ".kaal", "what": "the deployed KAAL Engine: the Core payload and the configuration of the guards", "wirable": true }
  ]
}
`````

## Draft of locations.mjs

Goes to `engineering/release-management/05-src/delivery/locations.mjs`.

`````
// The delivery locations of KAAL, read from the declaration of the delivery architecture (release/A67). Pure but for the one file read.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DECLARATION = join(dirname(fileURLToPath(import.meta.url)), '../../03-architecture/A67-delivery-locations/delivery-locations.json');

const ROOT = /^[A-Za-z0-9_.-]+$/;

// Validates a parsed declaration and returns { roots, wirable }. Throws on anything malformed: a consumer never falls back to a list of its own.
export function parseLocations(json) {
  const list = json?.locations;
  if (!Array.isArray(list) || !list.length) throw new Error('the delivery declaration has no locations');
  const roots = [];
  const wirable = [];
  for (const l of list) {
    const r = l?.root;
    if (typeof r !== 'string' || !ROOT.test(r) || r === '.' || r === '..') throw new Error(`the delivery declaration has a malformed root: ${String(r)}`);
    if (roots.includes(r)) throw new Error(`the delivery declaration names ${r} twice`);
    if (typeof l.wirable !== 'boolean') throw new Error(`the delivery declaration does not say whether ${r} is wirable`);
    roots.push(r);
    if (l.wirable) wirable.push(r);
  }
  return { roots, wirable };
}

export function readLocations(path = DECLARATION) {
  return parseLocations(JSON.parse(readFileSync(path, 'utf8')));
}

// One file under a wirable root: safe characters, at least two segments, no `..`, not absolute.
export function wirableTarget(path, locations) {
  if (typeof path !== 'string' || !/^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)+$/.test(path)) return false;
  const parts = path.split('/');
  if (parts.includes('..') || parts.includes('.')) return false;
  return Boolean(locations?.wirable?.includes(parts[0]));
}
`````

## Draft of final-step.mjs

Goes to `engineering/release-management/05-src/promotion-raise/final-step.mjs (changed)`.

`````
// The final step of work merged into an integration branch, read from the event alone (release/C93). Pure: no network, no branch code.
import { readLocations, wirableTarget } from '../delivery/locations.mjs';
const CLASSES = [
  ['KAAL', /^kaal\/[a-z0-9-]+\/[a-z0-9-]+$/],
  ['HOTFIX', /^hotfix\/[a-z0-9-]+$/],
  ['WIRE', /^wire\/[a-z0-9-]+$/],
];
const chapters = (body) => [...String(body ?? '').matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);
// A WIRE copy is positively identified: the chapters Source, Target and Verification, and a Target that names one file under a wirable delivery location (release/A67).
export function wireTarget(body, locations) {
  const c = chapters(body);
  if (!['Source', 'Target', 'Verification'].every((n) => c.includes(n))) return null;
  const p = /^## Target[ \t]*\n+[^\n`]*`([^`\n]+)`/m.exec(String(body))?.[1];
  return p && wirableTarget(p, locations) ? p : null;
}
export function stepOf(body) {
  const c = chapters(body);
  if (c.includes('From')) return 'PLAN';
  if (c.includes('Implement')) return 'DO';
  if (c.includes('Defect')) return 'HOTFIX';
  if (['Source', 'Target', 'Verification'].every((n) => c.includes(n))) return 'WIRE';
  if (c.includes('Records') && c.length === 2 && c[0] === 'Change') return 'ACT';
  if (c.includes('Reason') && !c.includes('Records')) return 'SYNC';
  return 'unknown';
}
export function decideFinal(event, read = readLocations) {
  const { merged, base, mergeSha, body } = event ?? {};
  const skip = (reason, detail = '') => ({ action: 'skip', reason, detail });
  if (merged !== true) return skip('not-merged');
  const cls = CLASSES.find(([, re]) => re.test(String(base)));
  if (!cls) return skip('not-an-integration-branch', String(base));
  if (!/^[0-9a-f]{40}$/.test(String(mergeSha))) return skip('no-revision');
  const step = stepOf(body);
  if (step !== { KAAL: 'ACT', HOTFIX: 'HOTFIX', WIRE: 'WIRE' }[cls[0]]) return skip('not-a-final-step', `${cls[0]}: ${step}`);
  const why = `The final step of this Change merged into ${base}. This draft was raised by the Dispatcher; it is picked when the seat is free.`;
  if (cls[0] === 'WIRE') {
    let known;
    try { known = read(); } catch { return skip('no-delivery-declaration'); }
    const target = wireTarget(body, known);
    if (!target) return skip('malformed-wire', 'the Target is not one file under a wirable delivery location');
    const ids = [...new Set(String(body).split(/^## /m)[0].match(/\b[a-z0-9-]+\/C\d+\b/g) ?? [])];
    if (!ids.length) return skip('no-change-id');
    return { action: 'raise', head: base, base: 'main', revision: mergeSha, class: 'WIRE', step, title: `PROMOTION: WIRE ${target}`, body: `## Change\n\n${ids.join(', ')}: WIRE ${target}\n\n## Why now\n\n${why}\n` };
  }
  const line = /^## Change[ \t]*\n+([^\n#][^\n]*)/m.exec(String(body))?.[1]?.trim();
  if (!line) return skip('no-change-line');
  return {
    action: 'raise', head: base, base: 'main', revision: mergeSha, class: cls[0], step,
    title: `PROMOTION: ${line}`,
    body: `## Change\n\n${line}: ${step}\n\n## Why now\n\n${why}\n`,
  };
}
`````

## Draft of wire-judge.mjs

Goes to `engineering/release-management/05-src/wiring/wire-judge.mjs (changed)`.

`````
// The install judge of the WIRE operation (release/F22, A47). It judges an install; it installs nothing.
// An install is right when every changed file is a declared target under a wirable delivery location (release/A67), and each target is
//  - a copy: its source is on main and the target text equals the source text, or
//  - a move: the preimage on main has the declared sha256 and the target has exactly that content;
// and every declared target changed. Anything else, undeclared files included, is wrong.
import { readLocations, wirableTarget } from '../delivery/locations.mjs';

export function judge({ changed, pairs, onMain, baseText, hash, read = readLocations }) {
  let known;
  try { known = read(); } catch { return false; }
  const byTarget = new Map(pairs.map((p) => [p.target, p]));
  const allowed = changed.every((c) => {
    const p = byTarget.get(c.path);
    if (!p || !wirableTarget(c.path, known)) return false;
    if (p.kind === 'copy') return onMain(p.source) && c.text === p.text;
    if (p.kind === 'move') {
      const base = baseText(p.from);
      return base !== undefined && hash(base) === p.sha256 && hash(c.text) === p.sha256;
    }
    return false;
  });
  return allowed && pairs.every((p) => changed.some((c) => c.path === p.target));
}
`````
