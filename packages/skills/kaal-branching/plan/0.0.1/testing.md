# Branching: Testing and acceptance

This PLAN declares Cases and executable design, not test implementations or passing results. After independent PLAN approval, author the outer tests first, establish their independent behavioral RED, then implement. Approved outer assertions are immutable to DO/CHECK; an acceptance change returns to review.

Testing owns semantics and findings. Use installed `kaal-testing/acceptance` with caller-packed manifests, `install` within scenarios, public conformance interfaces and calibrated findings. Do not copy Testing's recorder or retest its algorithms.

## Three separate assurance contracts

| Contract | Subject and public result | Cannot establish |
| --- | --- | --- |
| Package | Exact delivered tarball, manifest, dependencies, public exports, Skill/scripts, declared Cases and fresh installation in the consuming environment (controller for External); byte/provenance findings | A consumer has valid trusted configuration, permissions or effective host protections |
| Configuration | Configuration bytes bound to target repository and authorized source/revision; Embed reads protected target .kaal, External uses the approved controller policy interface; schema, roles, transactions and consistent supported obligations | The actual repository currently follows policy or an integration occurred |
| Boundary | Named target/ref/PR/revision, complete observed Git/host facts, active policy/product, effective governance and actual operation result | Unknown facts, future events, unobserved race windows, exact merge API method from shape alone |

Run and report these separately. Configuration verification supports candidate-policy validation as proposed data, distinctly from active-policy authority. Boundary verification may contain passing and failing obligations; it never collapses a missing applicable fact into a pass.

## Architecture loop

Declare pure-engine dependencies (none of fs/process/network), script dependencies (public product/Hosting/Foundation as needed), Skill-contained executable paths and the consumer/enforcement delegation boundary.

| Case | Discriminating observation | Traces |
| --- | --- | --- |
| branching/T1 | Permitted shipped engine/scripts satisfy the declared boundary and invoke the sole policy engine | N1,N2; A1,A2 |
| branching/T2 | Inject filesystem/process/host access into pure semantics; conformance fails with location | N2 |
| branching/T3 | Inject undecidable dynamic access; it is recorded for validation, an unjudged item fails and cannot count as a pass | N1,N2 |
| branching/T4 | Inject a second method/role rule into a shim or workflow; mechanical inspection where possible plus independently recorded validation detects competing authority | N1,F18 |
| branching/T5 | Installed Skill conforms through Engineer Skill; removing/replacing an internal script or adding an escaping reference fails the appropriate package check | F17 |
| branching/T6 | Equivalent authorized target policy/facts via Embed and External yield identical decisions. External requires no target .kaal/package/Skill/scripts/KAAL CI; a controller's unrelated origin/config or wrong-target policy cannot substitute | F12,F16,N1 |
| branching/T7 | Privileged gate ignores malicious candidate checker/config/dependencies/holds; isolated data-only candidate read succeeds while any candidate execution is detected and fails | F18,N3 |

Architecture Case evidence names coverage and exclusions. A prose review of duplicated semantics is validation, not an executable proof.

## Capability acceptance loop — Package

All package acceptance uses a fresh tarball install outside the source tree. External installs the product and runs the harness in the controlling environment, never in the governed target. The caller packs once; scenarios install only manifest entries. No relative import from a workspace, symlink escape or mock package replacing the candidate. Run supported local acceptance on Linux, Windows and macOS.

| Case | Realistic scenario and required observation | Traces |
| --- | --- | --- |
| branching/T8 | Install declared tarballs; import public exports and invoke installed operation scripts; identity/version/files/exports/Node requirement match the approved package manifest | F17,N5,N7 |
| branching/T9 | Install Skill through Core into another supported directory/context and run it against the installed dependency; missing dependency fails clearly; internal references resolve | F17,N1 |
| branching/T10 | Enumerate declared Cases and delivered files; missing Case evidence, unexecuted required Case or missing script prevents Package pass; extra unrelated fixture/secret is rejected by manifest audit | F15,F17,N7 |
| branching/T11 | Record Foundation digest, source and artifact identities, installed bytes, dependency manifest and invocations; corrupt tarball/installed script changes verification result within the stated integrity coverage | F15,N7 |

## Capability acceptance loop — Configuration

Use the public installed validator with configuration fixtures under two genuinely different naming schemes: KAAL main/kaal/* and a consumer release/train/*/task-* scheme. The second consumer has no kaal prefix. Supply Embed policy through the protected .kaal source and External policy through an explicitly authorized controller provider. Verify target identity, policy-source identity, version/digest, approval reference and validity without a target configuration file.

| Case | Required observation | Traces |
| --- | --- | --- |
| branching/T12 | Both valid consumer configurations select their configured names/role pairs and the same semantic transaction methods; no KAAL-name dependency | F1-F3,I2 |
| branching/T13 | Missing file/version/field, duplicate JSON key, unknown property or unsupported feature is rejected explicitly without defaults | F1,N8 |
| branching/T14 | Overlapping prefixes, exact-in-prefix, multiple remainders, invalid refs and duplicate transactions are rejected; valid remainder is an unambiguous complement | F2 |
| branching/T15 | Missing role references, forbidden transaction, rebase synchronization, inconsistent freshness/lifecycle and missing required provider are invalid/unsupported | F2,F3,F19 |
| branching/T16 | Candidate weakens auto-merge/review/checks or replaces holds; active authorized policy still judges it. Embed uses protected policy revision; External rejects an unapproved or wrong-target controller policy. Proposed-policy validation never activates it | F1,F8,F18 |
| branching/T17 | Bootstrap has no authorized target-policy source: Inspect explains absence and Execute is refused. Embed activates through protected integration; External activates an independently approved controller declaration without target writes. No target .kaal is expected in External. New authority revision invalidates prior plans | F12,F18 |
| branching/T18 | Config requests stronger/different governance than observable host enforcement; missing administrative visibility or incomplete rules fails Boundary rather than claiming Configuration proves enforcement | F15,F19 |

## Capability acceptance loop — Boundary and operations

Fixtures with real local Git establish precise ancestry, parent order, trees, modes, deletions, dropped work, repeated promotions and conflict resolutions. Hosted scenarios use dedicated disposable target repositories with independently configured protections, not the KAAL production collectors. External scenarios run with no target checkout and a controller configured for an unrelated repository. The disposable target has no .kaal, KAAL package/dependency, Agent Skill, scripts or KAAL workflow/check. Its native review/protection/checks remain effective. Capture target trees, dependency/workflow inventory and actual mutations before/after; fail any attempted KAAL installation or setup write. Ordinary authorized branch/PR operations are the only allowed target mutations.

| Case | Required observation | Traces |
| --- | --- | --- |
| branching/T19 | Establish at current promoted SHA; Verify independently observes correct creation. Existing ref, changed promoted tip or creation at old tip prevents success and does not overwrite | F4,F11-F14 |
| branching/T20 | Engineer caller-supplied Change from collector through PR with squash auto-merge; inspect/prepare leave target state unchanged, submitted/pending remains pending and verified integration follows only after protected landing | F5,F8,F11 |
| branching/T21 | A substantive head carrying unincorporated promoted history fails, even if title/marker claims synchronization | F5,F6 |
| branching/T22 | Real divergent Git synchronization preserves outstanding work and explicit own resolutions, including adoption/deletion/mode checks; dropping work or unrelated edits fails | F6,N4 |
| branching/T23 | Intermediate synchronization advances admitted first-parent state and remains valid if promoted tip later moves; no-progress/off-history/head-after-merge/forged marker fails | F6 |
| branching/T24 | Promotion contains current promoted tip and yields exactly validated tree; advancing target or changing merge result fails until new synchronization/revalidation | F7,F12 |
| branching/T25 | Correct method enabled passes transaction obligation; disabled/wrong method or invalid classification fails. Same-head enabled→disabled→pending→RED evidence names event/run/check/producer/revision | F8,F12,F18 |
| branching/T26 | API returns accepted/timeout but ref or PR did not change: no success. Independent read observes wrong result, partial mutation or no permission; reconciliation precedes retry | F9,F11-F14,F20 |
| branching/T27 | Stale/wrong-repo/wrong-head evidence, absent page, truncated history, unavailable commit/tree, failed/skipped/cancelled/wrong-producer check and stale approval prevent verified integration | F12,F14,F19 |
| branching/T28 | Unauthorized Execute, protection denial or missing credential refuses mutation. An authorization token alone cannot override review/CI/host denial | F13,F19,N3 |
| branching/T29 | Landing audit requires unique PR attribution and actual topology; direct/unattributed landing fails; one-commit shape reports exact-method ambiguity | F9 |
| branching/T30 | Completed promotion makes collector deletion due; trusted evidenced hold gives held, forged hold fails; merged working ref reuse fails; new creation under same name has a new lifecycle | F4,F9,F10 |
| branching/T31 | Embed end-to-end Establish→Engineer→Synchronize→Promote→Audit through installed scripts uses real Git and a protected disposable GitHub target | F4-F16 |
| branching/T32 | From the controller's installed package, External against a target with no KAAL files/CI obtains approved target-bound policy, establishes a ref, engineers an existing target head, prepares/arms promotion and independently audits landing under native protections. Complete remote DAG/tree evidence binds target; unapproved/wrong-target/expired policy fails; controller repository facts cannot substitute; attempted target KAAL installation fails | F4,F5,F7-F16 |
| branching/T33 | External verifies a supplied valid/invalid synchronization using authorized target objects and approved controller policy, requiring no target helper/config. External synchronization-commit Execute reports unsupported and leaves target unchanged | F6,F14,F16 |
| branching/T34 | Repair guidance names detected state, required new transaction and unresolved evidence; no implicit reset, deletion, force push or policy change | F10,F20,N8 |
| branching/T35 | KAAL Embed's existing Branching job identity/producer stays required throughout trusted migration; missing package/config causes non-green, never fallback success; malicious candidate cannot select its checker. External assessment requires no new KAAL check in the target and reports observed native enforcement separately | F18,N1 |
| branching/T36 | Required jobs/review still pending: operation can be submitted/armed, never verified landed. Host denies integration until all obligations pass; failed/stale/missing evidence does not satisfy them | F8,F15,F19 |
| branching/T37 | Protected Embed policy or approved External policy-provider revision advances without candidate-head change; old authority-bound result cannot authorize new Execute and current mode-appropriate evidence is required | F12,F18 |
| branching/T38 | KAAL promotion queue is inspected including drafts and explicit Owner decisions; missing/manual evidence is reported as manual/unknown and is never described as automated FIFO enforcement | F21 |

T25 repeats #792's controlled test on the migrated checker using an unapproved probe as an interlock. Record immediately observed states and the unobserved interval separately; the prior experiment did not prove registration-race closure. Do not use a bypass or actual production merge attempt to manufacture proof.

Hosted tests requiring review use independent reviewers. Credentials are supplied to the adapter for the disposable target only. No production permissions, rulesets or review policies are weakened. If a necessary hosted capability cannot be exercised, report unknown and block the corresponding supported-operation claim/release; a passing mock cannot replace it.

## Implementation loop and independent preservation

Retain each accepted assertion in lineage.test.ts, including pure and real-Git acceptance groups, with a source-to-destination ledger. Only public-interface/import/fixture adaptation is mechanical. Where a new configuration parameter requires fixture changes, show the old KAAL configuration reproduces the old result. Preserve the accepted #779/#789 auto-merge RED cases exactly in behavior.

Add minimal discriminating implementation Cases for each approved obligation before DO. Positive control passes; independently authored negative controls fail for the expected behavioral reason. Representative mutants:

- admit a working/fork source as promotion;
- reverse contains-target-tip or drop prospective-tree equality;
- trust a marker, omit first-parent/progress proof, accept post-merge work;
- ignore tree mode or classify dropped work as adopted;
- change squash/merge selection, accept disabled auto-merge or skip readback;
- allow role overlap/unknown config/default policy/candidate authority;
- treat incomplete pagination, wrong SHA/producer or timeout as success;
- trust unrelated controller facts or unapproved/wrong-target policy in External;
- require or attempt a .kaal/package/Skill/script/KAAL CI installation in an External target;
- call a host primitive from pure semantics;
- collapse held, unsupported or pending to pass.

For each mutant name its owning Case, original source revision, unchanged test/fixture identities, candidate/mutant execution and reason for failure. Use Testing's public behavioral-preservation contract when available at the selected dependency revision; do not add a parallel preservation algorithm. RED evidence must demonstrate an assertion failure caused by missing/wrong behavior, not syntax failure, unavailable credentials or harness breakage.

Retain separate architecture, acceptance and implementation commands and ledgers. Report verified failure, potential defect, architectural concern and unknown under Testing's contracts. A skipped required scenario blocks release evidence. No numeric coverage threshold stands in for an acceptance obligation.
