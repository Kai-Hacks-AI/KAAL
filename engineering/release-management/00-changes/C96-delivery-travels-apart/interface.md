# C96 interface

The drafts the DO takes as its files. Each is what the Cases of this PLAN need; the Cases pass on them in a throwaway copy (`evidence.md`). The PLAN itself adds none of them to the tree.

## Draft of F73.md

Goes to `engineering/release-management/02-requirements/F73-delivery-travels-apart-from-solution/F73.md`.

`````
---
id: release/F73
title: delivery-travels-apart-from-solution
kind: functional
serves: [release/I53]
---
# release/F73 delivery-travels-apart-from-solution

Delivery never travels with solution. A change that touches a delivery location, that is a path under a declared root or one of the declared files at the repository root, contains only delivery paths. Several delivery locations may share one change: a WIRE into `.github` and `.githooks` together is one change. A path outside every declared location, in KAAL `engineering/` and `packages/`, is solution, and it does not ride along with delivery. The root `package.json` and the root lockfile are delivery; `packages/<capability>/package.json` is solution.

The delivery paths are those of the declaration (release/A67) and of nothing else: `deliveryMixed` of Change Isolation (`engineering/change-isolation/check.mjs`) reads them through the one reader and spells none. Adding a location to the declaration makes a change that touches it subject to the rule, with no change of the checker. When the declaration cannot be read, the rule is not judged (`CannotJudge`), and the report says so.

The rule is detective. The checker prints one line per solution path of a mixed change, `detective (not gating): ...`, after its verdict, and gates nothing: `check`, its violations and its exit code are what they were. Core's rule that Core travels alone is unchanged and independent: a change that holds Core is reported by this rule as well, with the same lines. Making the rule preventive is a separate decision of the Owner, after the control has run for real.
`````

## Draft of F74.md

Goes to `engineering/release-management/02-requirements/F74-evidence-reads-the-declaration/F74.md`.

`````
---
id: release/F74
title: evidence-reads-the-declaration
kind: functional
serves: [release/I53]
---
# release/F74 evidence-reads-the-declaration

A path under a delivery location counts as DO evidence in Pull Promotion, and the delivery locations are those of the declaration (release/A67): every declared root and every declared root file. Pull Promotion's own declaration (`pull-promotion/declaration.json`, `evidence.do`) names its solution roots, `packages` and `engineering`, and no delivery root. `withDelivery(declaration, locations)` (`05-src/pull-promotion/delivery-evidence.mjs`) returns the declaration with the delivery patterns added: a path under a declared root that is not a PLAN path, and a declared file by its exact name. It does not change the declaration it is given. The command (`run.mjs`) composes the declaration from the two before the package judges it, so the package `kaal-release` reads no repository-specific file and stays standalone.

When the delivery declaration cannot be read the command stops, naming it, and prints no result.
`````

## Draft of the declaration

Replaces `engineering/release-management/03-architecture/A67-delivery-locations/delivery-locations.json`.

`````
{
  "locations": [
    { "root": ".github", "what": "the hosting platform's configuration: workflows, templates, dependabot", "wirable": true },
    { "root": ".githooks", "what": "the git hooks of a clone", "wirable": true },
    { "root": ".kaal", "what": "the deployed KAAL Engine: the Core payload and the configuration of the guards", "wirable": true },
    { "root": ".agents", "what": "the canonical deployment of Skills, for every agent provider", "wirable": true },
    { "root": ".claude", "what": "the deployment for the claude-code provider: Skills, settings", "wirable": true }
  ],
  "files": [
    { "path": "package.json", "what": "the root manifest of the workspace; packages/<capability>/package.json is solution", "wirable": false },
    { "path": "package-lock.json", "what": "the root lockfile; generated, judged by comparison with what the solution declares", "wirable": false }
  ]
}
`````

## Draft of the reader

Replaces `engineering/release-management/05-src/delivery/locations.mjs`. `parseLocations` returns `files` as well, and `isDelivery` is new; `readLocations` and `wirableTarget` are unchanged.

`````
// The delivery locations of KAAL, read from the declaration of the delivery architecture (release/A67). Pure but for the one file read.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DECLARATION = join(dirname(fileURLToPath(import.meta.url)), '../../03-architecture/A67-delivery-locations/delivery-locations.json');

const NAME = /^[A-Za-z0-9_.-]+$/;

// One entry of `locations` (a root) or of `files` (a file at the repository root): a safe single-segment name and a boolean `wirable`.
function entry(e, key, kind, seen) {
  const n = e?.[key];
  if (typeof n !== 'string' || !NAME.test(n) || n === '.' || n === '..') throw new Error(`the delivery declaration has a malformed ${kind}: ${String(n)}`);
  if (seen.has(n)) throw new Error(`the delivery declaration names ${n} twice`);
  seen.add(n);
  if (typeof e.wirable !== 'boolean') throw new Error(`the delivery declaration does not say whether ${n} is wirable`);
  return n;
}

// Validates a parsed declaration and returns { roots, wirable, files }. `roots` and `files` are the delivery locations (every one is delivery),
// `wirable` the roots a WIRE may install into. Throws on anything malformed: a consumer never falls back to a list of its own.
export function parseLocations(json) {
  const list = json?.locations;
  if (!Array.isArray(list) || !list.length) throw new Error('the delivery declaration has no locations');
  const named = json.files ?? [];
  if (!Array.isArray(named)) throw new Error('the delivery declaration has a malformed files list');
  const seen = new Set();
  const roots = [], wirable = [], files = [];
  for (const l of list) {
    const r = entry(l, 'root', 'root', seen);
    roots.push(r);
    if (l.wirable) wirable.push(r);
  }
  for (const f of named) files.push(entry(f, 'path', 'file', seen));
  return { roots, wirable, files };
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

// Is this repository-relative path a delivery path: under a delivery root, or one of the delivery files at the root?
export function isDelivery(path, locations) {
  const parts = String(path).split('/');
  return Boolean(locations) && (parts.length > 1 ? locations.roots.includes(parts[0]) : locations.files.includes(parts[0]));
}
`````

## Draft of delivery-evidence.mjs

Added as `engineering/release-management/05-src/pull-promotion/delivery-evidence.mjs`.

`````
// Pull Promotion's DO evidence from the delivery declaration (release/F74). Pure: the declaration it is given is not changed.
// The solution roots stay in Pull Promotion's own declaration; the delivery locations come from the declaration of the delivery architecture.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function withDelivery(declaration, locations) {
  const patterns = [];
  if (locations.roots.length) patterns.push(`^(?!.*(^|/)plan/)(${locations.roots.map(escape).join('|')})/.+`);
  if (locations.files.length) patterns.push(`^(${locations.files.map(escape).join('|')})$`);
  return { ...declaration, evidence: { ...declaration.evidence, do: [...(declaration.evidence?.do ?? []), ...patterns] } };
}
`````

## Draft change of the checker

Applies to `engineering/change-isolation/check.mjs`.

```diff
@@ -17,6 +17,7 @@
 import { spawnSync } from "node:child_process";
 import { readFileSync } from "node:fs";
 import { fileURLToPath } from "node:url";
+import { isDelivery, readLocations } from "../release-management/05-src/delivery/locations.mjs";
 
 /** Paths that are Core: the package and the Engine files deployed from its payload. */
 const CORE = [/^packages\/kaal-core\//, /^\.kaal\/(AGENTS\.md|KAAL-KERNEL\.md|core\/)/];
@@ -241,6 +242,19 @@
 }
 
 /**
+ * Delivery travels apart from solution (release/F73). A change that touches a delivery location, a declared root or a declared root file,
+ * contains only delivery paths; several delivery locations may share one change. The locations are read from the declaration of the delivery
+ * architecture. This rule is detective: the checker reports it and gates nothing, so `check` and the exit code are unchanged.
+ * @returns {string[]} one line per path that is not delivery, when the change touches delivery
+ */
+export function deliveryMixed(paths, { read = readLocations } = {}) {
+  let locations;
+  try { locations = read(); } catch (e) { throw new CannotJudge(`the delivery declaration cannot be read: ${e.message}`); }
+  if (!paths.some((p) => isDelivery(p, locations))) return [];
+  return paths.filter((p) => !isDelivery(p, locations)).map((p) => `delivery travels apart from solution: ${p} is not a delivery path`);
+}
+
+/**
  * The Git blob id of `path` at `rev`, or null when the commit resolves and the path is genuinely
  * absent from its tree. Anything else is missing or unavailable evidence and cannot be judged:
  * an unresolvable or non-commit revision, a git failure, a path that is not a file at that
@@ -322,5 +336,10 @@
   for (const v of violations) console.error(v);
   if (violations.length) process.exit(1);
   console.log(`ok: ${paths.length} changed paths conform`);
+  // Reported only when the gate itself passes, after its verdict: a refused change already says what is wrong with it.
+  try { for (const v of deliveryMixed(paths)) console.log(`detective (not gating): ${v}`); } catch (e) {
+    if (!(e instanceof CannotJudge)) throw e;
+    console.log(`detective (not gating): cannot judge: ${e.message}`);
+  }
   if (deferred && carriedEntry) console.log(`attestation deferred: ledger-entry: ${carriedEntry.id} sha256:${attestedFact.digest} (the review check judges it)`);
 }
```

## Draft change of the command

Applies to `engineering/release-management/05-src/pull-promotion/run.mjs`.

```diff
@@ -6,6 +6,8 @@
 import { readFileSync } from 'node:fs';
 import { walkCollectors } from '../../../../packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs';
 import { readFacts } from './read.mjs';
+import { withDelivery } from './delivery-evidence.mjs';
+import { readLocations } from '../delivery/locations.mjs';
 
 const PAUSE_MS = Number(process.env.PULL_PROMOTION_PAUSE_MS ?? 2000);
 const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
@@ -36,6 +38,7 @@
   if (!repoName || !declarationFile) throw new Error('could not start: expected <owner/repo> <declaration.json>');
   let declaration;
   try { declaration = JSON.parse(readFileSync(declarationFile, 'utf8')); } catch (error) { throw new Error(`could not read ${declarationFile}: ${error.message}`); }
+  try { declaration = withDelivery(declaration, readLocations()); } catch (error) { throw new Error(`could not read the delivery declaration: ${error.message}`); }
   requireCredential();
   const facts = await readFacts(repoName, declaration, get, getText, (message) => console.error(`pull Promotion: ${message}`));
   process.stdout.write(`${JSON.stringify(walkCollectors(facts, declaration), null, 2)}\n`);
```

## Draft change of Pull Promotion's declaration

Applies to `engineering/release-management/05-src/pull-promotion/declaration.json`.

```diff
@@ -86,7 +86,7 @@
       "(^|/)00-changes/[^/]+/(change|gap)\\.md$"
     ],
     "do": [
-      "^(?!.*(^|/)plan/)(packages|engineering|\\.github|\\.githooks)/.+"
+      "^(?!.*(^|/)plan/)(packages|engineering)/.+"
     ],
     "cases": {
       "files": [
```

## Draft change of T1159

Applies to `engineering/release-management/01-intent/I53-delivery-locations-declared-once/T1159.test.mjs`.

```diff
@@ -3,11 +3,11 @@
 import { text, loadSrc } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
 export const id = 'release/T1159';
 export const tests = ['release/I53'];
-export const title = 'the delivery locations are declared once, and KAAL declares .github, .githooks and .kaal as wirable';
+export const title = 'the delivery locations are declared once, and KAAL declares .agents, .claude, .github, .githooks and .kaal as wirable';
 export async function run() {
   assert.match(text('01-intent/I53-delivery-locations-declared-once/I53.md'), /^id: release\/I53$/m);
   const { readLocations } = await loadSrc('delivery/locations.mjs');
   const l = readLocations();
-  assert.deepEqual([...l.wirable].sort(), ['.github', '.githooks', '.kaal'].sort());
-  assert.deepEqual([...l.roots].sort(), ['.github', '.githooks', '.kaal'].sort());
+  assert.deepEqual([...l.wirable].sort(), ['.agents', '.claude', '.github', '.githooks', '.kaal'].sort());
+  assert.deepEqual([...l.roots].sort(), ['.agents', '.claude', '.github', '.githooks', '.kaal'].sort());
 }
```

## Draft change of T1160

Applies to `engineering/release-management/02-requirements/F72-consumers-read-the-declaration/T1160.test.mjs`.

```diff
@@ -12,7 +12,7 @@
     assert.equal(d.action, 'raise', t + ' is a WIRE target');
     assert.equal(d.title, 'PROMOTION: WIRE ' + t);
   }
-  for (const t of ['engineering/x.yml', '.agents/skills/x/SKILL.md', '.kaalx/y', '.kaal', '.github', '.kaal/../engineering/x', '/.kaal/x', '.kaal/a b', 'kaal/x']) {
+  for (const t of ['engineering/x.yml', 'agents/skills/x/SKILL.md', '.kaalx/y', '.kaal', '.github', '.kaal/../engineering/x', '/.kaal/x', '.kaal/a b', 'kaal/x']) {
     const d = decideFinal(ev({ base, body: wire(t) }));
     assert.equal(d.action, 'skip', t + ' is not a WIRE target');
     assert.equal(d.reason, 'malformed-wire', t);
```

## Draft change of T1161

Applies to `engineering/release-management/02-requirements/F72-consumers-read-the-declaration/T1161.test.mjs`.

```diff
@@ -7,5 +7,5 @@
 export async function run() {
   const { judge } = await loadSrc('wiring/wire-judge.mjs');
   for (const t of ['.github/workflows/a.yml', '.githooks/pre-push', '.kaal/config/guard/Branching.md']) assert.equal(judge(install(t)), true, t + ' is judged right');
-  for (const t of ['engineering/x.yml', '.agents/skills/x/SKILL.md', '.kaalx/y', '.kaal/../engineering/x', '/.kaal/x']) assert.equal(judge(install(t)), false, t + ' is judged wrong');
+  for (const t of ['engineering/x.yml', 'agents/skills/x/SKILL.md', '.kaalx/y', '.kaal/../engineering/x', '/.kaal/x']) assert.equal(judge(install(t)), false, t + ' is judged wrong');
 }
```

## Text edits

- `A67.md`: the declaration also names `.agents` and `.claude` (wirable) and the root files `package.json` and `package-lock.json` (`files`, not wirable); the reader also returns `files` and answers `isDelivery(path, locations)`; its consumers also include `deliveryMixed` of Change Isolation (detective) and `withDelivery` of Pull Promotion; the paragraph "Not in this slice" is replaced by what the Not-in-this-Change list of `change.md` says.
- `F72.md`: "Declared today: `.github`, `.githooks` and `.kaal`" becomes "`.github`, `.githooks`, `.kaal`, `.agents` and `.claude`, each wirable".
- `I53.md`: the example list in the Contract names the same five.
