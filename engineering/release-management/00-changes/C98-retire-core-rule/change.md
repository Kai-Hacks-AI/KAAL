# C98 change

## PLAN

1. Add F76 and its Cases T1171 and T1172, RED, and the drafts in `interface.md`.
2. Observe both RED on `main`, and that they pass with the drafts (`evidence.md`).
3. The PLAN changes no checker, test, workflow, ruleset or setting.

## What changes (DO)

`check.mjs` loses the rule "Core travels alone", `CORE` and `CORE_SUPPORT`, its header text and the sentence of the ledger comment that names it. `.github travels alone` stays as it is. The existing tests that assert the retired rule are amended or removed (the Accept list).

## What protection remains

- `.github travels alone` stays preventive and unchanged.
- The detective rule of release/C96 (delivery travels apart from solution) reports, without gating, a change that mixes a delivery path (`.kaal`, root `package.json` and lockfile among them) with solution paths. A change of `packages/kaal-core/` alone is solution and is not reported. A change of `packages/kaal-core/` with `engineering/` paths is one of two solution places and is not reported either.
- So after this Change a change may mix Core with other solution paths and nothing gates it. That is the intent of the decision. The review of the Change and the CPO remain.

## FAR

1. **Regression.** Everything of Change Isolation that is not the Core rule stays green: `.github travels alone` (T1172), the CLI's reading of paths, the Git facts, the ledger's validation and its attestation. The Cases of release/C96 stay green.
2. **Accept list.** The Cases that assert the retired rule go red and are amended or removed by the DO, by name: in `check.test.mjs` the block "core travels alone" (its six tests), "fails .github mixed with Core under both rules" (becomes one violation), "do not bypass isolation: Core bundled with unrelated files does not conform", the CLI test that refuses `packages/kaal-core` mixed with `packages/kaal-sealing`, the two ledger tests that refuse without an entry and refuse a path the entry does not name, and engineering/T119 ("deferred without a carried entry judges by the default rules"). The ledger's validation, digest and attestation tests that do not depend on the refusal stay.
3. **Feature.** T1171 (a change mixing Core with other paths is not refused, by `check` and by the CLI) and T1172 (`.github travels alone` still holds, alone, also beside Core).

## Not in this Change

- The transition ledger, the attestation (`--attested`, `--attestation deferred`), the check "Change Isolation (review)" and the merge group admission exist to admit exceptions to the retired rule. With no rule to admit exceptions to they are dead weight. Removing them changes required checks of the old rulesets and is its own Change, after this one is on `main`.
- Making the detective delivery rule preventive: Owner's decision.
- The Core migration to the three places (`engineering/core`, the published `.kaal/core`): not urgent, Owner's go.
