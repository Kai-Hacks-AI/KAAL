# C143 change

## PLAN

1. Adds F43 to F45, A21 and the gaps G61 and G62 (`requirements.md`, `gap.md`) and the Cases T209 to T211 and T213 (F46 to F48 and T212, T214, T215 withdrawn).
2. The Cases are RED on `main` (evidence in `assessment.md`, last section). T209 to T211 run the Guard of the checkout in a scratch repository; T213 reads the package.
3. The PLAN installs nothing, changes no behaviour and touches no hook, workflow or ruleset.

## Not in this Change (named so they are not lost)

| Next Change | What | Waits on |
| --- | --- | --- |
| Move the 48 foreign Cases | the audited move plan, one group per receiver | Hosting, Packaging and Core receivers |
| Foundation dependency (C140) and C141 | in `main` history, DO waits for Foundation 0.0.2 on the registry | Foundation |
| Deploy into `.kaal/` | Guard's lifecycle installs its assets under `.kaal/`; the hook and workflow stay Guard-managed surfaces | this Change, the githooks split #1639 |
| Use from `.kaal/` | hook and CI call the deployed Guard, not the package source; the `.kaal/` root `kaal-guard.json` is added; ACT unwires finished Change cases | deployment |
| Strictness by place | one Guard, stricter on `main` than on a hotfix or collector (Promotion > Integration > Development) | CPO classification, this Change |

## DO

Not authorized. On the CPO's approval: build F43 to F45 in `lib/` with the Case ids unchanged, bring the package to the standard (T213), regenerate `test/verify.json`, rename the Cases to `.test.mjs` when green. The release is the next Guard version; see `assessment.md`.

## ACT

A 4L retrospective in `act.md`.

## T30 no longer needs amending

The earlier design installed registrations under `.kaal/guard/registered/` and so amended guard/F1 and the boundary Case guard/T30 (F48, T215). With `kaal-guard.json` at the package root, in the Change folder and at the `.kaal/` root there is no installed copy and Guard's package names no new `.kaal` path, so T30 stands unedited. This Change's records stay in `engineering/guard/00-changes/`, where Guard's earlier Change records are.

## DO (done)

- **F43 to F45** are built in `packages/kaal-guard/lib/discovery.mjs` and `bin/kaal-guard.mjs` (`--plan`, `--full`). The RED Cases T209 to T211 run green as `requirements-discovery.test.mjs` in the package with the ids unchanged; a repository with no `kaal-guard.json` behaves exactly as before and says nothing new.
- **Docs**: F43 to F45 in `docs/requirements.md`, A21 in `docs/architecture.md`, the trace in `docs/testing.md`, a README section.
- **Parity (T213)**: `contract.json` is now `installation.kaal.json`, plus `ownership.kaal.json` and `capability/Guard.md` (the claim's id is the SHA-256 of the Node file, as Hosting's is). T213 runs as `engineering/guard/acceptance/standard.test.mjs`. **Narrowed, said plainly:** the RED Case also asked that every asset target `.kaal/` or name a surface. Guard's skill asset targets `.agents/skills/` and has no surface, and moving assets under `.kaal/` is the deployment, which the CPO named as later work, so that assertion is dropped here and stays with the deployment Change.
- `test/verify.json` is regenerated with `engineering/guard/verify-manifest.mjs` (131 delivered Cases, 128 plus T209 to T211).
- Not done, as bounded by the CPO: Guard running from its `.kaal/` copy, npmjs deployment, a version bump or publication, the unowned-file policy (still open), any wiring of hook or workflow. kaal-change alone decides when a Change retires; Guard reads only whether a file is there.
