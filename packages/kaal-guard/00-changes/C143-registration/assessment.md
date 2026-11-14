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
| Delivery controls cannot be opted out | n/a | needs a rule that a registration cannot shadow one (F46) |
| Stricter on main than on hotfix or collector | one strictness | a policy by place, open question 3 |

## 4. What is missing against the capability standard (G61)

Core and Testing carry `ownership.kaal.json`, `installation.kaal.json`, and `capability/<Name>.md`; Core also `registration`. Guard has none of the first and third, calls its contract `contract.json`, and installs only into `.githooks`, `.github` and `.agents`, nothing under `.kaal/`. Its docs are `docs/` (like Core), while Change uses `01-intent` to `03-architecture`. Which layout is the standard is open question 4. The kaal-skills integration contract (#1604, merged in `kaal/skills/contract`) was not found as `integration.kaal.json` in any package; I have not related it, see question 5.

## 5. Earlier work to reuse (nothing re-done)

- `/guard/guard-test-ownership-audit.md`, `guard-test-chain-analysis.md`, `guard-test-move-plan.md`: 48 of 175 Cases move to Hosting (6), Packaging (16), Engineering (9 plus 15 External), Core (1), kaal-engineer-skill (1); 127 stay. Option A chosen by Kai: each group moves when its receiver ships; Guard 0.0.5 last.
- `release/guard-release-control-ownership.md`: Guard is conservative, Release progressive; Guard cannot protect its own list of checks (this PLAN's F44 closes that for registrations); the transition belongs to Change.
- Branches: `claude/guard-c142-do` (Windows acceptance cost, on hold), `claude/guard-c118-do`, `claude/project-thread-u242ra-guard-*` and the collectors `kaal/guard-package`, `kaal/guard-release`. These are 5 to 19 days old; I read the heads of two and did not re-run them.
- Core's registration: `packages/kaal-core/capability/Registration.md` is a Registration of scope, kinds and instances, validated by Core. A Guard registration (a check) is a different thing; see question 1.

## 6. Cases and their state on `main`

Run with Node 24 against a checkout of `main`:

| Case | Checks | Result on main |
| --- | --- | --- |
| guard/T209 | F43 registered check runs, hook unchanged | RED: the registered check was not run |
| guard/T210 | F44 add allowed, delete or weaken refused | RED: an added registration did not run |
| guard/T211 | F45 only in flight and dependents, `--full` all | RED: the touched capability did not run |
| guard/T212 | F46 no shadowing a hard-wired check | RED: a shadowing registration was not cannot judge (exit 0) |
| guard/T213 | G61 on par with the standard | RED: ownership.kaal.json is absent |

## 7. Questions for the CPO (answer on this PR)

1. **Registration vs Core's Registration.** Is a Guard check registration a Core Registration instance (kind `check`, owned by Guard), or Guard's own declaration with a `capability` member as in T209? The Cases assume the second; the first would put admission in Core (#1638).
2. **Where registrations live.** `.kaal/guard/registered/<capability>/<name>.md` is my proposal. A capability could instead ship it in its package and Guard read the installed copy.
3. **Strictness by place.** Is it one `--place development|integration|promotion` option with a fixed table (same checks, stricter verdict handling on main), or different registrations per place? This PLAN leaves it for a later Change.
4. **Layout.** Does Guard keep `docs/` or move to `01-intent` to `03-architecture`?
5. **kaal-skills.** Does Guard's Skill need the integration contract of #1604, and does it replace or sit beside `contract.json`?
6. **Selection input.** Dependency edges: from Core's Registration traces, from package.json `dependencies`, or from the registration's `depends`? T211 uses `depends`.
7. **IDs.** I used F43 to F46, A21, G61 and G62, T209 to T213 and guard/C143 after the highest known ids; please confirm none is taken (#1639 uses G60).
8. **Version.** Confirm 0.0.5 as the release for this and the move plan.
