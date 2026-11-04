# One installation check for every package (packaging/C26)

PLAN only. It changes no runtime file, publishes nothing and authorizes no merge, SYNC, promotion or publication. It records the Owner's ruling of 4 Nov ("B: installation check by kaal-package, self check by each package. Self check arguably fails if installation failed") and the Owner's choice that C26 ships inside Packaging 0.0.1, alongside C22, C23 and C24.

## The ruling, in two checks

- **Installation check (Packaging owns, one copy).** Is what is installed the package that was published, whole and unaltered, with what it needs, so that it can be checked at all?
- **Self check (each package keeps its own).** Does this package do what it says? Its delivered cases, run against the installed copy.
- **Order.** The self check is only worth anything on a sound installation. If the installation check is not `verified`, the package result is not `verified` whatever the self check printed, and the self check is reported as not run or as unsound, never as a green line next to a red one.

## What exists today

Guard, Foundation, Core and Packaging each ship their own `test/verify.mjs` (about 350, 120, 150 and 120 lines) and `test/verify.json`. Each does both jobs in its own code: read the manifest, hash every listed file, refuse extra files on an installed copy, run the declared cases through the host, and end on one `<name>-verification {json}` line with exit 0, 1 or 2. They differ in detail (Guard runs two loops, imports nothing from its own `lib/` and uses only Node built-ins), so the checking rules are copied, not shared, and they drift.

## Split of work

| Piece | Owner | Where it lives (C24 layout) |
| --- | --- | --- |
| Manifest of shipped bytes, its generator, and its integrity check | Packaging | the Skill's scripts: `dist/skills/kaal-packaging/scripts/` |
| Prerequisites (Hosting, Foundation present at the exact versions), exact registry dependencies | Packaging (F7 in `conform`, reused) | same |
| The installed-package verdict | Packaging | `kaal-packaging verify <installed dir>` |
| Self check: its Cases, its declaration of how to run them | each package | `04-test/package-check/`, shipped as `dist/test/package-check/` |
| What a Test Plan is and the result vocabulary | Testing | unchanged (verified, failed, unknown) |

## The contract

1. **Input.** One installed package folder. Never the source workspace unless the caller says so (the structure check, C24, is the source-side check).
2. **Installation check.** Two profiles, chosen from what survives packing, never from the source folders (an installed layout package holds only `dist/` and npm's fixed root files): a folder with a `dist/` directory holding `dist/test/package-check/` is in the layout; one with no `dist/` is legacy; one with a `dist/` but no `dist/test/package-check/` is `failed` as a layout package missing its Package Check, never silently judged as legacy. The steps below are written for the layout profile; the **legacy profile** differs only in two places: the manifest is `test/verify.json` and may list shipped files anywhere inside the package (not only `dist/`), and the self check is the script the package declares in its `package.json` (`test:embedded` or `test`) instead of a `dist/test/package-check/` record. Every other rule, the inventory exceptions and the combined result, is the same. Each step's result is three-valued:
   - The manifest is present, parses and lists only paths inside `dist/`, plus npm's fixed root files.
   - Every listed file is present, a regular file, with the listed SHA-256 (Foundation). No link is followed.
   - On an installed copy no file exists that the manifest does not list.
   - **The inventory is the delivered payload.** The manifest cannot carry its own digest, so it is exempt from the digest inventory (it is checked by being well formed and by the digests it holds, as the generator already does for `test/verify.json`). Package-local `node_modules/` is installed dependencies, not shipped files: it is outside the inventory and is judged separately by the prerequisites step, never by "no unlisted file". These two exceptions are the only ones.
   - The prerequisites the package declares resolve to the exact versions its `package.json` states (F7), read from the install record, never fetched.
   - A manifest that cannot be read, or a folder that cannot be listed, is `unknown`, never `failed` and never `verified` (N9). A changed or missing file is `failed`. A manifest is consistency, not provenance (testing/F14), and the finding says so.
3. **Self check.** The package declares its self check in its Package Check record (`dist/test/package-check/`): the cases and the command that runs them. Packaging runs that command through Hosting's `execute` and reads the one-line result. It does not interpret the cases.
4. **Combined result.** `verified` only when the installation check and the self check are both `verified`. If the installation check is `failed` the self check is not run and is reported as `not run: installation failed`. If it is `unknown`, the self check may run but cannot raise the result above `unknown`. The exit codes are today's: 0 verified, 1 failed, 2 unknown.
5. **Output.** The same single line `<name>-verification {json}` as today, so consumers and Engineering read it unchanged, plus the two parts (`installation`, `self`) inside the JSON.
6. **No package imports Packaging.** A package states how to run its self check; it never calls the shared verifier from its own code (packaging/A7 stands). A package's own `npm test` is its self check only.

## What changes in each package, later and on its own Change

Each package deletes its `test/verify.mjs` and keeps its cases and its manifest declaration. That is a Change in Guard, Foundation and Core, not in Packaging, and it can only happen after Packaging 0.0.1 exists. Under the release order Foundation 0.0.2 and Core 0.0.1 ship before Packaging 0.0.1, so they ship with their own `verify.mjs` still in place and drop it in the release that follows. Guard 0.0.5 follows Packaging and can adopt it in that release. Packaging 0.0.1 replaces its own `verify.mjs` with the shared check at once.

## Identifiers (provisional, reserved)

| Id | Statement |
| --- | --- |
| packaging/F46 | Packaging provides one installation check for an installed package: manifest present and well formed, every listed file present with its SHA-256, no unlisted file, prerequisites at their exact versions. |
| packaging/F47 | The installation check is three-valued; an unreadable manifest or folder is unknown; the manifest is consistency, not provenance. |
| packaging/F48 | A package declares its own self check in its Package Check record; Packaging runs it through Hosting and reads one result line; it interprets no case. |
| packaging/F49 | The package result is `verified` only when both are `verified`; a failed installation means the self check is not run and is reported so; an unknown installation caps the result at unknown. |
| packaging/F50 | The output keeps the existing one-line `<name>-verification {json}` form and exit codes, adding the two parts. |
| packaging/F51 | The manifest generator and its integrity check live in the Packaging Skill; no per-package copy remains once a package has adopted it. |
| packaging/A26 | No package imports Packaging; a package states how to run its self check and nothing more. |
| packaging/A27 | The installation check reads the install record and the installed bytes only; it never fetches. |

Test Case ids T113 to T133 are reserved (T129 to T131 added with the consumer journey, T132 and T133 with the two profiles).

## Test Cases (RED first, then DO)

Fixtures only. No network.

- **T113** A sound fixture package: installation `verified`, self check `verified`, result `verified`.
- **T114** A changed file, a removed file, an extra unlisted file and a link in an installed copy: each is `failed`, named. The manifest itself and a package-local `node_modules/` are not unlisted files (the two stated exceptions).
- **T115** An unreadable or malformed manifest, and an unlistable folder: `unknown`, never verified.
- **T116** A manifest path outside `dist/` or with `..`, an absolute path, or a backslash: refused.
- **T117** Installation `failed`: the self check is not run and is reported `not run: installation failed`; the result is `failed`.
- **T118** Installation `unknown`, self check `verified`: the result is `unknown`, not `verified`.
- **T119** Installation `verified`, self check `failed`: the result is `failed`; a self check that runs zero cases is never `verified`.
- **T120** A package that declares no self check: the result is `unknown`, naming the missing declaration.
- **T121** The output is exactly one final line `<name>-verification {json}` with the two parts and exit codes 0, 1, 2.
- **T122** A prerequisite not at its exact version, or a range: `failed` (F7 reused, not copied).
- **T123** The verifier reads no package name and judges any package the same way.
- **T124** The verifier reads the install record and installed bytes only; a run with the network refused gives the same result.
- **T125** A package that imports Packaging in its own code: a boundary finding, not a pass.
- **T129** The consumer journey on a clean fixture: a tarball whose SHA-256 differs from the release record is refused before it is installed; the matching tarball installs into a tools folder and `verify` runs against a separately installed package.
- **T130** A package's standalone self check states that the installation was not checked, and never prints a combined `verified`.
- **T132** A legacy-layout fixture (manifest `test/verify.json` listing `lib/`, `docs/` and `test/` files, a declared `test:embedded`): the legacy profile gives `verified` when sound and `failed` on a changed file, and is never judged against the `dist/`-only rules. A package in the layout is never judged by the legacy profile.
- **T133** A packed-and-installed layout fixture (made by packing a layout fixture and installing the tarball, so no `01-intent/` or other source folder exists): selected as the layout profile and verified. A `dist/` without `dist/test/package-check/` is `failed`, not legacy.
- **T131** Packaging applied to its own installed copy reports consistency, not provenance, and says so.
- **T126** The manifest generator produces the same bytes from the same files twice, and a hand-edited manifest is `failed` by the integrity check.
- **T127** Packaging's own installed copy passes the shared check (the self-application Case).
- **T128** The old per-package output still parses with the new reader, so Engineering needs no change to read results.

## The consumer journey (Packaging stays private)

Packaging 0.0.1 is repository-only (C12, decided on the C25 PLAN), so it is never fetched from the registry by name. The journey needs no registry entry for Packaging and no `npx` of a private package:

1. Engineering's release workflow packs Packaging once and records the tarball's SHA-256 in the release record (`release.json`), bound to the run and the commit, and attaches both to a GitHub Release of the public repository.
2. The consumer (or Engineering, in CI) downloads the tarball and `release.json`, compares the tarball's SHA-256 with the record, and installs it into a tools folder of its own, away from the packages it will check: `npm install ./kaal-packaging-0.0.1.tgz`. A workspace install or a Git URL with `#path:/packages/kaal-packaging` reaches the same bytes inside the repository.
3. The consumer installs the packages it uses from the registry as usual.
4. `kaal-packaging verify <path to an installed package>` prints the one result line. Nothing is imported by the package under test, and Packaging needs nothing but the installed folder.

A package published to the registry therefore does not depend on Packaging at install time, run time or test time. Only the act of verifying an installation needs the tool, and the tool is obtained from the repository, not from the package it checks.

## The independent trust root, and no self-attestation

- **What is trusted is a digest from outside Packaging.** Packaging's own installed bytes are never vouched for by Packaging. The consumer's trust root for the verifier is the release record's SHA-256 of the Packaging tarball, produced by Engineering's release engine (a different component, with the registry's own provenance for any package that is published). The consumer compares it before installing, so a changed Packaging fails before it can judge anything.
- **T127 shows consistency only.** Packaging's check applied to Packaging proves the installed copy matches its own manifest, which is consistency and not provenance (testing/F14). It is reported as that, and is never the basis of trust.
- **Bootstrap.** The first Packaging 0.0.1 is checked by Engineering's release engine against the tarball digest, not by itself. Later releases are checked by the previous accepted release of Packaging, then by the same digest comparison. This breaks the circle: the verifier of a release is a previous release plus an outside digest.
- **Limit, stated.** A manifest shipped inside the thing it describes detects an accidental or partial change, not a malicious replacement of both. Provenance of a published package is the registry's attestation, checked by Engineering's Accept step, not by this check.

## How Foundation, Core and Guard migrate, with no hard dependency on Packaging

- No package gains a dependency, peer dependency or import of Packaging (A26). Each keeps a standalone self check that `npm test` runs inside the installed package, exactly as today. That standalone run prints its own result and states that the installation was not checked by it; the combined verdict (self check fails if installation failed) comes from `kaal-packaging verify`, run from outside.
- **Foundation 0.0.2 and Core 0.0.1** release before Packaging 0.0.1 and keep their `test/verify.mjs` unchanged. They are on today's layout, so `kaal-packaging verify` judges them with the legacy profile above, not the layout profile.
- **After Packaging 0.0.1 exists** (its tarball and release record published), each package deletes only the installation half of its `verify.mjs` in its own Change, in its next release, and keeps the self check. Guard 0.0.5 follows Packaging and may do this in its own release.
- Until a package has the layout, `kaal-packaging verify` still works on it through the legacy profile: its existing manifest and its declared script are read as they are, so no manifest or declaration has to be written for it first.

## Held, not proposed

- Guard's consumer-verification semantics (guard/A18) are Testing's model (testing/C9). Whether Guard 0.0.5 keeps its two-loop run as its self check is Guard's call, on its own Change.
- Any change to F7, N8, N9 or the result vocabulary.
- Whether a later, general split makes Packaging public. Nothing here depends on it.

## Effect on the 0.0.1 scope (#1050)

#1050 (CPO-approved at `665726d`) lists C22, C23 and C24 for Packaging 0.0.1. With the Owner's choice, 0.0.1 also includes C26. #1050 itself is not changed by this PLAN; its scope line is amended in the release Change that carries the 0.0.1 layout. **For fresh CPO approval:** this PLAN; the scope line of 0.0.1 with C26 added; and the consumer journey and trust root above, which are the one design choice that is not forced by the Owner's earlier rulings: consumers obtain the verifier from the repository's release, not from the package they check (the alternative, a small verifier bundled in each package, is the copy-and-drift problem the ruling removes).

## Sequencing

This PLAN, then RED (T113 to T133), then DO, inside Packaging 0.0.1 and after the C24 structure checker (#1053), because the verifier ships from the Skill's `scripts/` in the C24 layout. Each other package adopts it in its own later Change.
