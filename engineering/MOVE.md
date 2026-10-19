---
name: MOVE
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# MOVE

Main Offers Valuable Experience. KAAL's self-evolution principle.

The three parts below are kept apart so that the source of each claim stays visible. Only the first two state the principle. The third describes how it is realized today.

## Provenance

Human-supplied, from KAAL.v2 `ORDERS.md` at [894f54d](https://github.com/Kai-Hacks-AI/KAAL.v2/blob/894f54ddb10223838eb10e7ac8fdb172d818ff6c/ORDERS.md) (2026-09-19), verbatim:

> `main` is the accepted experience from which KAAL operates and learns.
>
> Candidate change happens away from `main` and crosses an observable integration
> boundary before becoming accepted experience.
>
> Two different kinds of evidence matter:
>
> **Tested → Verified.** A Program executed an explicit test and established
> exactly what that test computes.
>
> **Judged → Validated.** A Human or Agent evaluated something that cannot
> honestly be reduced to the test that ran.
>
> Neither means universally true. Later experience may overturn either. `main`
> remains valuable because it preserves what was accepted, under which controls,
> as the next starting point.

Today the two kinds of evidence are owned by Testing ([Testing](../packages/skills/kaal-testing/payload/Testing.md)) and by Controls. MOVE cites them and does not define them.

## Owner clarification

Added by the Owner on 2026-10-18. It is not part of the v2 text.

KAAL *x*, as accepted on `main`, develops KAAL *x+1*, the next accepted state. The capabilities and experience accepted at *x* engineer, verify and validate the proposed successor. A capability of the successor that is not yet accepted is never assumed to be available to establish its own acceptance.

MOVE states the principle and takes over no one's responsibilities. The Change lifecycle, including the transition from candidate to accepted state, belongs to Change. Evidence and governance belong to Testing and Controls.

## Realization today

This part describes the current realization. It is not a requirement of the principle, and Git `main` is not the principle itself.

Candidates are built on working branches and collected on `kaal/*`. Only `kaal/*` reaches `main`, through required checks ([branching](github/branching.md)). One concrete instance of the clarification is how the Change Isolation, Lineage Synchronization and Promotion Source checks run `engineering/github/lineage.ts`. They take it from `main` with `git show`, never from the candidate. So *x* judges *x+1*, and a candidate cannot certify itself with its own checker.
