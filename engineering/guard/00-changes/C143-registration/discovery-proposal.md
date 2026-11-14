# C143 proposal: Guard discovers one `guard.json` per capability and per open Change

Status: the discovery design the Owner agreed in the thread (21:24 to 21:27), for the CPO. It supersedes the earlier "option" text of this file. It is not yet in the requirements and Cases: F43, F48, T209 and T215 (the installed copy and the `.kaal/guard/registered/` path) would be reworked if the CPO accepts it. Nothing here is built or tested.

## Intended folder structure

Checked against `main` (a900273): capabilities are `packages/kaal-<name>/`; Change folders live at `packages/<package>/00-changes/C<n>-<slug>/` (kaal-change, kaal-controls, kaal-review, kaal-hosting) and, for Engineering's own, `engineering/release-management/00-changes/C<n>-<slug>/`. No `guard.json` exists on `main` today.

```
packages/
  kaal-testing/                  <- capability root
    guard.json                   <- ONE for the capability (Solution)
    lib/ test/ docs/ ...
    00-changes/
      C7-something/
        guard.json               <- ONE per open Change; removed when the Change closes
        ...Change files...
  kaal-guard/
    guard.json
engineering/
  release-management/
    00-changes/
      C26-githooks-split/
        guard.json               <- a Change's, wherever its folder lives
.github/  .githooks/  package.json   <- delivery tooling: no guard.json, hard-wired outside Guard
.kaal/                               <- install target only; Guard writes nothing new there
```

Rules: exactly one `guard.json` at a capability root and one at an open Change's root. None deeper. Delivery tooling has none and is not Guard's.

## The file

```json
{
  "checks": [
    { "id": "unit",     "run": "node --test test/unit" },
    { "id": "boundary", "run": "node test/boundary.mjs", "when": ["lib/**", "test/boundary.*"] }
  ]
}
```

- A check has an `id` and what it runs: a test glob or a script (the same command words Guard runs today, no shell features). It lists checks, not individual test files.
- `when` is an optional glob list, relative to the file, that narrows a check to changes touching those paths.
- The owner and origin are implied by where the file sits (capability root or Change folder), so no `origin`/`owner` members are needed; the Change's id is its folder's.
- A malformed file, a check without a runnable command, or a command that cannot start is `cannot judge`, naming the file and check (F44).

## Selection

1. `git diff` between base and candidate gives the changed files.
2. For each changed file, the **nearest** `guard.json` up the tree (a file in a Change folder finds the Change's, one in a package finds the capability's).
3. Run those files' checks, each narrowed by its `when` if it has one.
4. A capability whose own resolved dependency tree changed is in flight too. Engineering computes that (Owner decisions on the lockfile and root `package.json`); Guard consumes it as the plan (F45).
5. If the selection is unknown (no plan from the Engine where one is required, a diff that cannot be computed, a malformed `guard.json`), run everything, never less. Silent success is never an outcome (F45, T211).
6. The full run happens on the merge queue (Owner).

A changed file with **no** nearest `guard.json` is delivery tooling or unclaimed, which is Engineering's by the Owner's rule: it selects no Guard check. That is not "unknown"; it is the delivery system's to judge, with the merge-queue full run as backstop.

## What this changes in C143

- **Removed if accepted:** the installed copy under `.kaal/guard/registered/`, the source/install consistency check, the T30 namespace amendment (F48, T215), and the two-origin fields in the registration.
- **Kept:** Guard runs the plan it is given (F45), `--full` on the merge queue, execution integrity (F44), the Owner's shared-file rules, and Guard not policing edits.
- **Today's `.kaal/config/guard/*.md` declarations** keep working unchanged until Engineering moves its own checks out of Guard.

## Not checked or open

- How the Change's own files identify the Change is kaal-change's; with `guard.json` at the Change folder root, Guard needs only the folder.
- Cost of scanning for `guard.json`: one tracked-file listing per run, not measured.
- Check ids must be unique within a file; uniqueness across files is by path.
- The merge-queue job that invokes the full run is the wiring owner's.
