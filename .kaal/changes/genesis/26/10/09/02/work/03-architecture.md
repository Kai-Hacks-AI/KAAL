# Architecture

An investigation against `02-requirements.md`, read from `kaal/genesis` at 752db5e (Change `08/03`, the Engine / Record / Subject work, is merged). Nothing is built. Recommendations are mine; the Owner may overrule.

## Responsibility map

| Responsibility | Owner | Question it answers | Identity it uses | Exists today? |
|---|---|---|---|---|
| Installed capability discovery | **Core** | What does this instance hold? | Node `{name, id}` | Yes: `installedSkills()`, `installedExtensions()` |
| Source discovery | a **source adapter** | What does this source offer? | none of its own; asks Core (below) | No (the installer reads this repo's `packages/`) |
| Acquisition | a **source adapter** | How do I get the chosen capability's bytes? | the exact Node ID asked for | No |
| Installation | **Core admission**, then a **host projection** | Are the bytes admissible, and where do they land? | Node ID; placement name is separate | Yes, bound to this repo: `engineering/kaal-install` over Core's `registerSkill()` / `registerExtension()` |
| Packaging (future) | a future `kaal-packaging` Skill | Produce a distributable package of what an instance holds | asks Core; adds none | No, and not here |
| Operating mode | the instance's configuration | Where do Engine, Record and Subject live? | not an identity | Partly: Change `08/03` |

Nothing in the table is a registry. Core is the only row that says what a capability is.

## Is Core's enumeration sufficient? (question 1)

Yes for what an instance holds. `installedSkills(kaalDir)` and `installedExtensions(kaalDir)` return the admitted Nodes typed, by exact name and ID, by Core's own `Skill` or `Extension` Node, as `{name, id}`. They do not look at paths, packages or names, and they find a Node wherever its files are stored. Both are public Core calls; nothing needs adding for enumeration.

For an offer, the same calls give the same answer without Core growing, by **stage and ask**: put the offer's bytes into a throwaway copy of the KAAL through `registerSkill()` / `registerExtension()` (Core's admission decides whether it is a capability at all), then call the two calls on the copy. `engineering/kaal-install` already stages this way to decide what it projects. "Held" is then a comparison of two Core answers. The one precondition is that the tool's `kaal-core` carries the same `Skill` and `Extension` Node bytes as the instance, because registration anchors on those exact IDs; a mismatch fails at admission and the tool should say so.

## How a source describes its offers (question 2)

A source offers packages as bytes, and may attach a label for human reading. It has no authority over identity. Any `{name, id}` a source asserts is a hint: the identity that counts is the one Core returns after staging, and acquisition is refused unless it equals the ID asked for. This keeps the source a supplier of bytes, as the Owner's direction requires.

## The minimum mapping from Node identity to bytes (question 3)

Core's Nodes never name a package or location, so no Node can say where its bytes are. The smallest mechanism that can map an ID to bytes is therefore one the source supplies:

- **First realization, no index:** the source is a local directory of packages (this repository's `packages/`, a vendored folder, an unpacked archive). Offers are found by staging each package and asking Core. Fetching the ID is choosing the package whose staged answer contains it. Nothing is stored; nothing can disagree with Core.
- **Later, only if shown necessary:** a source that cannot be scanned (a remote one) needs an index from ID to package. That index would be advisory, never authoritative, and is verified after fetch exactly as above. It is a convenience for finding bytes, not a registry of capabilities.

## Are the package and the CLI still justified? (question 4)

**New semantics: no.** The first draft considered Core Nodes about an "install surface" and the tool deriving what an offer carries itself. Both are withdrawn: the first is unnecessary, the second was a second answer.

**A shipped package: yes, and for two reasons.** `engineering/` is never shipped, so a host without the source repository has no pipeline. And External operation needs an Engine that is obtained and run where KAAL operates, not inside the Subject; a package is how an Engine is obtained. The package holds the pipeline as a library (stage and ask, select by exact ID, install through Core, verify) and the source adapters.

**A CLI: one interface over the library, optional.** It adds no semantics. Nothing in the requirements needs it to live in Core; a CLI in Core would still need adapters and projection, which are not Core's. I recommend no CLI in Core, and treat a thin CLI in the package as a convenience that can follow the library.

## Relation to `kaal-install` (question 5)

`engineering/kaal-install` is today Engineer mode's projection: it deploys Core, registers the packages under `packages/`, and projects the result into this repository. It is the proof that the pipeline works. The composition mechanism is that same pipeline with its one hard-wired input, the packages under `packages/`, supplied by a source adapter. The directory-of-packages adapter pointed at `packages/` reproduces today's behaviour. I recommend a first Change that adds the package without touching `kaal-install`, and a later Change that makes `kaal-install` a caller of it. Two implementations would drift.

Three derivations in the installer cut against the one answer and are not fixed here: delivery name taken from the package's `skills/` directory; `compatibility` needs matched by prefix-plus-name rather than by Node ID; and a reach into Core's internal `candidates()` by relative path. Change `genesis/26/10/05/04` (PR #43) is settling delivery identity; this Change follows it.

## Which source adapters are necessary first (question 6)

One: a **local directory** of packages. It serves Engineer (`packages/`), Embed (a folder or unpacked archive carried to the host) and External (the same, on the Engine's side). An archive reader is a small later addition. A remote adapter is not a prerequisite and is not recommended until a case shows a local one cannot serve.

## Verification versus trust (question 7)

Two different things, kept apart:

- **Verification** (what this design provides): the staged bytes yield exactly the Node ID that was asked for, Core's admission accepts them (typed, sealed, references resolve), and after installing the instance can compare what it holds with what it acquired. All of it is checkable offline.
- **Trust** (what it does not provide): that the ID is the capability the caller meant, and that the source is who it claims to be. A Node's seal is an empty marker file named by the ID; it proves the bytes were sealed in the lineage's sense, not who sealed them. So selecting an ID is itself the trust decision, and it belongs to the caller. Where the ID comes from (the Owner, a reviewed Change, a pinned note) is the trust root.

I recommend adding no signature or authentication mechanism now. If a remote source is ever added, authenticating it is a decision for that Change, with this section as its starting point.

## The three operating modes (question 8)

```
 Engine (Core, Nodes, node seals, Skills)     Record (Change dirs + seals)        Subject (what the Work is about)
 where KAAL is installed                      where KAAL keeps what it governed   repository / change / PR acted upon
```

| Mode | Engine | Record | Subject | Where composition acts |
|---|---|---|---|---|
| Engineer | `.kaal/` of this repository | this repository, at the location it declares | this repository | this repository's Engine; source: `packages/` |
| Embed | `.kaal/` in the host | the host repository, at a location the host chooses | the host repository | the host's Engine; source: whatever the host is given |
| External | an Engine wherever the operator keeps it, not inside the Subject | a Record store the operator holds | a repository with no KAAL artifact | the operator's Engine; **never the Subject** |

In all three the same Core answer says what an Engine holds and the same pipeline obtains and installs more. What differs is where the Engine is, which source it is given, and where the projection lands. Because composition acts on an Engine, External requires no KAAL installation in the Subject, and nothing here writes a KAAL artifact into one. The locations are not derived from each other, as Change `08/03` settled.

## What KAAL already provides, and what is missing

Already provided: Core's enumeration; Core's admission and registration, which take bytes and never see their origin; the Engine / Record / Subject separation as design; the pipeline in `engineering/kaal-install`; `compatibility` refusal; the install check.

Genuinely missing, and only this:

1. The pipeline taking its packages from a **source adapter** instead of `packages/`, with a local-directory adapter.
2. **Stage and ask** exposed as an operation on an offer (a thin use of Core's existing calls), with a refusal when acquired bytes do not yield the requested ID.
3. That pipeline **shipped**, so a host or an Engine outside the Subject has it.
4. A way to run the installer against **an Engine location it is given**, not only the current directory, so External can compose its Engine without touching the Subject. `kaal-install` already accepts `--into`.

Not missing, and not to be added: a registry, a new Core concept or API, a distribution framework, remote acquisition, signing, or Packaging.

## Risks and open points

- The tool's `kaal-core` must match the instance's Skill and Extension Node bytes; a mismatch must be reported plainly.
- The three inherited name-based derivations remain until #43's outcome and a later Change.
- How a host that keeps Agent Skills elsewhere is served is not settled.
- Extensions are delivered one kind per package; the pipeline must carry both kinds.
- The first acquisition of the pipeline itself needs some source, once; a local copy suffices.
