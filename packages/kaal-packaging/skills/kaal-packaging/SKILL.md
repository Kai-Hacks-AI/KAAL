---
name: kaal-packaging
description: Measure a KAAL package artifact's delivered size, or decide the generic KAAL Package contract against a packed-and-installed candidate, and read what each finding asks of you. Use when checking whether a package is ready to release, reviewing what a package ships, comparing package sizes between versions, or resolving a failed or unknown kaal-packaging finding.
license: MIT
---

# Measuring and conforming a KAAL package

What a KAAL package is and must keep is stated by Packaging's shipped documents: `docs/requirements.md` beside this skill's package, packaging/F7–F14 and N7–N10 for the generic contract. This file tells you how to do the work. Packaging decides the generic contract and measures bytes. It decides nothing else: no size budget, no release, no gate.

## Bare: the commands, with no Skill

Run the commands by their path: `node packages/kaal-packaging/bin/kaal-packaging.mjs` in the KAAL repository, `node node_modules/kaal-packaging/bin/kaal-packaging.mjs` in a project that installed the tarball. Never run a bare `npx kaal-packaging`: the package is private, and its unscoped name is not Packaging's on any registry, so a lookup could fetch and run an unrelated package.

```
node <package>/bin/kaal-packaging.mjs measure <artifact> [--work <dir>] [--format json|text]
node <package>/bin/kaal-packaging.mjs conform <installed-dir> [--consumer <dir>] [--work <dir>] [--testing <module>] [--json]
```

Each prints what the library returns and exits 0, 1 or 2. `conform` ends on one line, `kaal-packaging-conformance {json}`, whose `causes` list every finding that is not verified. `docs/operations.md` states every option.

## Measure an artifact

1. Pack the package once, as the lane that releases it packs it. Measure that tarball, never the source directory (packaging/I1).
2. Run `node <package>/bin/kaal-packaging.mjs measure <tarball>`. Keep the JSON record if you will compare later. Where it is kept is yours to choose (packaging/F4).
3. To see where the bytes are, call `attribute` from `kaal-packaging` with the path prefixes you care about, such as `docs/` or `test/`. To see growth, `compare` two records.
4. Report sizes and deltas only. Whether a size is acceptable belongs to the product that owns the package, and whether a size gates anything belongs to Engineering (packaging/I3).

Measure only artifacts whose producer you trust (packaging/N5). If `measure` refuses, its message names the cause, such as an npm older than 11.18.0 or a report that does not add up. Fix that cause. Never edit the numbers.

## Conform a candidate

1. Pack the candidate and every runtime dependency it needs, and install them into a fresh consumer project, as a consumer would install them. Never run it against a source checkout.
2. Provide Testing's model functions, `check` and `tested`, in a module file such as `testing.mjs` that re-exports them from Testing. Packaging does not depend on Testing, so you hand them in.
3. Run `node <package>/bin/kaal-packaging.mjs conform <consumer>/node_modules/<name> --testing testing.mjs`. It runs the package's installed `npm test` once, and once more on a deliberately broken copy in a scratch directory. Without `--testing`, a package that ships a Testing model is `unknown` for packaging/F13, and the command prints a note: that run is not a complete conformance judgement. Say so when you report it. Never present it as complete.
4. Read each finding by its requirement:

| Finding | What it asks of you |
| --- | --- |
| packaging/F7 | Pin every runtime dependency to one exact version, and install it from a registry. A dependency installed from a local tarball, a path or Git fails until it is published (packaging/F19). Report such a failure as dependency-blocked, an interim result, never as acceptance. A `verified` F7 is recorded resolution, not independently verified provenance (testing/F14). |
| packaging/F8 | Ship the six documents under `docs/`, each non-empty, and link `docs/operations.md` from the README. |
| packaging/F9, packaging/F10 | The installed `npm test` must run the shipped Embedded cases against the installed copy, and end on one result line whose result matches its exit and its cases. |
| packaging/F11 | Ship `test/verify.json` with every delivered file's SHA-256 and the declared cases, and have the run name each declared case exactly once. |
| packaging/F12 | Declare `engines.node`. Restrict `os` or `cpu` only in Hosting, the one operating-system boundary (hosting/F36). |
| packaging/F13 | Ship Testing's model of the delivered cases in `test/verify.json` as `model`, and test only identifiers the shipped documents define. |
| packaging/N7 | Write only in a scratch directory you remove. The consumer's project must be unchanged. |
| packaging/N8 | Import only Node's modules, the package itself and its declared dependencies. |
| packaging/N9 | The verification must depend on the modules' behaviour. One that still passes with every module broken decides from presence. |

5. The overall result and each finding's result are Testing's (testing/F13). Report an `unknown` as unknown, with its cause. Never round it to verified, and never call a failed finding a pass because the package's own `npm test` passed: that is its specific contract, reported beside the generic one, not instead of it.

## Whose question is it

- What a package's own guarantees are, and what its own cases must assert: the delivering capability's.
- What a result, a run or evidence means: Testing's.
- Which operating systems are supported, and how a command starts on a host: Hosting's.
- When conformance runs, and whether it gates a release: Engineering's, and the Owner's.
- Whether a release is accepted, and publishing it: the Owner's.

When a finding depends on one of these, name the owner and its ID, and leave the decision with them.
