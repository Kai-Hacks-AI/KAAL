# C143 change

## PLAN

1. Adds F43 to F46, A21 and the gaps G61 and G62 (`requirements.md`, `gap.md`) and the Cases T209 to T213.
2. The Cases are RED on `main` (evidence in `assessment.md`, last section). T209 to T212 run the Guard of the checkout in a scratch repository; T213 reads the package.
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

Not authorized. On the CPO's approval: build F43 to F46 in `lib/` with the Case ids unchanged, bring the package to the standard (T213), regenerate `test/verify.json`, rename the Cases to `.test.mjs` when green. The release is the next Guard version; see `assessment.md`.

## ACT

A 4L retrospective in `act.md`.
