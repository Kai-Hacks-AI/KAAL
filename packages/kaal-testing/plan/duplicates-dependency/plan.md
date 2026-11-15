# Testing PLAN: focused C50/C51 dependency delivery

Owner: Testing, with Engineering review of supporting lock metadata. Delivery: `kaal/testing-duplicates`, established at main `ef78dcadf11007fb5826b41f47814299ebe8ddb9`. This is a normal focused dependency delivery, not a hotfix or the full Testing collector's promotion. The existing `kaal/testing` collector is preserved.

Authority: the Owner's D2/D2a/D2b decisions on [#787](https://github.com/Kai-Hacks-AI/KAAL/pull/787#issuecomment-6558442612) and the Priority 2 briefing. This PLAN freezes the proposed target-specific helper version for independent review before DO. It implements no duplicate API, changes no active test script, and authorizes no automatic promotion, publication or CI suppression.

## Accepted sources and exact scope

- C50 contract and six Cases: `dc9bec4ca58b6527c9aae136f86fb5a7b01094cb` (#757).
- C51 implementation, added discrimination, packed scenario and mutation runner: `79524490a219b9f622052047d891f2bd30e631b6` (#781).
- Target Foundation: existing main package `@kaihacksai/kaal-foundation@0.0.1`, public `./sha256` export.

[sources.json](sources.json) identifies all ten source files by commit, Git blob and Foundation SHA-256, with their intended dispositions. Hashes identify bytes; they do not confer authority or establish executed-file provenance. Source authority is the separately accepted Changes and Owner decision. No source collector is merged or reset.

The future DO is bounded as follows:

| Surface | Exact change allowed |
| --- | --- |
| `lib/duplicates.mjs` | Copy C51's exact bytes. Preserve F89–F92/N19, public `duplicates()` and `schedule()`, no imports, no state and no new runtime dependency. |
| `plan/duplicates/{intent,requirements,architecture,testing}.md` | Preserve C50's four historical contract documents unchanged; this new PLAN records target adaptations rather than rewriting their history. |
| `test/plan/duplicates.test.mjs` | Use this independently reviewed target helper version. All six Case assertions, names, fixtures and remaining bytes are unchanged. |
| `test/duplicates-inputs.test.mjs` | Copy C51's additional file-path/Node and independent-execution discrimination unchanged. |
| `test/acceptance/duplicates.test.mjs` | Place C51's `test/engineer/duplicates.test.mjs` here, byte-for-byte, where target main's accepted discovery reads it. Do not change the discovery implementation or migrate another scenario. |
| `test/engineer/duplicates-mutations.mjs` | Preserve C51's runner and 34 challenges. Keep this engineering-only runner outside the source suite. Generate a new target-specific receipt rather than importing historical GREEN counts. |
| Testing `package.json` | Add `./duplicates`; select the two Case files once in the existing source `test` script; declare exact Foundation development dependency `0.0.1`. Preserve existing scripts/selections, runtime dependencies, package identity/version and packed directories. |
| `test/testing.test.mjs` | Add only `lib/duplicates.mjs` to the exact delivered-file inventory. Retain every existing expected member and assertion. |
| Testing `README.md` | Add bounded public API usage and limitations, without unrelated release/verifier promises. |
| Root `package-lock.json` | Regenerate and independently reconcile only the Testing development dependency against the target manifest. No root script/workspace addition or copied collector lockfile. |
| Target evidence / Change record | Add actual target verification, mutation/acceptance results and exact source/adaptation trace under the target's accepted Change conventions. Do not invent a Change number or self-approve it. |

No timing/redesign/model/verifier features, C44 discovery migration, complete six-document release set, package rename/version bump or accumulated 111-path Testing delta travels with this dependency. No Core source/test/script changes are included.

## Explicit helper revision: D2a

The sole accepted-to-proposed Case-file differences are:

```diff
-import { createHash } from "node:crypto";
+import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
-    const sha = (p) => createHash("sha256").update(readFileSync(join(PACKAGE, p))).digest("hex");
+    const sha = (p) => sha256(readFileSync(join(PACKAGE, p)));
```

The file remains at `test/plan/duplicates.test.mjs`, so PACKAGE, path resolution and all other helpers keep their meaning. [helper-version.json](helper-version.json) records both file versions, the exact two substitutions, whole-file reverse-substitution equality and nine digest comparisons. It is an explicit PLAN revision, not a silent DO/CHECK edit. Review this version before implementation; after approval it is immutable to DO/CHECK.

Observed locally on Node v24.22.1: the historical T109 helper and Foundation return identical digests for all eight current source-suite files and the proposed Case file. The legacy helper was evaluated only as a historical reference in scratch; no new crypto implementation is delivered. Reversing just these two substitutions reproduces every original C50 Case-file byte. This is evidence for this correction, not an exhaustive retest of Foundation or proof of independent acceptance.

Foundation is a development dependency for the unshipped source test, not a runtime dependency of `duplicates`. Main already has the Foundation workspace, so this PLAN's explicit Case invocation resolves it without a manifest mutation. DO must still declare the dependency and reconcile the lock; incidental resolution is not a substitute for that declaration.

## D2b: acceptance and C38

Use the target's existing `test/acceptance/` scenario discovery. C51's scenario imports public APIs and uses the caller's once-packed bytes through `install()`; its assertions do not change when its location changes. Neither the implementation nor the target discovery code is copied from another collector.

C38's final installed `npm test` verifier/layout is separate. This dependency demonstrates public API behavior from a fresh packed installation; it does not claim installed-verifier conformance, release readiness or npm publication. When the full Testing collector later receives main, reconcile the same module, helper version, scenario placement and source selection through a reviewed synchronization; retain one implementation and one execution of each Case.

## Verification required for DO and promotion

1. Compare the transferred implementation/additional Cases/scenario and historical contracts against the pinned source bytes. List every intentional adaptation above.
2. T104–T109 GREEN on the approved helper version, all assertions unchanged, and the two additional Cases GREEN. Retain every existing target source Case and its original outcome; no skips or omission.
3. Independent behavioural RED with exports available, plus all 34 assertion-killed mutation challenges. Report the T109 valid-layout GREEN separately from its injected-duplicate RED. Missing exports, syntax errors, timeouts and unrun Cases are not behavioural kills.
4. Exact package export/file inventory and locked dependency validation, caller-packed public-interface acceptance, complete Case inventory and original failed/unknown behavior. Retain containment/unrecorded-installation unknowns.
5. Existing Linux/macOS/Windows assurance on the exact target candidate. No altered check, workflow, timeout, platform applicability or branch protection. Source/packed checks on this PLAN's parent do not establish the future dependency's three-host behavior.
6. Independent Owner review and required CI before squash integration into `kaal/testing-duplicates`. A separately authorized normal promotion to main uses squash, respects freshness and priority/order, and contains only this reviewed dependency. A needed main-to-collector synchronization uses merge commit. No publication follows.

## Present PLAN evidence and boundary

Four files are proposed: this PLAN, `sources.json`, `helper-version.json` and the revised C50 Case file. No module/export, active script, dependency, lockfile or acceptance scenario is delivered yet. Explicit Case execution discovers six Cases and all six are **blocked before behavioural assertion** because main exports no `./duplicates`; that is neither clean RED nor GREEN. Syntax and exact helper-version/digest checks pass locally. The normal target source suite remains unchanged.

The review boundary consists of these four files and their recorded source anchors. Their hashes are byte inventories, not a self-issued integrity attestation. Once accepted, DO must preserve the approved Cases and meaning-bearing helpers, add the bounded implementation above, obtain its own evidence and return for independent review before promotion.
