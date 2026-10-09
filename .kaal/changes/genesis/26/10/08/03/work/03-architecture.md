# Architecture

An investigation against `02-requirements.md`, read from `kaal/genesis` at b847794. Nothing is built. Revised after the Owner's architectural input (2026-10-09): the first draft let a tool work out for itself what an offer carries, which is a second answer to what Core already answers. This version removes that.

## The one answer

Core answers "which capabilities does an instance hold": `installedSkills(kaalDir)` and `installedExtensions(kaalDir)` return the admitted Nodes typed by Core's `Skill` or `Extension` Node, by exact ID, as `{name, id}`. Nothing is looked up by path, package or name. Everything here consumes that answer and adds none.

The same question can be asked of an offer without Core growing. **Stage and ask:** copy the instance's `.kaal` (or Core's `payload()`) into a throwaway directory, register the offer's bytes there through `registerSkill()` / `registerExtension()`, and call `installedSkills()` / `installedExtensions()` on the throwaway. Core's admission decides whether the offer is a capability at all, and the returned `{name, id}` is its identity. `engineering/kaal-install` already does exactly this to build what it projects. "Held" is then a comparison of two Core answers.

## The four things and who owns each

| Thing | Owner | Exists today? |
|---|---|---|
| Enumeration of what an instance holds | **Core** | Yes: `installedSkills()`, `installedExtensions()` |
| Offers: which packages a source has | a **source adapter** | No (the installer reads this repo's `packages/` directly) |
| Acquisition: a chosen offer's bytes | a **source adapter** | No |
| Delivery and installation: register through Core, project into the host | the **host projection** | Yes, but only in `engineering/kaal-install`, bound to this repo |

A source adapter knows locations and nothing else: `offers()` returns packages as bytes and `fetch(…)` returns a chosen one. It never says what a capability is. What a capability is, and its identity, come from staging the bytes and asking Core. A registry or a remote listing is only a way for an adapter to find packages; it carries no meaning and holds no identity.

## The smallest missing mechanism

Not a new capability concept and not a Core change. What is missing is the existing pipeline made independent of where its packages come from:

```
adapter.offers()  ->  bytes
stage + registerSkill/Extension in a throwaway KAAL  ->  Core's {name, id}
compare with Core's answer for the instance          ->  held or not
select by exact ID  ->  adapter.fetch(...) verified against that ID
register into the instance  ->  project into the host
```

Concretely: take `engineering/kaal-install`'s pipeline (stage, ask Core, project, check) and parameterize its one hard-wired input, "the packages under `packages/`", as a source adapter. A directory-of-packages adapter pointed at `packages/` reproduces today's behaviour for Engineer mode.

## What the CLI is

An interface over that pipeline, one of several possible. It adds no semantics. With the boundaries above, "a CLI or a registry as the meaning of all three" is avoided: enumeration is Core's call, offers and acquisition are the adapter's, installation is the projection's, and each can be used and tested without the others.

## Does it need a separate package, or new semantics?

**New semantics: no.** I found nothing in the requirements that needs a new Core concept. Nodes still never name a package or a location, so a Core "install surface" Node is not needed and I withdraw that candidate.

**Separate package: yes, for shipping, not for meaning.** The pipeline has to run in a host that has no engineering checkout, and `engineering/` is never shipped. That is the only reason for a package. It consumes Core's public calls and is otherwise independent.

**CLI in Core: still not recommended.** It would not remove the need for adapters or projection, which are not Core's, so it would add them to Core for the one benefit of not obtaining the tool once. If that one-time step proves unacceptable, it is the Owner's trade, and it would be its own Core Change.

## Modes (R18)

Engineer, Embed and External run the same pipeline over the same Core answer. They differ in the adapter (this repo's `packages/`, a copied folder or archive, a remote source) and in the projection (where Agent Skills and the entrypoint land). I read External as an instance reached from outside the host that holds it; if it means something else, the boundary still holds, and the Owner should say.

## Inherited derivations that cut against the one answer

Reading `engineering/kaal-install/helpers/delivery.ts`, three things already derive identity or meaning from names. They should be the Reviewer's first stop and are not fixed by this Change:

1. **Delivery name from a directory.** `capability` is taken from the package's `skills/` directory name, else the package directory, and passed to `registerSkill()` as the placement name. That is placement only, but the installer then treats it as the capability's name elsewhere.
2. **`compatibility` by name.** A need on a sibling is read from free text by prefix-plus-name (`capability-prefix`, `kaal-`), and matched against delivery names, not Node IDs.
3. **Reach into Core's internals.** `nodes.candidates()` is called by relative path to read what a package carries, which is a second route to a Node's identity beside Core's public calls. Stage and ask replaces it with the public answer.

Change `genesis/26/10/05/05` (PR #43) is already designing delivery identity versus capability identity; this Change should follow it rather than decide it.

## Verification

Each seam is tested separately. A test serves a source that advertises one ID and returns other bytes and expects refusal (R10). An acceptance in `engineering/` starts from an empty host with Core only and no network, installs from a local directory adapter by exact ID, and shows `installedSkills()` reports it and that the offer's `{name, id}` before install equals the installed one. Nothing here seals or closes the Change.

## Risks and open points

- Stage and ask needs the tool's `kaal-core` to carry the same `Skill`/`Extension` Node bytes as the instance, since registration anchors on those exact IDs. A mismatch fails loudly at admission; the tool should say so.
- Hashing proves bytes, not trust. Authenticating a remote source is not decided here.
- How a host that keeps Agent Skills elsewhere is served is not settled.
- The three inherited derivations above remain until a later Change.
- The first acquisition of the tool itself still needs some source, once.
