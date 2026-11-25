# C111 interface

Drafts of the files the DO adds, each equal to its file after the DO (the Cases compare them). The judge reuses `changeIdOf` and `walk` of the library of release/C112 and builds its answers with `lib/result.mjs` of release/C113, so this Change's DO follows both, and it consumes the finder and the form judgement of kaal-retro (`packages/kaal-retro`, on `main`) through the Exchange, given by path.

## Draft of I60.md

`````
---
id: release/I60
title: the ACT of a collector has the form of a retro
---
# release/I60 the ACT of a collector has the form of a retro

Contract: the ACT of a collector is a retro in the form kaal-retro defines (the 4L, in `02-learnings/retros/`), so that the retrospective it holds can be found and read the same way everywhere. A retro that reflects a Change of the collector is checked for that form before the collector is promoted. The form is kaal-retro's: release only says that a retro which is not well formed is not an ACT, and asks kaal-retro whether a retro is. Whether what a retro states is true, and what its owner decides, are nobody's to judge here. Reason: a retro that cannot be found, or read as a retro, leaves the work looking closed with nothing learned, and the controls that hold and demand the ACT would then count a file that is not a retro. Owner: release management.
`````

## Draft of F86.md

`````
---
id: release/F86
title: verify-act
kind: functional
serves: [release/I60]
---
# release/F86 verify-act

The retros of the tree are found and judged for form by kaal-retro, not here: its finder (handed `{ path, text }` files) lists the retros with the Changes each reflects and refuses what does not fit, and its judgement says `well-formed`, `malformed` with the rules broken, or `unjudged` for a format it does not know. The verdict is over the Changes the collector carries, handed in as facts, and over those answers. It says FAIL naming each retro that reflects a carried Change and is malformed, with the rules, and each file the finder refuses (`retro form`). It says UNKNOWN, which never passes, when a retro that reflects a carried Change is unjudged or has no judgement. It says PASS when every retro that reflects a carried Change is well formed, or when none does (no ACT yet: that is `demand Act`). The answer says whether the verdict applies (`applies`, release/F88): false only for the PASS where no retro reflects a carried Change, because there is then no ACT to verify; FAIL and UNKNOWN always apply. A retro of another collector is not judged again. It reads nothing of the history or the titles of the pull request, and nothing of the truth of a retro. The judge is one function; the places that ask it decide what a verdict does.
`````

## Draft of A76.md

`````
---
id: release/A76
title: judge-verify-act
addresses: [release/F86]
---
# release/A76 judge-verify-act

The component is the judge `05-src/phase/judge-verify-act.mjs`: a pure function `judgeVerifyAct({ carried, retros, refused })` over the ids of the carried Changes, the retros as kaal-retro's finder returns them each with the form judgement of kaal-retro, and what the finder refused, and a command line (`--root`, `--changes <dirs>`, `--retro <the scripts directory of the kaal-retro Skill>`) that reads the tree, hands its retros to those two scripts and exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN. The scripts are given, never found by a fixed path, and a missing one is UNKNOWN. The qualified ids of the carried Changes come from their records through `changeIdOf` of the library (release/A77), the form of kaal-retro's `reflects`. Its answers are built with `lib/result.mjs` (release/A78) and carry `applies`: false only on a PASS when no retro reflects a carried Change, true on every other PASS and on every FAIL and UNKNOWN. This is the Exchange with kaal-retro: release defines no form, and a change of the form needs no change here.

Its parent is release/A68, the ruleset of the Promoting station, once release/C105 has placed it; the DO of this Change adds `parent: release/A68` then. Where it runs (at the collector with the ACT and at the promotion), its job, its declaration on a station and the advisory hook are the next Changes.
`````

## Draft of CTL31.md

`````
---
id: release/CTL31
title: verify Act
description: It reveals a retro of a collector that is not in the form of a retro.
type: detective
status: designed
has: [release/I60]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL31 verify Act

A detective control that is meant to become preventive. A retro that reflects a Change of the collector is to be well formed, as kaal-retro judges its form, before the collector is promoted: a malformed retro, or a file that looks like a retro and that the finder of kaal-retro refuses, is revealed, so the ACT that `hold Act` and `demand Act` count is a retro. It does not say whether a retro is true, and it does not decide the form: that is kaal-retro's. It has one Intent, release/I60, which holds the details with the Requirements and Architecture under it. It rolls out detective first: (1) its verdict is observed on real retros without blocking; (2) it runs as an advisory CI check behind a feature flag and the evidence is collected; (3) only after validation and the Owner's explicit authorization is it declared on a station and loaded by the Owner, and from then on the control is preventive and its type changes in the Change that makes it so; release/CTL26 then observes that the requirement is in force. The judge only judges; once the check is required UNKNOWN does not pass.
`````

## Draft of judge-verify-act.mjs

`````
// verify Act: is every retro that reflects a Change of the collector well formed? Pure over facts: nothing is read from Git or GitHub.
// judgeVerifyAct({ carried, retros, refused }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', applies, message, malformed, unjudged }
// applies is false only on a PASS with no retro of a carried Change to verify (lib/result.mjs).
// carried: the ids of the Changes a collector carries; retros: each { path, reflects: [ids], form: { result, problems } }, the finding and the form judgement of kaal-retro;
// refused: what kaal-retro's finder refused, each { path, reason }. The form of a retro is kaal-retro's: this judge only says what its result means for the collector.
import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { changeIdOf } from './lib/collector.mjs';
import { walk } from './lib/tree.mjs';
import { pass, fail, unknown as cannotTell } from './lib/result.mjs';

const unknown = (message) => cannotTell(message, { malformed: [], unjudged: [] });

export function judgeVerifyAct(facts) {
  const { carried, retros, refused = [] } = facts && typeof facts === 'object' ? facts : {};
  if (!Array.isArray(carried) || !carried.every((id) => typeof id === 'string' && id !== '')) return unknown('the carried Changes could not be read');
  if (!Array.isArray(retros) || !retros.every((r) => r && typeof r.path === 'string' && Array.isArray(r.reflects) && r.reflects.every((s) => typeof s === 'string'))) return unknown('the retros could not be read');
  if (!Array.isArray(refused) || !refused.every((r) => r && typeof r.path === 'string')) return unknown('what the finder refused could not be read');
  const ours = retros.filter((r) => r.reflects.some((id) => carried.includes(id)));
  const rules = (r) => [...new Set((r.form?.problems ?? []).map((p) => p.rule))];
  const malformed = ours.filter((r) => r.form?.result === 'malformed');
  const unjudged = ours.filter((r) => r.form?.result !== 'well-formed' && r.form?.result !== 'malformed');
  const problems = [
    ...refused.map((x) => `${x.path} is not a retro the finder accepts${x.reason ? ` (${x.reason})` : ''}`),
    ...malformed.map((r) => `${r.path} is not well formed (${rules(r).join(', ') || 'no rule named'})`),
  ];
  if (problems.length) return fail(`retro form: ${problems.join('; ')}`, { malformed: malformed.map((r) => r.path), unjudged: unjudged.map((r) => r.path) });
  if (unjudged.length) return cannotTell(`cannot judge the form of: ${unjudged.map((r) => r.path).join(', ')}`, { malformed: [], unjudged: unjudged.map((r) => r.path) });
  return pass(ours.length ? 'every retro of the carried Changes is well formed' : 'no retro reflects a carried Change: there is no ACT to verify', { applies: ours.length > 0, malformed: [], unjudged: [] });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const root = arg('--root') ?? '.';
    const scripts = arg('--retro');
    const dirs = (arg('--changes') ?? '').split(',').filter(Boolean);
    const carried = dirs.map((d) => changeIdOf(root, d));
    if (!dirs.length || carried.some((id) => !id)) throw new Error('the carried Changes are not known');
    if (!scripts || !existsSync(join(scripts, 'find-retros.mjs')) || !existsSync(join(scripts, 'judge-retro.mjs'))) throw new Error('the scripts of kaal-retro are not given');
    const { findRetros } = await import(pathToFileURL(join(scripts, 'find-retros.mjs')).href);
    const { judgeRetro } = await import(pathToFileURL(join(scripts, 'judge-retro.mjs')).href);
    const files = walk(join(root, '02-learnings/retros')).filter((f) => f.endsWith('.md')).map((f) => ({ path: relative(root, f), text: readFileSync(f, 'utf8') }));
    const found = findRetros(files);
    const retros = found.retros.map((x) => ({ path: x.path, reflects: x.reflects, form: judgeRetro(files.find((f) => f.path === x.path).text) }));
    r = judgeVerifyAct({ carried, retros, refused: found.refused });
  } catch (e) { r = unknown(String(e.message)); }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````
