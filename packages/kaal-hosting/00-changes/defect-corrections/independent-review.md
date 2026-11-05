# Independent review of Hosting PR #831

Reviewed candidate: `5c28f360f985157d4d658b733c0f48323055d98b`.
Review date: 2026-11-02.
Review root: `/workspace/scratch/131ee8abc3aa/candidate831/packages/extensions/kaal-hosting`.

The parent supplied the exact 79-file Hosting snapshot and reports candidate blob verification and a successful build. This review inspected that snapshot independently. No implementation changes, GitHub comments, reviews, approvals, or other GitHub writes were made.

**Content judgment: changes required.** Two reproducible D4 defects remain in affected-case attribution. The passing frozen regressions and designated mutations do not cover these forms.

## Finding 1 — P2: a conditional selecting the registration function in its true branch omits the affected case

Location: `src/boundary-core.ts:218` (registration-call discovery, lines 218–225).

The discovery regex recognizes `it(` or `it)(`, which supports the tested alternate-branch form `condition ? ()=>{} : it`. It cannot recognize a registration function followed by the conditional colon. The following valid form therefore produces registration findings but an empty challenged set:

```js
import {it} from 'node:test';
(process.platform==='win32' ? it : ()=>{})('conditional',()=>{});
it('after',()=>{});
```

Given a temporary package with `package.json` equal to `{"name":"portable-fixture","type":"module"}` and this source at `test/sample.test.mjs`, call the real built export:

```js
await portability({
  name: 'portable-fixture',
  root,
  builtins: ['node:test']
});
```

Observed: `challenged: []`; both `process.platform` and `'win32'` findings are `kind: "registration"`, and review remains requested.
Expected: `challenged: ['conditional']`.

This violates hosting/F40's explicit conditional-expression rule and its requirement to challenge each literal test decided by a registration finding. A consumer can count this platform-dependent case as evidence because its title is omitted. Frozen T82 tests only the symmetric form with `it` in the alternate branch.

## Finding 2 — P2: the statement-range scan includes unrelated cases after an else-if chain or an ASI-terminated statement

Location: `src/boundary-core.ts:206` (statementEnd, lines 206–214; used for else at line 236).

When the alternate starts with `if`, statementEnd skips all paired parentheses/braces and keeps scanning until a semicolon. It consumes the first following registration statement as part of the branch range:

```js
import {it} from 'node:test';
const flag = true;
it('before',()=>{});
if(process.platform==='win32'){
  it('first',()=>{});
}else if(flag){
  it('otherwise-if',()=>{});
}else{
  it('otherwise',()=>{});
}
it('after',()=>{});
```

Observed via the same real portability call: `['after','first','otherwise','otherwise-if']`.
Expected: `['first','otherwise','otherwise-if']`.
The unconditional adjacent case `after` is wrongly excluded from usable evidence.

The same range error also occurs with a valid unbraced statement terminated by JavaScript automatic semicolon insertion:

```js
import {it} from 'node:test';
if(process.platform==='win32')
  it('first',()=>{})
it('after',()=>{});
```

Observed: `['after','first']`.
Expected: `['first']`.

Both probes retain registration findings and an open review request; neither relies on executing the source or on its runtime platform. Frozen T82's adjacent-case negative uses a simple braced if/else, so it does not discriminate these statement boundaries.

## Reviewed paths with no additional finding

- D1: installed duplicate declarations fail prerequisites, repeated passing executions remain ambiguous, and observed failed executions survive subsequent per-name passes. The generator independently refuses duplicate identities. Failing suite/file hook outcomes remain accounted for.
- D2: existing FIFO/socket target entries are refused before setup and are not deleted after failed creation. The controlled collaborator test drives the actual fixture module; native fact availability is separately diagnosed. No guarantee against uncooperative concurrent filesystem mutation is implied.
- D3: second allocation failure cleans its already allocated staging directory, or attaches the exact leftover path and cleanup error while preserving the original allocation error object. No displaced originals exist at that point. Existing recovery behavior was inspected rather than rewritten.
- C29: the record includes agreeing exit and string-list causes, retains the legacy cause field for failures, and preserves failed/1 versus cannot verify/2 through the existing Release judge in the tested paths.

## Independent verification

Ran:

```
node --test test/embed/allocation.test.mjs test/embed/fixture-ownership.test.mjs test/publisher/defects.test.mjs test/publisher/verify.test.mjs test/publisher/release-record.test.mjs
```

Result: **20 passed, 0 failed, 0 skipped, 0 todo**, including the positive four-loop installed fixture, duplicate/failure adversaries, allocation cleanup, controlled fixture ownership, frozen D4 fixtures, failing hooks/teardown, and C29 interoperability.

Also ran the separate temporary source fixtures above against the real built `portability` export; these are the direct evidence for the two findings. Temporary probe directories were removed.

The native delivered fixture test explicitly reported special-entry support unavailable in this sandbox. Its passing result is preservation/unavailability evidence, not native FIFO/socket acceptance. No tests were weakened or skipped, and no packed acceptance was manufactured. The parent separately reports five designated defect mutants assertion-killed; this independent run did not mutate candidate files or claim an independent mutation rerun.

This report is a content review of the supplied exact candidate. It is not GitHub Owner approval, CI completion, packed-product acceptance, merge permission, release acceptance, or publication authorization.

## Renewed review of the local D4 correction

The parent subsequently requested independent review of a local correction plus separately frozen new T90–T93 regressions, reporting remote regression commit `038fcce76e52db4770eb4d8cd58bf9a41c986ac3`. This section reviews those local bytes; it does not relabel them as the originally reviewed PR head or attest a new remote implementation head.

Finding 1's exact true-branch conditional repro is corrected. Finding 2's exact else-if and bare ASI repros are corrected. Additional read-only probes confirmed correct attribution for nested callee parentheses, nested unbraced/dangling else, and a registration expression continued by `.then` containing another registration. The added tests drive the real portability export and check exact challenged sets plus open review requests. They are meaningful regressions for the original findings, and preserve original T79–T82 inputs.

**Finding 2 remains open (P2): prefixed registration expressions still spill across an ASI boundary.** The new statementEnd path selects a registration only when `entry.start === start`. An `await`, `void`, or receiver before the recognized `test`/`it` name prevents this match and falls through to the old semicolon search. The following valid and common module source still wrongly challenges the unconditional adjacent case:

```js
import {test} from 'node:test';
if(process.platform==='win32')
  await test('first',()=>{})
test('after',()=>{});
```

Observed `challenged`: `['after','first']`. Expected: `['first']`. Both platform findings are still correctly classified `registration`. Replacing `await test` with `void it` produces the same defect.

A realistic nested subtest variation also exposes it:

```js
import {test} from 'node:test';
test('parent', async t=>{
  if(process.platform==='win32')
    await t.test('first',()=>{})
  await t.test('after',()=>{});
});
```

Observed: `['after','first','parent']`. Expected: `['first','parent']`; the parent contains the finding, while `after` is unconditional. This is the same erroneous exclusion of valid evidence as original Finding 2, not a different governance concern.

Independently ran `node --test test/publisher/attribution-branches.test.mjs test/publisher/defects.test.mjs`: **11 passed, 0 failed, 0 skipped, 0 todo**. Those passes establish the exact new cases; they do not cover prefix handling. No source files were edited or mutated. The parent reports three additional mutants assertion-killed; they were not independently rerun while the parent's full source tests were active.

Renewed content judgment: **changes still required for the remaining Finding 2 case**. This remains a review finding, with no GitHub approval, write, or merge permission.

## Review of the second local D4 correction

Reviewed local `src/boundary-core.ts` SHA-256 `d52e416a882ae2494d117b2c4d337584a28974cea2a997bffece03b91e90b890`, after the parent reported a successful build and restored mutation inputs. This is a local-byte review, not an attestation of an uploaded implementation head.

The exact original findings and subsequent await/void/member-call repros now produce their expected challenged sets. Additional independent probes confirm correct nested callee parentheses, dangling else, a `.then` continuation with no terminating semicolon, a portable negative case, and setup-only attribution. The frozen T94–T96 tests discriminate the newly handled prefixes/grouping and `.then` continuation. Independently ran the two attribution test files plus `defects.test.mjs`: **14 passed, 0 failed, 0 skipped, 0 todo**. The original frozen regression hashes still match their recorded current candidate values.

**Finding 2 remains open for other valid registration-expression continuations (P2).** The `.then` path is now bounded, but the binary continuation fallback still consumes the next statement when no explicit semicolon terminates the expression:

```js
import {test} from 'node:test';
if(process.platform==='win32')
  test('first',()=>{}) && test('continued',()=>{})
test('after',()=>{});
```

Observed through the real portability export: `['after','continued','first']`. Expected: `['continued','first']`. The independent `after` case is again wrongly challenged.

The continuation test also omits JavaScript's comma operator. With a comma starting the following line, it ends the controlled range prematurely:

```js
import {test} from 'node:test';
if(process.platform==='win32')
  test('first',()=>{})
  , test('continued',()=>{})
test('after',()=>{});
```

Observed: `['first']`. Expected: `['continued','first']`. In this valid expression statement, both registrations are controlled by the if, but the second can still be counted as evidence because it is omitted from `challenged`. Both direct probes report platform findings as `registration`; these are extent errors after recognized findings, rather than missed classification or indirect/dynamic title limitations.

Second renewed content judgment: **changes still required for Finding 2's expression continuation cases**. No source/dist mutations or GitHub writes were performed. Parent-reported mutation results and full-source acceptance remain separate evidence.

## Review of the bounded token-scanning correction

Reviewed local `src/boundary-core.ts` SHA-256 `95933c0109c1e1839fffb882190c39c80879da76c986af99edc27914ca60ddec`. The top-level token scan fixes the preceding logical/comma/literal extent failures. Independent direct probes of all preceding reported repros now match their expected challenged sets. Independently ran original defect tests and frozen T90–T99: **17 passed, 0 failed, 0 skipped, 0 todo**.

One ECMAScript continuation token remains missing: the ternary colon. Within the same Finding 2 obligation, a controlled expression can end prematurely before its false branch:

```js
import {test} from 'node:test';
if(process.platform==='win32')
  test('first',()=>{})
  ? test('yes',()=>{})
  : test('no',()=>{})
test('after',()=>{});
```

Observed: `['first','yes']`. Expected: `['first','no','yes']`. Both platform findings remain `registration`; `no` is a literal controlled registration omitted from challenged evidence. The continuation token class includes `?` but excludes `:`.

Checked the related token family together through real portability calls: tagged-template continuations, optional `.then` and computed optional member continuations, `instanceof` and `in` word operators, and separate newline unary/prefix-update statements all retain the expected controlled registrations and exclude adjacent cases. Those probes produced no additional finding. Existing indirect/dynamic registration and template-interpolation lexical limitations were not expanded into a parser requirement.

Content judgment for these local bytes: **Finding 2 remains open solely for the confirmed missing ternary colon among the reviewed repros/token family**. No candidate files were edited or mutated; no GitHub approval or acceptance judgment is implied.

## Narrow colon correction: initial recheck and excluded overlapping test run

The local colon correction has `src/boundary-core.ts` SHA-256 `383451ab213ac88bf85405e523fe33986fd7809679175fe506cb04284b675cc9`. Direct read-only rechecks of **21 fixtures** all matched their expected challenged sets: every actual reported repro, symmetric conditional selection, nested/dangling else, awaited/member/grouped registrations, member/logical/comma/ternary continuations, terminal literals, tagged templates, optional chains, binary word operators, portable negatives, and setup-only negatives. The ternary fixture now retains `['first','no','yes']` and excludes `after`.

The concurrent combined 18-test attempt is **excluded from acceptance evidence**. It observed the duplicate-declaration fixture being verified during a transient disabled duplicate guard. The parent confirmed an orchestration error: its final sequential command repeated designated mutations after granting a mutation-free window. This review made no mutations. Subsequent source readback showed the guard restored. The parent confirmed this is a mutation overlap rather than a product finding and will provide an explicit all-commands-complete notice before an isolated rerun. No clean combined-test result or final judgment is claimed from that attempt.

## Final isolated disposition of the local correction

After the parent explicitly confirmed that **all** of its test, build, mutation and prepack commands had completed and held the candidate unchanged, independently reran the combined D1–D4/C29 tests plus every added attribution regression:

```
node --test test/publisher/verify.test.mjs test/publisher/defects.test.mjs test/publisher/release-record.test.mjs test/embed/allocation.test.mjs test/embed/fixture-ownership.test.mjs test/publisher/attribution-branches.test.mjs test/publisher/attribution-prefixes.test.mjs test/publisher/attribution-continuations.test.mjs test/publisher/attribution-ternary.test.mjs
```

Result: **31 passed, 0 failed, 0 skipped, 0 todo**, exit 0. Separately reran **21 direct source fixtures** against the real built portability export; all expected challenged sets matched. These include every actual reported repro and adjacent-case exclusion, plus symmetric conditional selection, nested/dangling else, grouping, tagged templates, optional chains, binary word operators, portable negatives and setup-only negatives. Affected findings continue to request review. The earlier overlapping run remains excluded rather than being relabeled successful.

Final reviewed local source SHA-256:

| File | SHA-256 |
| --- | --- |
| src/boundary-core.ts | `383451ab213ac88bf85405e523fe33986fd7809679175fe506cb04284b675cc9` |
| test/verify.mjs | `162aa3b66e2096605dfd528909f337f96eb1c7eeeee05d39269576f0fadd1052` |
| test/publisher/manifest.mjs | `ce7c3a2cdc754ba46576e10582095e7ce5e8519538a2207f5f79c00f4da9c09e` |

The original delivered T80/T81 hashes and the recorded T79/T82 publisher-file hash remain unchanged. T90–T93, T94–T96 and T97–T99 hashes remain unchanged from their prior reviewed freezes; T100 is `1b7fe7f554bcad6bde8705954f64c026abfd9bf6596c799cca8b4b0d4484a94c`.

**Final content judgment: both independent D4 findings are corrected in these local bytes. No remaining actionable correctness finding was identified in the bounded D1–D4/C29 correction reviewed here.** Original findings remain valid for the original `5c28f360f985157d4d658b733c0f48323055d98b` head; this final disposition attaches to the corrected local content hashes above, with remote exact-head identity left to candidate verification.

The source audit retains its existing static scope: literal registration titles and source-visible recognized findings. Runtime-generated or indirect code, cross-file bound identifiers, and decisions reached through external runtime data remain outside the stated inspection evidence. The token scan and tested source forms do not establish complete ECMAScript/TypeScript parser coverage. Those are scope/evidence limitations; this review found no additional defect within the examined corrected forms.

The independent native fixture test still explicitly reports special-entry support unavailable in this sandbox. Parent-reported full-source socket failures and failed-closed normal prepack remain separate evidence; this report claims neither native socket acceptance nor a fresh installed packed-product acceptance. No source or dist mutation was performed by this reviewer. Parent-reported designated mutation kills are separate from the independent read-only runs.

This final local content judgment is **not** GitHub Owner approval, CI completion, merge permission, release acceptance, or npm publication authorization.

