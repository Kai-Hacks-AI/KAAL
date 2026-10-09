# Capability identity and delivery identity: intent

Settle what is authoritative for the capability portion of a capability's delivery identifier, before anything is built. This Change is design only: it states intent, requirements and architecture, and implements nothing.

## Observation

Change `05/02` introduces an instance-owned setting, `capability-prefix`, and a checker that finds a capability delivery directory conformant when it starts with the configured prefix and has something after it. That is deliberate and sufficient for that Change: it establishes prefix conformance only.

It leaves open what the part after the prefix is, and who says so:

```
skills/kaal-sealing      conformant
skills/kaal-whatever     conformant
skills/changing-kaal     not conformant
```

Nothing ties `kaal-whatever` to any capability. The directory name carries a string, the checker accepts any string, and that string is the only thing that names the delivery. A name that nothing else vouches for is easy to mistake for identity.

## The distinction KAAL already makes

```
SEALED                          INSTANCE / DELIVERY

Capability: its Skill Node      the configured prefix
Node bytes, Node ID, seal       the delivery directory name
                                the filesystem location
```

Renaming a delivery directory leaves Node bytes, IDs and seals unchanged. The delivery location is therefore not a second, independent source of what a capability is.

## Intent

Make this relationship unambiguous:

```
sealed capability authority
          +
mutable instance delivery configuration
          ↓
mechanically checkable delivery location
```

in such a way that the delivery directory is evidence of where a capability was placed and is never read to learn what the capability is.

## Stance

- Find out first whether the existing Node model already holds enough authority. Add a field or a concept only if it does not, and then only the smallest.
- Do not derive a machine identity from presentation text. A human-readable name is not slugged, trimmed or normalised into a delivery name.
- Take Core's existing typed discovery as the authority for what an instance holds; a tool that composes an instance asks Core, then maps identities to deliverable bytes.
- Keep capability identity, package identity and Agent Skill naming distinct.
- Prefer one existing authority over several validation grammars.
- Do not weaken Node identity or sealing. Instance configuration stays mutable and unsealed. Core gains no capability-specific knowledge.
- Keep the design small.

## Out of scope

- Implementing anything: no field, no Node, no checker change, no migration.
- Change `05/02` and its behaviour. This Change builds on it and does not alter it.
- Renaming any existing capability.
- Anything about how a host stores, stages or transports KAAL.
