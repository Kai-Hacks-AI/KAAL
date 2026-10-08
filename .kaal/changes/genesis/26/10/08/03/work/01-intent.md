# Intent

An embedded KAAL instance, such as the one in Enercon, can grow its own set of capabilities and stays in control of what it holds.

## Outcome

- The instance operates locally with the capabilities it already has. It needs no network connection, no registry and no checkout of KAAL's engineering repository to do so.
- When the client wants more capabilities, it can discover what is available, acquire it, install it and verify it, from a source that may be local or remote.
- The client remains in control of its own composition: nothing is added that it did not choose, and what it holds can be told from the instance itself.

## Why

Today a host with Core only (Enercon holds `.kaal/` and a wired `AGENTS.md`) cannot list or add a capability. The commands that do so live in the KAAL source repository, which the host does not have, and nothing in the host says where to go. A KAAL that cannot compose itself depends on its source repository for its whole life.

## Boundaries

- Capability meaning and exact Node identity stay the same whichever source a package comes from. A source is where bytes come from, never what they mean.
- Discovery, acquisition and installation are three things. One interface or one registry is not the meaning of all three.
- A CLI is a valid candidate for the interface, and a registry or package source may be an adapter. Neither is mandated by this Intent.
- Whether Core needs any new meaning, whether a CLI belongs in Core or in a separate package, how offline operation works, and how local and remote sources are resolved are for Requirements and Architecture to investigate, not for this Intent to settle.
- The smallest coherent architecture is preferred. Nothing is added to Core merely for convenience.
- A capability enters only through Core's registration, so Core's admission still decides. No selection by name and no remembered selection outside the instance's own installed state.
- Enercon is not modified by this Change.

## Done when

An embedded KAAL that holds only Core can, offline, say what it holds, and, when given a source, discover what that source offers, acquire a chosen capability by its exact Node identity, install it and verify it, with Core's identity rules unchanged and without a checkout of KAAL's engineering repository.

## Origin

The Owner's direction on PR #69 (2026-10-08) refines an earlier draft that proposed a CLI and a registry as the answer. This Intent states the outcome only.
