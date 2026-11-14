# C143 proposal: Guard discovers one `guard.json` per capability and per open Change

Status: the discovery design the Owner agreed in the thread (21:24 to 21:27), for the CPO. It supersedes the earlier "option" text of this file. It is not yet in the requirements and Cases: F43, F48, T209 and T215 (the installed copy and the `.kaal/guard/registered/` path) would be reworked if the CPO accepts it. Nothing here is built or tested.

## Which folders may hold one

**Engineering does not use Guard; its Changes do** (Owner, 21:29). A `guard.json` lives at the root of exactly two kinds of folder:

1. a **package**: `packages/kaal-<name>/` (the capability's own);
2. a **Change folder**: `<package or area>/00-changes/C<n>-<slug>/`, including those under `engineering/` such as `engineering/release-management/00-changes/C<n>-<slug>/`. It is removed when the Change closes.

An engineering area's root (`engineering/<area>/`) carries **no** `guard.json`. Neither do `.github`, `.githooks` or the root files. All work on Engineering goes through a Change, and that Change's `guard.json` carries the checks.

```
packages/
  kaal-testing/
    guard.json                   <- ONE for the capability (Solution)
    lib/ test/ docs/ ...
    00-changes/
      C7-something/
        guard.json               <- ONE per open Change; removed when it closes
engineering/
  release-management/            <- an engineering area: NO guard.json at its root
    00-changes/
      C26-githooks-split/
        guard.json               <- a Change's, under engineering
.github/  .githooks/  root files (package.json, ...)   <- no guard.json
.kaal/                                                 <- install target only
```

Rules: exactly one `guard.json` per package root and per open Change folder; none deeper. Open question for the CPO, kept from before: whether a Change carries its own file (as drawn, apart and trivially removable) or adds to its host package's file; under `engineering/` there is no host file, which favours the Change's own.

## The file (see below)



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

A changed file with **no** nearest `guard.json` (an engineering area's own code, `.github`, `.githooks`, root files) selects no Guard check. It is Engineering's: the Change that carries the edit has its own `guard.json`, selected by the Change's files in the same diff, plus the merge-queue full run. That is not "unknown". "Unknown" is reserved for a selection Guard cannot compute (a diff that cannot be computed, a malformed `guard.json`, an unreadable plan).

## What this changes in C143

- **Removed if accepted:** the installed copy under `.kaal/guard/registered/`, the source/install consistency check, the T30 namespace amendment (F48, T215), and the two-origin fields in the registration.
- **Kept:** Guard runs the plan it is given (F45), `--full` on the merge queue, execution integrity (F44), the Owner's shared-file rules, and Guard not policing edits.
- **Today's `.kaal/config/guard/*.md` declarations** keep working unchanged until Engineering moves its own checks out of Guard.

## Not checked or open

- How the Change's own files identify the Change is kaal-change's; with `guard.json` at the Change folder root, Guard needs only the folder.
- Cost of scanning for `guard.json`: one tracked-file listing per run, not measured.
- Check ids must be unique within a file; uniqueness across files is by path.
- The merge-queue job that invokes the full run is the wiring owner's.

## Boundary: Engineering's standing checks are not Guard's

Idea from the Owner (21:30): Engineering needs its own, more permanent wiring. Read here as: Engineering's standing checks are hard-wired Delivery controls, installed through `.githooks/new/pre-push.d` and the new rulesets (the structure #1639 and the wiring sources of release/C18 build), never through Guard. Guard serves only package capabilities and Changes. This is a reading of the Owner's words, not a decision; the CPO classifies each control (#1639).

## Trying a new Engineering idea (Owner, 21:31)

Through a Change, a new Engineering idea can be checked in Guard while the existing Engineering controls stay hard-wired. The new check sits in that Change's `guard.json` and runs through Guard for as long as the Change is open; the existing controls are untouched. Read here as a path for a new control to prove itself under Guard first and only then be hard-wired by the wiring owner, in line with the standing rule to test outside the danger zone first (new controls beside the old rulesets, installed later). Again a reading, not a decision; when and how a proven check is hard-wired is the wiring owner's and the CPO's.
