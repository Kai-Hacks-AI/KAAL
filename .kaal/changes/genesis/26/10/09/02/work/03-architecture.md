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

Reconciled with Change `genesis/26/10/05/04` (PR #43), two of the installer's three derivations are settled and one is not:

1. **Delivery name from the package's `skills/` directory: acceptable, as placement.** #43 says the delivery name arrives with the deliverable as a placement input and is never identity. The pipeline may take it from the deliverable, as the installer does, provided nothing then treats it as a capability's name.
2. **`compatibility` needs matched by prefix-plus-name: still cuts against the one answer.** #43 does not settle it, because a need is written in free text as a name. See decision D2.
3. **Reach into Core's internal `candidates()`: replaced** by stage and ask, which uses only Core's public calls.

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
- The name-based `compatibility` check is the one inherited derivation not settled by #43 (D2).
- How a host that keeps Agent Skills elsewhere is served is not settled.
- Extensions are delivered one kind per package; the pipeline must carry both kinds.
- The first acquisition of the pipeline itself needs some source, once; a local copy suffices.

## Reconciliation with #43

Both Changes keep their own Intent. This Change does not edit #43's, and #43 does not decide this Change's. Where they meet:

| Concern | Established by | Where it lives | This Change's use of it |
|---|---|---|---|
| Capability identity | **Core**: the Skill or Extension Node, `{name, id}` | sealed | asked from Core, never derived; selection is by exact ID |
| Package or source identity | the **source**: what carries a capability's bytes at that source | the adapter, never a Node | a supplier of bytes; proved by hashing, never by its name |
| Verification | **Core admission** plus **hash against the requested ID** | at install time | the check that an acquired offer is the identity asked for |
| Delivery name and placement | the **instance** (`capability-prefix`) and the **deliverable's layout** | `skills/<name>/`, `extensions/<name>/`; unsealed | passed to registration as the placement it already is; checked by #43's rules, not by this Change |
| Installed capability discovery | **Core**: `installedSkills()`, `installedExtensions()` | the admitted graph | the one answer for "held", before and after install |

Two small differences of wording, for the Owner to note and #43 to correct if it wants: #43 writes `offers()` as returning `{name, id}`; here a source returns packages as bytes and the `{name, id}` is Core's answer after staging, so a source cannot assert identity. And #43's open question on which namespace `capability-prefix` protects is not this Change's to settle; the pipeline places whatever name the deliverable carries and leaves conformance to the checker.

## Minimum viable 0.0.1

One end-to-end behaviour, demonstrable offline, over what already exists:

```
kaal-compose held   --kaal <engine-dir>                                   Core's answer: {name, id} per Skill and Extension
kaal-compose offers <source-dir> --kaal <engine-dir>                      each package in the directory: Core's {name, id}, and held or not
kaal-compose install <source-dir> --kaal <engine-dir> --select <Node ID>  stage, verify the ID, register through Core, project Agent Skills
```

(`kaal-compose` is a working name; see D1.) `source-dir` is a directory of packages shaped like this repository's `packages/`. `engine-dir` is the KAAL directory to compose, given explicitly, never derived. Agent Skills are projected to a directory given explicitly. Nothing is remembered between calls.

The demonstration, and the acceptance an implementing Change would write first:

1. A host holding only Core: `held` lists nothing; no network, source or engineering checkout is touched.
2. `offers` over a copy of this repository's `packages/` lists real capabilities (for example `kaal-review`) with Core's `{name, id}`, writes nothing, and shows none as held.
3. `install --select <ID>` registers it; `held` now lists exactly that `{name, id}`, equal to the one `offers` showed.
4. Installing again changes nothing.
5. A package whose bytes do not yield the selected ID is refused with nothing written.
6. A name, or an ID not offered, is refused.
7. External: with a Subject directory beside the Engine, install into the Engine leaves the Subject byte-identical.

Out of 0.0.1: remote or archive sources, authentication, the `compatibility` check (D2), `kaal-install` becoming a caller, wiring the agent entrypoint (stays `wire-kaal-agent`), Packaging, and any Core change.

## Decisions requiring the Owner's judgment before implementation

- **D1. Name and place.** A shipped package under `packages/` with its acceptance under `engineering/`. Working name `kaal-compose`. `kaal-install` is taken by engineering. Name it as you wish.
- **D2. `compatibility` in 0.0.1.** The installer refuses a capability whose declared sibling need is not held, matching names in free text. That is name-based identity. I recommend omitting it from 0.0.1 and saying so plainly in the package, rather than carrying a name-based identity into a new package; the cost is that 0.0.1 can install `kaal-changing` without `kaal-sealing`. Or carry it unchanged and accept the derivation until a machine-readable need exists.
- **D3. Delivery name in 0.0.1.** Taken from the deliverable (the Agent Skill directory, else the package directory) as a placement input, as #43 describes, with registration's own grammar check and no prefix enforcement in this tool. Agree?
- **D4. Skills and Extensions.** Both are listed and installed through the same stage and ask; the Agent Skill projection applies to Skills. Demonstrating Skills only is enough for 0.0.1. Agree?
- **D5. Locations.** `--kaal` and the Agent Skill projection directory are explicit arguments with no defaults, in line with Change `08/03`'s rule that no location is derived. A default for Embed is left to a later step.
- **D6. CLI.** A thin CLI over the library in the same package, for the end-to-end demonstration. No CLI in Core.
- **D7. Trust.** Selection by exact ID, hash verification and Core admission only; no authentication. Agree for 0.0.1?
