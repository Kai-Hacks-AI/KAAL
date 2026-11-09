# PLAN: shell shrinks to shims; the gate logic moves to `.mjs`

Owner rulings (9 Nov): shell needs a different review, so the list of files that must be shell is kept really small; every hook and template becomes a minimal shim that only runs `.mjs`; all logic, including fact gathering, moves to `.mjs`; the ports gate the Foundation 0.0.2 release; one Case pins each shim to its exact bytes. PLAN only: no code, no port, no release authorization.

## Intent

Today 8 shell files carry merge-gate and hook logic: five CI wrappers (`.github/scripts/bind-group.sh`, `engineering/github/{branching,branching-audit,change-isolation,promotion-source}.sh`), the pre-push judgment `engineering/github/push-check.sh`, Guard's `templates/guard.sh`, and three pre-push hooks (`.githooks/pre-push` and the two Guard templates). The rules already live in `lineage.ts` and `check.mjs`; the shell only gathers facts from `git` and `gh` and maps exit codes. Shell is reviewed differently (quoting, empty values, exit codes) and is invisible to the parsers. After this work the only shell left is the shims git itself must execute.

Use over build: no new dependency. Node's `child_process`, the repository's own `lineage.ts` and `check.mjs`, and `gh`/`git` as before.

## Requirements (provisional ids)

- **R1. Shims only.** The must-be-shell list is exactly the pre-push hook and its two Guard templates. Each is a shim whose only statement is to run its `.mjs` (`exec node …`), with no logic. A fixed-text Case holds the list.
- **R2. One Case pins each shim to its exact bytes.** The expected bytes sit in the Case; any change to a shim fails CI and goes to exact-head review. A new shell file anywhere outside the list fails the same Case.
- **R3. All logic in `.mjs`**, including fact gathering (`git`, `gh`), exit-code mapping and the message text. Each wrapper keeps its inputs (arguments and environment) and outputs (text, exit codes 0, 1, 2, 3) unchanged.
- **R4. Parity before the switch.** For each wrapper a Case runs the old shell and the new `.mjs` on the same recorded inputs (fixtures with stubbed `git` and `gh`) and requires identical exit codes and output text. The shell is removed in the same PR that switches the workflow, after the Case is green.
- **R5. Required check names do not change.** Workflow job and check names stay exactly as they are; only the step command changes (`bash x.sh` to `node x.mjs`). A Case reads the workflows and refuses a changed name.
- **R6. Fail closed.** A missing argument, a missing variable, a failed `git` or `gh` call, or an unparsable answer exits 2, never 0 and never a pass by default.
- **R7. One at a time, exact-head review.** Order (unchanged by R9): `promotion-source` (15 lines, the pilot), `branching`, `change-isolation`, `branching-audit`, `bind-group`, `push-check` with the pre-push hook and the Guard `guard.sh` and templates (these ship to consumers through `deliver.mjs`, so their delivery Case also moves). Each is its own PR with its own CPO review.
- **R9. Each port lands in its release-management component (Owner, 9 Nov, to avoid a two-step move).** The `.mjs` is delivered straight into `engineering/release-management/05-src/` (PLAN #1320), not into `engineering/github/`, so it moves once. The Guard declaration (`.kaal/config/guard/*.md`) points at the new path in the same PR; the workflow is unchanged (R5). Destinations:

  | Shell file | Control (component) | Destination |
  | --- | --- | --- |
  | `promotion-source.sh` (pilot, ported at `engineering/github/promotion-source.mjs`) | accept Capability (`main`) | `05-src/main/accept-capability/`; the `.mjs` moves there in its own small Change |
  | `branching-audit.sh` | audit Lineage (`pipeline`) | `05-src/pipeline/audit-lineage/` |
  | `change-isolation.sh` | isolate Change (`pipeline`) | `05-src/pipeline/isolate-change/` |
  | `branching.sh` | verify Ancestry, isolate Change (synchronization shape) and bind Merge (merge method), three halves | ported whole under `05-src/pipeline/verify-ancestry/` to keep R3/R4 parity, then split by control in the release-management Changes (to settle in that port's DO) |
  | `.github/scripts/bind-group.sh` | bind Merge (`main`) | `05-src/main/bind-merge/` |
  | `push-check.sh`, `guard.sh`, the pre-push hooks and templates | not release controls | stay in Engineering/Guard as R7 says |

  The shell inventory (`shell-inventory.test.mjs`) is unchanged by this: a port removes its entry from `ALLOWED` in its own PR, and its `.mjs` appears at the destination above, so the list still only shrinks and no new `.sh` path is added.
- **R8. The workflow that tests itself.** The gates run from the base branch, so a port is judged by the old gate until it merges. The first merged port is the live test; the order above puts the smallest first, and each next port starts only after the previous one has run on real pull requests.

## Testing (RED until the DOs)

Engineering Cases: R1/R2 the shim list and bytes; R3 no shell with logic remains (parsed, not pattern matched: the Case reads the `.sh` as text only to compare bytes); R4 parity per wrapper on recorded fixtures, including empty and missing inputs; R5 job and check names; R6 each failure path exits 2.

## Order

1. This PLAN.
2. The shim and byte-pin Case (R1, R2), RED first.
3. The ports in the order of R7, each a DO with parity Cases.
4. Then BEST suites, layering and the rest.
