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

1. The default stays as today: every shipped module outside `test/`, broken with the same text, with the manifest digests rewritten to match. No result changes for a package that ships modules.
2. A package may declare `behaviour: [paths]` in `test/verify.json`: the delivered files its Cases decide from (for a definition-only package, its Node definition files).
3. The declaration is checked, not trusted. Every path must be a shipped file outside `test/`, listed in the manifest, and the list must not be empty. A bad declaration is N9 `failed` with the cause, not silently ignored.
4. With no module **and** no declaration, N9 stays `unknown`. A package cannot dodge N9 by declaring nothing.
5. The finding states that the probe shows the verification depends on those bytes, and that the adequacy of its assertions stays the owner's (as today).

### How the probe tells a contract assertion from a digest check (no second engine, no package wording)

The probe never reads the verifier's code or guesses its intent. It only runs the installed `npm test` against copies of the package and observes whether the result changes. For each declared file it makes **two corrupted copies**, in `work`, never in the consumer, each time with the manifest digests rewritten to match the corrupted bytes, so that a check of presence or digests alone sees nothing wrong:

- **Copy A, unreadable.** Each declared file is replaced by a fixed non-parsing text.
- **Copy B, emptied.** Each declared file is replaced by the empty document of its own format, chosen from its extension and nothing else: `{}` for `.json`, an empty file for any other extension. It parses, but states nothing.

N9 is `verified` only if **neither** copy still reports `verified`. If either still does, the verification decides from presence, digests or syntax rather than from what the files say: N9 `failed`, naming which copy it survived. This is the same single probe run on a second copy, not a second judgment engine.

What this proves and what it does not: a verifier that only checks existence or digests survives A and B and fails. A verifier that only parses the file survives B and fails. A verifier that asserts anything about the content fails on B and passes. It does not prove the assertions are adequate, and it cannot see an assertion that survives emptying by accident. Adequacy stays the owner's and is stated in the finding. The emptied copy is applied only to declared files, so packages that ship modules see no change.

## Draft identifiers (provisional, avoiding C10's reserved set and C17 to C20)

| Id | Statement |
| --- | --- |
| packaging/F29 | The N9 probe breaks the shipped modules outside `test/` and any file the package declares as behaviour-bearing in `test/verify.json`. For declared files it runs two copies, unreadable and emptied, each with manifest digests rewritten to match. A bad or empty declaration is failed. With neither a module nor a declaration, N9 is unknown. |
| packaging/A22 | One judgment engine and one probe. The declaration only widens the set of files the same probe corrupts, and the second copy only changes the text written. The probe reads no verifier code and no package-specific wording. |

## Test Cases (bounded RED first, then DO)

All use small fixture packages in the Embedded suite. No Process file is involved.

- **T61** A data-only fixture declaring `behaviour`, whose verifier asserts statements about the content of its Node files: copy A and copy B both stop reporting `verified`, N9 `verified`, overall `verified`.
- **T62a** A presence-only verifier on the same fixture (files exist): survives A and B, N9 `failed`.
- **T62b** A **digest-only** verifier (checks the files against the manifest digests, the fixture's `DIGESTS` form) with the declared bytes corrupted **and the digests adjusted**: survives A and B, N9 `failed`. This is the case the CPO asked to be explicit.
- **T62c** A **syntax-only** verifier (parses each declared file, asserts nothing about it): fails A, survives B, N9 `failed`, naming copy B.
- **T63** No declaration and no module: N9 `unknown`, overall `unknown`. An empty list, or a path that is not shipped, lies under `test/` or is missing from the manifest: N9 `failed`. A module-shipping package with no declaration: unchanged from today, and the second copy is not run.

Five RED Cases, each a fixture with one cause. The DO makes them pass without changing T24 (N9 for modules).

## Sequencing and ownership

- Packaging owns the generic checker, so this is Packaging's PLAN. What a definition-only package's own Cases assert (here kaal-process) stays with that package's owner.
- Order: this PLAN, then RED (T61 to T63), then DO. It needs nothing from `main`. Until it lands, a definition-only package records the `unknown` N9 openly in `docs/limitations.md`.
- Held, not proposed: any change to F7 or to N8, and any new profile.
