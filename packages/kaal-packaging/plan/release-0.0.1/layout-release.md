# Packaging 0.0.1 in the new layout: what it ships (packaging/C25)

PLAN only, from Kai's release order of 4 Nov (Hosting 0.0.1 as the layout pilot, then Foundation 0.0.2, Core 0.0.1, **Packaging 0.0.1**, Guard 0.0.5; Kai called Packaging 0.0.1 important). It changes no runtime file, moves no folder, publishes nothing and authorizes no merge, SYNC, promotion or publication. It supersedes the delivery part of the C12 PLAN (`distribution.md`, Option C) only where Kai decides below; until then Option C (private, run by path) stands.

## What is being planned

Packaging 0.0.1 is its own release and takes the layout of packaging/C24 (#1049) in its own Change, after Hosting has proven it. This PLAN says what the shipped `dist/` of Packaging holds, how today's files map into it, and what must be decided first.

## Mapping from today's package to the layout

| Today (`files`) | Layout (source, then shipped) |
| --- | --- |
| `bin/kaal-packaging.mjs`, `lib/*` (the `measure`, `conform` APIs and CLI) | Scripts live **inside the Skill** (BASS): source `05-src/skills/kaal-packaging/scripts/`, shipped `dist/skills/kaal-packaging/scripts/`. `exports` and `bin` in `package.json` point there; this changes paths only, and Engineering's release engine, which imports the conformance contract, is told the new path before the move. |
| `skills/kaal-packaging/SKILL.md` | `05-src/skills/kaal-packaging/SKILL.md`, with `references/` for the worked assessment, shipped under `dist/skills/kaal-packaging/` |
| Packaging's section of the root `AGENTS.md` | `05-src/AGENTS.md`, shipped as `dist/AGENTS.md` |
| `docs/intent.md`, `requirements.md`, `architecture.md` | `01-intent/`, `02-requirements/`, `03-architecture/`, shipped under `dist/docs/{intent,requirements,architecture}/` |
| `docs/testing.md`, `test/embed/`, `test/verify.*` | `04-test/package-check/`, shipped as `dist/test/package-check/` (the Embedded verifier and `verify.json` regenerated for the dist content) |
| `docs/limitations.md`, `docs/operations.md` | not placed by C24: see the first decision below |
| `capability/Packaging.md` (the Capability Node) | `kaal/Packaging.md`, shipped `dist/kaal/Packaging.md` |
| `plan/**` | `00-changes/<id>/` (never shipped) |
| `test/publisher/` | `04-test/` source Test Plan, unshipped but reachable; it is `npm test` in the source workspace |
| (new) | `kaal/hosting/`, `kaal/foundation/`, `kaal/testing/`: `README.md` and one `<command>.md` per command Packaging uses from each, where both capabilities installed means use it |
| (new) | `04-test/boundary-check/` with the Boundary Check record (C23), shipped at `dist/test/boundary-check/` |

`LICENSE`, `README.md` and `package.json` stay at the package root; `files` becomes `["dist"]`.

## Decisions (all three decided by Kai)

1. **F8 and the layout: decided (Kai A, 4 Nov).** F8, which every KAAL package must meet, named six shipped documents at `docs/*.md`, including Limitations and Operations, and the layout has no place for them. Kai chose to fold them in: **Operations goes into the README** (the discoverable entry already links it) and **Limitations becomes a README section**. Kai added that parts of them are likely already covered by Intent, Requirements and Architecture, so the move **dedupes against those instead of copying**: each Limitations item is kept only where no document already states it. F8 is amended in its own Change (a requirement change for every KAAL package, so the CPO reviews it as such), which also names the README as the package's one place for how to run it and what it does not claim. Testing moves to `dist/test/`, the other three stay under `dist/docs/`.
2. **Is Packaging 0.0.1 published to npm: decided (Kai A, 4 Nov).** It stays `private` and is released in the repository only (in the layout, promoted to `main`). npm publication needs its own later go, after the general split of the C12 PLAN. So Packaging is the one deliberate `private` folder on `main`: C22 reports it as `private`, not `unpublished`, and Engineering's ratchet counts it that way. No reversal of C12 Option C. (Kai also asked whether npm itself has a private option; that is a question for the coordinator and is not a decision here.)
3. **Scope of 0.0.1: decided (Kai B, 4 Nov).** 0.0.1 includes the registry match (C22) together with the contract as approved on the collector (C13/C14, C17 to C21 as they land), the structure check (C24) and the Boundary Check conformance (C23). It carries three conditions: (a) **the wording changes**: Operations, Limitations and architecture A14 say that only `registry-match` reads the registry, through a caller-supplied lookup, and that Packaging has no registry client (these move into the README under decision 1); (b) **one live acceptance run** against the real registry on the two controls, Foundation 0.0.1 and Guard 0.0.4, which must come out in line, kept apart from the deterministic fixture Cases; (c) **alignment with Engineering's format** (finding fields, pending record, `compareReports`) as #991 settles, before the C22 DO. Not a promotion or publish go.

## Two things to reconcile (CPO review)

1. **"`packages/` on `main` equals npmjs" against a private Packaging 0.0.1.** Kai's rule is that a package folder on `main` represents its npmjs release. A private Packaging is not expected on npmjs: C22 already reports it as `private` (and a private package that is published as a finding), so the rule and a private 0.0.1 are reconcilable by that state, not by exception. But the steady state Kai describes is every folder published or `release-pending`. So decision 2 is also the answer to this: Kai chose A: Packaging is the one deliberate `private` folder on `main`, counted in Engineering's ratchet as `private`, not as `unpublished`.
2. **"`dist/` only" must keep what a consumer runs.** Moving the scripts into the Skill changes only paths, so the move must carry: (a) the public package `exports` (`.` and `./conformance`) and the `bin` entry, rewritten to point into `dist/skills/kaal-packaging/scripts/`, with their `.d.ts` files shipped beside them; (b) the shipped checks: the Embedded verifier and `verify.json` as `dist/test/package-check/`, with the installed `npm test` still running the Embedded verification; (c) the manifest regenerated for the `dist/` content. Engineering's release engine imports the conformance contract, so the new import path is announced before the move. These become Cases in the RED set for the move: an installed Packaging resolves both exports and runs `bin`, its installed `npm test` verifies the shipped checks, and a Packaging whose `dist/` omits any of them is failed.

## What does not change

Packaging stays three-valued, ships no registration, decides no package's content, and uses Foundation for KAAL SHA-256 and Hosting for the operating-system boundary. Hard dependencies stay Foundation and Hosting at exact versions; both are public ahead of it in Kai's order, which makes F7's registry resolution possible.

## Sequencing

Hosting 0.0.1 proves the layout first (its own layout Change, after C101 to C103). Packaging's layout Change follows once #1049's RED Cases are green on Hosting's folder, and it carries its own ledger re-derive. Nothing here is built, and no promotion or publication is authorized.
