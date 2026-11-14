# C143 design option: discovery by a local "I am here" file instead of an installed registry

Status: an option for the CPO, from the Owner's 21:21 proposal. Not in the requirements yet; nothing here is built or tested.

## The idea

Three categories of work, and all of Engineering's and Solution's changes go through the third: Solution (owned by its capability), Engineering (delivery tooling), and **Change** (temporary). Because a Change is temporary, Guard is the clean way to check it. Instead of installing copies into one place (`.kaal/guard/registered/`, F43), each owner puts a small file **next to what it owns**, and Guard finds it by scanning. No global registry, no installed copy, no second source of truth.

## File shape and location

Following the existing convention (`ownership.kaal.json`, `installation.kaal.json`, `evidence.kaal.json`), a file named `guard.kaal.json` at the root of the capability's package or of the Change's folder, wherever either lives:

```json
{
  "origin": "solution",
  "owner": { "kind": "capability", "name": "Testing" },
  "checks": ["guard/unit.md", "guard/boundary.md"]
}
```

- `origin` is `solution` or `change`; a Change names its id as `owner`.
- `checks` lists `Guard/Check` declarations relative to the file, in the format Guard reads today, so Guard's declaration reader is reused unchanged.
- The file claims nothing outside its own folder: a check path leaving it is cannot judge.

## How Guard discovers it

At run time Guard lists tracked files named `guard.kaal.json` in the candidate (`git ls-files` with one pathspec, deterministic and the same in the hook and CI) and reads each. The hook and workflow stay as they are. The repository's own `.kaal/config/guard/` keeps working as today. Malformed files, unreadable `checks`, or a command that cannot start are `cannot judge`, naming the file (F44, unchanged).

## Discovery from the Change's own files (Owner refinement, 21:22)

A Change's files are easy to identify even when they sit outside any folder structure, so the local setup does not need a conventional location. Guard finds `guard.kaal.json` **by name, anywhere in the tracked tree**, never by path convention. For a Change:

1. The Change's own files identify the Change; how they do so (an id they carry, as Cases do with `tests:`) is kaal-change's, not Guard's, and Guard reads only the Change id that the local setup file itself names as `owner`.
2. The Change is *in flight* when the candidate's diff touches any file that carries its id, or its local setup file. That is determined from the diff and the files alone: deterministic and the same in the hook and in CI.
3. The in-flight Change's `guard.kaal.json` gives the checks that run; the Engine may narrow or widen that via the plan (F45), and the merge queue runs everything.

This keeps "which Change is in flight" out of a registry and out of folder conventions. Open for the CPO and kaal-change: the identification of a Change's files is not specified in this repository by what I read, so this PLAN does not define it; a Case for it belongs with whoever owns that rule.

## What this removes and what it costs

- **Removes:** the installed copy and the source/install consistency check (the install step is the Engine's problem and Guard no longer has one), and probably the T30 namespace amendment (F48, T215), since nothing is written to a new `.kaal/guard/registered/` path.
- **Costs:** one scan per run, bounded by the tracked file count and by the Engine's plan; a marker file in every Change folder. Neither is measured.
- **Unchanged:** the Engine hands Guard the execution plan (F45), `--full` on the merge queue, and Guard does not decide who may register or retire.

## "Add only in a PR, remove or weaken only from main" (the Owner's earlier guard rail)

The Owner later set that Guard must not police edits to registrations (review 5906896260), so this is not a Guard rule here. With discovery by file it falls out as follows:

- **Adding:** a PR that adds a `guard.kaal.json` is checked by it in that same PR, which is the "hard-checked while in flight" intent.
- **A Change's file disappears as the Change closes:** Guard treats it as any removed registration: it simply stops being discovered. Nothing in Guard needs to know the Change ended; kaal-change decides when the folder goes. No stale entry can remain, because there is no installed copy to leave behind.
- **Removal or weakening of a Solution's file:** Guard runs what the candidate has. Whether such an edit may land is the delivery system's call, outside Guard, using the merge-queue full run as the backstop. If the CPO wants that rule back it would be a delivery control that compares the candidate to the base, not a Guard requirement.

## Open for the CPO

1. Discovery by file in place of F43's installed copy, or both?
2. File name `guard.kaal.json` and its placement at the package or Change-folder root.
3. Whether a repository-level `.kaal/config/guard/` stays the home of Engineering's own declarations or is retired as Engineering's checks move out of Guard.
