# Architecture

An investigation against `02-requirements.md`, read from `kaal/genesis` at b847794. Nothing is built. Where I recommend, I say so, and the Owner may overrule.

## What already exists

| Need | Where it is today | Source-independent? |
|---|---|---|
| Say what is held (R1, R2) | Core: `installedSkills(kaalDir)`, `installedExtensions(kaalDir)`, read from the admitted graph | Yes |
| Install a capability (R9, R12) | Core: `registerSkill()`, `registerExtension()`. Both take the contribution as an in-memory map of paths to bytes, check everything before writing, refuse changed bytes | Yes: they never see where the bytes came from |
| Read what a contribution offers (R5) | Core internals `candidates()` and `admit()` (not exported; Kai ruled they stay unexported) | The meaning is Core's; no public call |
| Find offers, deliver Agent Skills to the host, refuse unmet `compatibility`, check the install (R3, R10, R11, R13) | `engineering/kaal-install`, which is never shipped and looks for packages only under this repo's `packages/` | No: source is hard-wired to this checkout |
| Fetch bytes from a place (R6, R7, R8) | Nothing | n/a |

The first two rows mean installation is already separate from where bytes come from. What is missing is everything around it: finding offers, getting bytes from a source that is not this checkout, and the host-side delivery and checks, which exist but are bound to the source repository.

## Does Core need new meaning? (R18)

I found no requirement that needs it. "Installable" is already a Node typed by Core's `Skill` or `Extension` Node, by name and ID. A package already carries `{ kaal, skills }`. Which package carries a Node is not a question Nodes should answer: they refer by `{name, id}` and never by location (R15). It is answered by the source and **proved by hashing** the bytes against the requested ID (R8). So a Core Node about an "install surface" is not needed for this outcome, and I recommend not adding one. This is the claim the Reviewer should push on hardest.

One thing Core does lack for a standalone tool is a public way to read the Nodes of a contribution that is not yet installed (R5). The tool can compute that itself from the exact bytes, the way the installer already does, or Core can export a read-only call. The second grows Core's API; I recommend the first until it proves painful.

## Three seams

```
discovery     source  ->  offers: [{ name, id, held? }]        reads Nodes, writes nothing
acquisition   source + id  ->  bytes (verified against id)     writes nothing to the instance
installation  bytes  ->  Core registerSkill / registerExtension, plus Agent Skills to host, plus checks
```

Each seam takes a **source adapter** with two operations: `offers()` and `fetch(id)`. Adapters are the only place a location exists. Candidates:

- a local directory of packages (the cheapest, and what offline composition from a USB stick or a vendored folder needs),
- a local archive (an npm tarball),
- a remote one (the npm registry, or a URL).

Listing a directory is trivial. A remote needs a convention for what counts as a KAAL capability (an npm keyword, a scope); that convention lives in the adapter and carries no meaning, so a different source can replace it.

## Where it lives (R16, R17, R19)

- **Option X, recommended: a separate npm package** (working name `kaal`, or `kaal-cli`) that depends on `kaal-core`, holds the three seams and the adapters, and exposes a CLI as one interface over them. Core is untouched, so this is an ordinary Change and not a Core Change. A CLI is an interface and the seams stay usable without it.
- **Option Y: the CLI inside `kaal-core`.** Removes the one-time step of obtaining the tool in a host that has Core only. It grows Core's shipped bytes and API for convenience (R18), forces this to be a Core Change that travels alone, and pulls adapters, network and archive handling into the package that is supposed to stay minimal. I recommend against it unless the first-acquisition problem below proves unacceptable.
- **Option Z: Core Nodes about the install surface.** Not needed (see above).

## The first acquisition

A host with Core only has no tool. Getting the tool is itself an acquisition from some source, once, and it can be a local one (a copied folder or an archive carried in). After that the instance composes itself offline from whatever source it is given. This is the honest cost of X, and why Y stays on the table. It is not hidden by calling Core "self-sufficient".

## The existing installer

`engineering/kaal-install` does the host-side delivery, the `compatibility` check and the install check, but over this repo's packages. Two ways to reconcile, left open:

1. The shipped package takes that logic and `install-kaal` becomes a thin caller of it with a directory-of-packages adapter pointing at `packages/`. One implementation.
2. The shipped package reimplements it and `install-kaal` stays as the source repo's self-projection. Two implementations, which will drift.

I recommend 1, and as a later step: a first Change should add the new package without touching `engineering/kaal-install`.

## Verification

Each seam is tested separately, and a test shows R8 by serving a source that returns other bytes than the ID it advertises and expecting refusal. An acceptance in `engineering/` installs into an empty host from a local directory with no network and no checkout, and checks that `installedSkills()` reports the capability. Sealing, closing and the Reviewer are not part of this Work.

## Risks and open points

- Verifying by hashing proves bytes, not trust. Whether a source should also be authenticated is not decided here.
- Installing a capability with an Agent Skill writes to the host's `skills/`. How a host that keeps skills elsewhere is served is not settled.
- `compatibility` is read from free text by the installer. A standalone tool inherits that fragility.
- Extensions are delivered one kind per package. The seams must carry both kinds.
- The npm remote adapter is a convention, not a design; it needs its own Owner decision if built.
