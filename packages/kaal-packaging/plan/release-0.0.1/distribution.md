# Packaging distribution — decision PLAN (packaging/C12 amendment)

Decides one question for the Owner: does `kaal-packaging` go to npmjs, or does it stay with Engineering as a private workspace package? It changes no runtime file. It amends no identifier. It authorizes no merge, SYNC, promotion or publication.

## The Owner's test

A package goes to npmjs only if a non-KAAL target repository can benefit from it for non-KAAL work. Otherwise it stays with Engineering. The two shapes are:

1. **Engineering and external use, no package needed:** run from the repository's workspace or a packed tarball, by path.
2. **Embedding, package needed:** another package or repository installs it by name and imports or runs it.

## Who consumes Packaging today

| Consumer | How | Needs a registry package? |
| --- | --- | --- |
| Engineering's release engine | Runs `conform` (and `measure`) from outside on a packed-and-installed candidate, in this repository's CI (packaging/A3, A7; engineering/F32). `run.mjs` shows Packaging as "not run" until `kaal-packaging` is on `main`. | No. A workspace on `main` suffices. |
| Agents working in this repository | Run `node packages/kaal-packaging/bin/kaal-packaging.mjs` by path, guided by the Skill and root `AGENTS.md`. | No. |
| Other KAAL packages | None import it. packaging/A3 and A7: "no product imports Packaging". | No. |
| A non-KAAL repository, for non-KAAL work | None exists today. `conform` decides the **KAAL Package** contract, so it has no meaning outside KAAL. `measure` is ecosystem-neutral and could size any npm tarball, but it is one of two commands and shares the package with `conform`. | Only for `measure`, and only as a possibility. |

Nothing embeds Packaging. Under the Owner's test the package fails as a unit: its only demonstrated consumers are KAAL's own.

## Cost of publishing

- Packaging depends on `kaal-hosting` and `@kaihacksai/kaal-foundation`. Publishing Packaging makes Hosting's scoped publication a hard prerequisite (completion.md, dependency table).
- It adds a public surface to maintain, plus a first publication by the Owner's hand and a Trusted Publishing binding.

## Options

### Option A (recommended): stay private with Engineering

Packaging remains `private`, unscoped and a workspace package. It reaches `main` by promotion (#686, refreshed), where Engineering's release engine consumes it. If a non-KAAL consumer for `measure` appears, a separate Change can split or publish `measure` alone, on its own PLAN.

Why: it passes the Owner's test, and nothing demonstrates a consumer that needs a package. It also removes the Hosting-publication dependency from Packaging's critical path.

### Option B: publish `@kaihacksai/kaal-packaging@0.0.1` as planned in C12

Follows completion.md as written. Its value is speculative: `measure` for outside repositories, and an installable `conform` for KAAL-adjacent users.

## What changes under each option

| Step | Option A (stay private) | Option B (publish) |
| --- | --- | --- |
| C13 guidance | Unchanged. | Unchanged. |
| C14 verification | Unchanged. | Unchanged. |
| C15 scoped delivery | **Replaced** by a small compatibility Change: keep the name and `private: true`. Migrate only what Hosting's own scoping forces (self-imports, dependency pin), through the owners and Engineering's admitted route. No public metadata. | As written: set `@kaihacksai/kaal-packaging@0.0.1`, public metadata, scoped Hosting dependency, self-imports and owner-reviewed workspace/lock. |
| C16 acceptance | Source, normal pack, exact inventory, clean consumer, negatives and three-host acceptance stay. The registry-resolved final self-conformance is **open**, see below. | As written, including registry-resolved final self-conformance with real Testing functions. |
| SYNC and promotion | Unchanged: governed SYNC, then promotion to `main`. This is the end of the path. | Unchanged. |
| Step 7, npmjs | **Dropped.** No Pack-and-publish run, no Trusted Publishing, no registry acceptance. | As written: Engineering's Pack on `main`, the tested tarball published by the Owner's first-name route, and registry acceptance. |
| #686 hold | Its hold on full F7 conformance must be re-decided, see below. | Unchanged. |

## Open question that Option A raises

packaging/F7 requires every runtime dependency to install from its registry, and packaging/F15 says "being private is no exemption". Packaging's own `conform` therefore fails F7 against local tarballs until Hosting and Foundation resolve from a registry. Under Option A the Owner must choose one of:

- A1: Packaging's self-conformance is accepted with F7 stated as not applicable to a package that is never installed from a registry. This needs an explicit planned amendment to F7/F15, and it must not weaken the contract for other packages.
- A2: Packaging's self-conformance still waits for Hosting's registry publication, and only Packaging's own publication is dropped. This keeps F7 intact and keeps the Hosting dependency, but not the Packaging one.

I recommend A2 for 0.0.1, since it weakens nothing. Packaging is then promoted with its F7 acceptance recorded as pending Hosting's publication, or promoted after it.

## Not decided here

Whether a future `measure`-only package exists, Hosting's publication, Engineering's trusted migration admission, and any dependency-traceability work (#746).
