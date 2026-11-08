# hosting/D7: successor Cases for hosting/T108 and hosting/T109

Owner ruling A of 5 November 2026: hosting/T108 is superseded by a new Case that lets a Defect record quote the unscoped export names as evidence, while shipped guidance still must not use them. This Change adds the successor Cases and changes no source, guidance or package. The old file `06-defects/unscoped-specifiers.red.mjs` stays byte for byte as it was.

## Why a path-only edit was not enough

After the layout move the shipped tree is `dist/`. The old Case reads `skills/` and `docs/` at the package root and fails with ENOENT. Pointing it at `dist/skills` and `dist/docs` would also scan the shipped D7 Defect record at `dist/docs/defects/D7-unscoped-export-specifiers.md`, which quotes `kaal-hosting/conformance`, `kaal-hosting/fixtures` and `kaal-hosting/boundary` as its evidence, so the Case would fail by meaning. The ruling changes what the Case means, so it gets new identities.

## Old and new wording side by side

| | Old (hosting/T108, hosting/T109) | New (hosting/T140 to hosting/T142) |
| --- | --- | --- |
| File | `06-defects/unscoped-specifiers.red.mjs` (blob `6e9ba6d112db6985920ae49b5323a4c76b21f9a6`) | `06-defects/unscoped-specifiers.successor.mjs` (blob `cb6db3704abc89c951cf5cf3801180af58a99743`) |
| Control | T109: the package declares exactly the subpaths boundary, conformance, fixtures | T140: the same |
| Scope of the check | every Markdown file under `skills/`, `docs/` and the README | every Markdown file under `dist/skills`, `dist/docs` and the README, except a Defect record (a Markdown file under `dist/docs/defects`) |
| Rule | T108: no shipped Markdown names an export subpath without the package scope | T141: shipped guidance other than a Defect record names none without the scope |
| Added | none | T142 control: an unscoped specifier in guidance is a finding, the scoped one is not, and the exemption covers a Defect record and nothing else |
| State | RED by design when raised; now fails with ENOENT because of its paths | passes (GREEN) at this Change |

## Run

Node 24, Linux, after `npm run build`: `node --test packages/kaal-hosting/06-defects/unscoped-specifiers.successor.mjs` gives T140, T141 and T142 passing. The old file run on the same tree fails with ENOENT on `skills/`, which is the reason for the supersession.

## What does not change

hosting/F15 holds: guidance names an export by `@kaihacksai/kaal-hosting/<subpath>`. The exemption is for a Defect record quoting the legacy name as evidence only. hosting/D7 stays answered by its original correction of HOSTS.md; T141 now guards it on the shipped tree.

## Repository scan

The first push failed hosting/T22 (no tracked file spells the legacy package as a specifier), because the new Case wrote the legacy name in strings. The Case now builds the name (`LEGACY`) and uses a neutral path segment, so no tracked file spells it. The blob id above is the corrected file. Release Cases T21 to T31, T48, T53, T54 and T75 pass with the file tracked.
