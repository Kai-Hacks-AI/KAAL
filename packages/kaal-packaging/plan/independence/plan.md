# Package independence and lockfile strategy — PLAN (packaging/C20, provisional)

Plans how every KAAL package can be installed and operated alone, how the declaration of its dependencies expresses that, and how this repository's shared workspace list and single lockfile follow from it. It changes no runtime file, moves no lockfile and authorizes no merge, SYNC, promotion or publication. Numbers (C20, F29 to F31, A22, T61 to T63) are provisional until the DO PRs and avoid those held by C10 (#746) and by the general plan (F26 to F28, A20, A21, T55 to T60).

**Ownership.** Packaging owns the concept, because a consumer benefits from it: what a package declares so that it works alone, and how that is decided. Engineering is the executor of this repository's instance of it, the root workspace list, the shared lock and the CI lanes. Each package owner changes only their own package declarations, as ordinary Changes.

## The Owner's guide

Packages are ideally independently deployable, so a consumer can operate with one only. Having several should enrich what each can do, so that 1+1 is more than 2. Hard dependencies are avoided where possible. That is no allowance to duplicate a technical answer.

## What we observe today

- **One workspace list.** The root `package.json` lists every package by path, one line each, and the root `package-lock.json` is a single lock for all of them. Every collector edits both when it adds or renames a package.
- **That list and lock are where collectors conflict.** A trial merge of `main` into `kaal/packaging` conflicted in `AGENTS.md` and `package-lock.json` (9 Nov: that collector was since re-cut from main's tip as a fresh `kaal/packaging`, which landed in #1290, so the conflict was avoided and not solved). `package.json` merged cleanly this time, though both sides changed the same `workspaces` array and the long `test:engineering` script that names individual test files, including `packages/skills/kaal-change/test/...` paths. The root `test:engineering` line is an enumeration of other owners' files, so any package that adds a test file changes it.
- **A published package never ships the root lock.** npm ignores a lockfile in a published package. A consumer installs from the package's own `package.json` and the registry. So the shared lock affects Engineering's development and CI installs and our merge conflicts. It does not decide what a consumer gets.
- **Packages already differ in how independent they are.** Foundation has no KAAL dependency. Hosting is a hard dependency of Core, Graph, Testing, Change and Packaging. Packaging hands Testing's model functions in through its caller instead of importing Testing (packaging/N8), which is the pattern the guide asks for.

## The concept (Packaging's)

A package is **independent** when it installs and passes its own installed verification in a fresh consumer holding only that package and the packages it declares as hard dependencies from a registry. Three kinds of relationship are then kept apart:

| Kind | Declared as | Meaning |
| --- | --- | --- |
| Hard | `dependencies`, exact version | The package cannot work without it. Allowed only where no alternative exists, such as one owner of a technical answer (Foundation's SHA-256). Each needs a recorded reason. |
| Enrichment | optional `peerDependencies`, found at run time | The package works alone and does more with the other present (1+1>2). Feature detection and a documented interface decide it. The package never fails because the peer is absent. |
| Handed in | A parameter or option the caller supplies | Neither installed nor imported by the package. Used where the owner of the answer should not become a dependency (Testing's model functions). |

One technical answer has one owner. A package that would duplicate it chooses a hard dependency, an enrichment peer or a handed-in function. Copying the owner's code is the one thing the guide rules out.

Draft Requirements, to be finalized in the DO:

- **F29** A package states its relationships by these kinds. Every hard dependency has a recorded reason and an exact registry version (packaging/F7). Every enrichment peer is optional.
- **F30** A package is verified **alone**: installed in a fresh consumer with its hard dependencies only, and its installed verification reports a result without any enrichment peer present. A failure when only a peer is absent is a defect of the package.
- **F31** With an enrichment peer present, the package reports what the peer added, and that is a Case of the package, not of the peer.

## Options for this repository's instance (Engineering executes)

The dependency declaration is decided by the concept above. These options only decide how the repository's own files follow from it.

| Option | What changes | Conflicts | Consumer independence | Risk |
| --- | --- | --- | --- | --- |
| **A. Keep one list and one lock** | Nothing | Remain on every package add and every lock change | Proved by packed-install checks already, not by the lock | The pain observed stays |
| **B. Glob the workspace list** | `workspaces` becomes `packages/*` and `packages/*/*`, one edit once | Removes the per-package line edits. The lock still conflicts | Unchanged | Low. The Change Isolation checker and `workspaces` lane must be read against a glob |
| **C. Each package carries its own lock, outside workspaces** | Remove the shared workspace list. Each package is installed on its own | None between packages | Best for developing one package alone | High: Hosting and Foundation would have to come from a registry or packed tarball, which the unpublished state does not allow yet (packaging/F7 interim) |
| **D. Staged hybrid (recommended)** | 1. Glob the list (B) and let each package declare its own repository tests, so the root `test:engineering` stops naming other owners' files. 2. Add a standing "install alone" lane: for each package, pack it and its hard dependencies, install into a scratch consumer, run the installed verification. 3. Decide the per-package lock once Hosting and Foundation are on a registry | Falls in step 1 except the lock. The lock is rewritten by `npm install`, never merged by hand | Proved per package by the lane in step 2 | Low to medium; step 3 waits on the critical path (Hosting, Foundation) |

## Recommendation (amended after CPO guidance on #924)

**Step 1 only, as the next bounded Engineering investigation.** That is: workspace globs, and root test ownership (each package declares its repository tests instead of the root `test:engineering` script naming other owners' files). It must preserve reproducibility and the Hosting, Foundation, Core release path. It is not a way to unblock dependencies: structural churn is not used as a shortcut around a dependency, and any hard-dependency reclassification needs each package owner's own evidence and Change.

The "install alone" lane (step 2) and per-package locks (step 3) stay as options in this plan. They are not recommended or approved now. They are revisited after step 1 shows what the conflicts look like, and after Hosting and Foundation are on a registry (Hosting 0.0.1 is on npm as `@kaihacksai/kaal-hosting`; Foundation 0.0.1 is too, and 0.0.2 is pending).

The staged hybrid (Option D) remains the analysis of the whole problem. Only its step 1 is proposed.

## Proposed Changes (amended)

1. **Engineering, investigation and then a Change (executor):** step 1 only. First an investigation note on how workspace globs and per-package test declarations interact with the Change Isolation checker, the `workspaces` lane and the lock, then the Change if the note supports it. Each package owner moves their own test declarations in their own Change.
2. **Packaging C20 (concept, later):** F29 to F31 and the independence check as a mode of `conform`, only after step 1 and not as part of it.
3. **Owners (later, separate):** classify their dependencies by the three kinds with evidence. Hosting's role as a hard dependency is a decision for its owner, not part of this PLAN.

## Dependencies and sequencing

- Step 1 needs nothing from a registry.
- The "install alone" lane (not proposed now) needs a pack of each package, which exists today. Packages whose hard dependencies are unpublished would be verified with packed tarballs and reported interim, as Packaging's own F7 is.
- The per-package lock (not proposed now) waits on Hosting and Foundation being on a registry. Both have a registry release now (Hosting 0.0.1, Foundation 0.0.1); what remains is the decision, not the availability.

## Open points for the Owner

- Resolved by CPO guidance: step 1 only.
- Whether Hosting should stay a hard dependency of Core, Graph, Testing, Change and Packaging, or become an enrichment or handed-in boundary for any of them.
- Whether the per-package lock should be committed at all, given that a consumer never receives it.

## Not decided here

Any package's own dependency changes, Engineering's lane design, the publish order, and the general plan's extraction decision (C17 to C19).
