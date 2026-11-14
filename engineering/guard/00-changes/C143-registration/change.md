# C143 change

## PLAN

1. Adds F43 to F48, A21 and the gaps G61 and G62 (`requirements.md`, `gap.md`) and the Cases T209 to T215.
2. The Cases are RED on `main` (evidence in `assessment.md`, last section). T209 to T211 and T214 run the Guard of the checkout in a scratch repository; T213 and T215 read the package.
3. The PLAN installs nothing, changes no behaviour and touches no hook, workflow or ruleset.

## Not in this Change (named so they are not lost)

| Next Change | What | Waits on |
| --- | --- | --- |
| Move the 48 foreign Cases | the audited move plan, one group per receiver | Hosting, Packaging and Core receivers |
| Foundation dependency (C140) and C141 | in `main` history, DO waits for Foundation 0.0.2 on the registry | Foundation |
| Deploy into `.kaal/` | Guard's lifecycle installs its assets under `.kaal/`; the hook and workflow stay Guard-managed surfaces | this Change, the githooks split #1639 |
| Use from `.kaal/` | hook and CI call the deployed Guard; registrations of Architecture and Change arrive | deployment |
| Strictness by place | one Guard, stricter on `main` than on a hotfix or collector (Promotion > Integration > Development) | CPO classification, this Change |

## DO

Not authorized. On the CPO's approval: build F43 to F48 in `lib/` with the Case ids unchanged, bring the package to the standard (T213), regenerate `test/verify.json`, rename the Cases to `.test.mjs` when green. The release is the next Guard version; see `assessment.md`.

## ACT

A 4L retrospective in `act.md`.

## Guard's namespace and T30 (decided here, not evaded)

The path `.kaal/guard/registered/` is valid: it is Guard's own installed registrations, as `config/guard` is its declarations and `state/guard` its state. Guard's enduring contract says otherwise today (guard/F1, and the boundary Case guard/T30 scanning every file of the package), so the contract is amended through this Change (guard/F48, Case T215). T30 is immutable history and is not edited; its namespace rule is superseded by a content ruling, before and after:

| | Allowed in `.kaal` by Guard's package |
| --- | --- |
| Before (T30) | `config/guard`, `state/guard` |
| After (T215, F48) | `config/guard`, `state/guard`, `guard/registered` |

The DO makes that edit and regenerates `test/verify.json` in the same Change. This Change's own records stay in `engineering/guard/00-changes/`, where Guard's earlier Change records are (`engineering/guard/change.md`); that is their home, not a way around T30, and until the amendment lands a record inside the package would, correctly, fail T30.
