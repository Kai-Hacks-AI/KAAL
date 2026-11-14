# Guard: assessment toward the registering Guard

Read-only analysis of `main` at a900273, with the earlier Guard work in the repository and in `/mnt/project-files/guard`. Facts first, then what is open.

## 1. Version: the target is 0.0.5, not 0.0.4

`@kaihacksai/kaal-guard` 0.0.4 is already on the registry (versions 0.0.0-stage to 0.0.4; `latest` is 0.0.4) and `packages/kaal-guard/package.json` says 0.0.4. The earlier plan already names **0.0.5** as the next Guard, "last, at the end of the cleanup": it ships the Foundation dependency (guard/C140, PLAN merged as #1007, DO waits for Foundation 0.0.2 on the registry), the refusal of an undeclared upgrade source (guard/C141, DO merged as #1084), and only Guard's own 121 to 127 Cases. This work belongs in 0.0.5.

## 2. What Guard has today

- **Product contract:** `docs/` holds Intent (I1 to I9), Requirements, Architecture (A1 to A19), Testing (trace of ~100 Cases), Limitations (Defects D1 to D17). Complete and shipped.
- **Engine:** declarations in `.kaal/config/guard/<name>.md`, a runner (verdicts pass, fail, cannot judge, not applicable, held), a Git adapter and a GitHub adapter that name no check, a lifecycle (`init`, `upgrade`, `remove`), a Skill, and a consumer verification (`test/verify.mjs`).
- **Already true of the owner's intent:** hook and CI are wired once and follow the declarations without edits (F3, F6, T14); a trusted check is judged from the base (F7).
- **KAAL's use:** `.githooks/pre-push` runs `kaal-guard run --hook`; `.kaal/config/guard/` declares nine checks. #1639 will make `pre-push` a dispatcher over `old/` and `new/pre-push.d/`.

## 3. What is missing against the owner's intent

| Intent | Today | Gap |
| --- | --- | --- |
| Capabilities and Changes register checks | one repository-owned directory | none can register (G62, F43) |
| A Change may add checks for itself; removal comes from main | trust applies only to checks declared `trusted` | a candidate can delete or weaken any ordinary declaration; Limitations says Guard cannot protect its own list (F44) |
| Test only what is in flight, by dependency graph, full run at the gate | every check runs on every push | no selection, no `--full` (F45) |
| Delivery controls are handled outside Guard | n/a | withdrawn as a Guard requirement (Owner, 5906893250) |
| Stricter on main than on hotfix or collector | one strictness | a policy by place, open question 3 |

## 4. What is missing against the capability standard (G61)

Core and Testing carry `ownership.kaal.json`, `installation.kaal.json`, and `capability/<Name>.md`; Core also `registration`. Guard has none of the first and third, calls its contract `contract.json`, and installs only into `.githooks`, `.github` and `.agents`, nothing under `.kaal/`. Its docs are `docs/` (like Core), while Change uses `01-intent` to `03-architecture`. Which layout is the standard is open question 4. The kaal-skills integration contract (#1604) is on `kaal/skills/contract`, not yet on `main`; it is related in section 7, answer 5.

## 5. Earlier work to reuse (nothing re-done)

- `/guard/guard-test-ownership-audit.md`, `guard-test-chain-analysis.md`, `guard-test-move-plan.md`: 48 of 175 Cases move to Hosting (6), Packaging (16), Engineering (9 plus 15 External), Core (1), kaal-engineer-skill (1); 127 stay. Option A chosen by Kai: each group moves when its receiver ships; Guard 0.0.5 last.
- `release/guard-release-control-ownership.md`: Guard is conservative, Release progressive; Guard cannot protect its own list of checks (this PLAN's F44 closes that for registrations); the transition belongs to Change.
- Branches: `claude/guard-c142-do` (Windows acceptance cost, on hold), `claude/guard-c118-do`, `claude/project-thread-u242ra-guard-*` and the collectors `kaal/guard-package`, `kaal/guard-release`. These are 5 to 19 days old; I read the heads of two and did not re-run them.
- Core's registration: `packages/kaal-core/capability/Registration.md` is a Registration of scope, kinds and instances, validated by Core. A Guard registration (a check) is a different thing; see question 1.

## 6. Cases and their state on `main`

Run with Node 24 against a checkout of `main`; all are RED for the reason named.

| Case | Checks | Result on main |
| --- | --- | --- |
| guard/T209 | F43 two origins run (Engineering refused); conflation, differing copy, sourceless copy refused | RED: registered check not run |
| guard/T210 | F44 per origin: add allowed; delete, weaken, re-own refused | RED: added registration did not run |
| guard/T211 | F45 Guard runs the given plan for registrations; unknown/absent/`--full` run all | RED: `--plan` unknown option |
| guard/T212 | withdrawn with F46 (delivery controls are outside Guard) | n/a |
| guard/T213 | G61 on par with the capability standard | RED: ownership.kaal.json absent |
| guard/T214 | F47 cross-owner addition and altered ownership refused | RED: cross-owner addition not cannot judge |
| guard/T215 | F48 Guard's namespace includes `guard/registered` (amends F1 and T30) | RED: boundary Case does not allow it |

## 7. CPO direction and where it is applied

Earlier answers (review 5906850527) stand except where the re-review (5906885891) supersedes them:
1. Two origins, Solution and Change (Owner correction 5906889921: Engineering does not register with Guard); a Change's temporary registration is not a Solution one: F43, T209.
2. Selection is the Engine's. Guard consumes a resolved plan, no package.json or graph policy in Guard; unknown handled at the Engine boundary: F45, T211.
3. `--full` is an execution capability; no gate or schedule assumed; wiring has its own owner: F45.
4. Base-trusted anti-delete and anti-weaken kept for Guard's own registrations; Guard is not a Change-lifecycle governor: F44, F47. Owner clarification 5906893250: delivery controls live outside Guard, so F46 and T212 (no shadowing of hard-wired delivery checks) are withdrawn.
5. T30: the path is decided valid and the contract amended through this Change, with T30 left as history: F48, T215, `change.md`.
6. #1604 is separate from the Installation Contract (it declares a capability's mechanisms, no hook or workflow); no equivalence asserted. 0.0.5 intended, no publication authorized.
