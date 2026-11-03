# Definition-only packages — N9 behaviour probe PLAN (packaging/C21)

PLAN only, requested through #930 (kaal-process 0.0.1 release acceptance) and the CPO handover of 3 Nov. It changes no runtime file, publishes nothing and authorizes no merge, SYNC, promotion or publication. `kaal-packaging` 0.0.1 stays private. It is independent of #686: the promotion scope does not change.

## Problem

`packaging/N9` ("behaviour, not presence") is judged by a probe that breaks every shipped `.mjs`, `.cjs` and `.js` file outside `test/`, rewrites the manifest digests to match, and runs the installed `npm test`. A verification that still reports `verified` decides from presence and fails N9.

A package that delivers only definitions (Nodes as data, plus documents) ships no such module. The probe then returns N9 `unknown` ("no module outside test/ to break"), and any `unknown` makes the overall result `unknown`. So `verified` is **not attainable** for a definition-only package today, and "not applicable" does not exist as a state.

Two wrong answers are excluded:

- *Ship invented code so the probe has something to break.* This games N9 and adds behaviour nobody asked for.
- *Treat "nothing to break" as `verified` or as not applicable by default.* A package could then skip N9 by declaring nothing, and a presence-only verifier would pass.

## Intent

A definition-only package reaches an honest `verified` from what it actually delivers, when its Cases decide from the installed bytes of those deliverables. A presence-only verifier on such a package still fails N9. One judgment engine, no new profile.

## Proposed Change

**C21 — behaviour-bearing files.** Generalize what the N9 probe breaks, from "shipped modules" to "behaviour-bearing files".

1. The default stays as today: every shipped module outside `test/`. No result changes for a package that ships modules.
2. A package may declare `behaviour: [paths]` in `test/verify.json`: the delivered files its Cases decide from (for a definition-only package, its Node definition files). The probe corrupts those files too (declared files are replaced by a fixed non-parsing text), rewrites the manifest digests, and runs the installed `npm test` as before.
3. The declaration is checked, not trusted. Every path must be a shipped file outside `test/`, listed in the manifest, and the list must not be empty. A bad declaration is N9 `failed` with the cause, not silently ignored.
4. With no module **and** no declaration, N9 stays `unknown`. A package cannot dodge N9 by declaring nothing.
5. The finding states that the probe shows the verification depends on those bytes, and that the adequacy of its assertions stays the owner's (as today).

## Draft identifiers (provisional, avoiding C10's reserved set and C17 to C20)

| Id | Statement |
| --- | --- |
| packaging/F29 | The N9 probe breaks the shipped modules outside `test/` and any file the package declares as behaviour-bearing in `test/verify.json`. A bad or empty declaration is failed. With neither a module nor a declaration, N9 is unknown. |
| packaging/A22 | One judgment engine and one probe. The declaration only widens the set of files the same probe corrupts. It adds no profile and no second path. |

## Test Cases (RED first, then DO)

- **T61** A data-only fixture package declaring `behaviour` whose Cases read its Node files: with the files corrupted the verifier stops reporting `verified`, so N9 is `verified` and the overall result is `verified`.
- **T62** The same fixture with a presence-only verifier (checks that the files exist and match the digests): N9 `failed`.
- **T63** A data-only fixture with no declaration: N9 `unknown`, overall `unknown`. A declaration with an empty list, or naming a file that is not shipped or lies under `test/`: N9 `failed`. A module-shipping package with no declaration: unchanged from today.

## Sequencing and ownership

- Packaging owns the generic checker, so this is Packaging's PLAN. What a definition-only package's own Cases assert (here kaal-process) stays with that package's owner.
- Order: this PLAN, then RED (T61 to T63), then DO. It needs nothing from `main`. Until it lands, a definition-only package records the `unknown` N9 openly in `docs/limitations.md`.
- Held, not proposed: any change to F7 or to N8, and any new profile.
