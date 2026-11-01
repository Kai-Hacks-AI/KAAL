---
name: MOVE
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# MOVE

Main Offers Valuable Experience. KAAL's self-evolution principle.

**The currently accepted, deployed KAAL develops its own successor.** KAAL *x* develops KAAL *x+1*. The successor becomes the actor only once it is accepted, and then it develops *x+2*.

The three parts below are kept apart so that the source of each claim stays visible. The first two state the principle. The third describes how it is realized today.

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

The currently accepted, deployed KAAL, not merely its source code, develops its own successor. KAAL *x* is not merely a baseline or a destination for completed work. It is the actor that drives its own evolution. The capabilities and experience accepted at *x* engineer, verify and validate the proposed successor, *x+1*. Once *x+1* is accepted, it becomes the actor and develops *x+2*.

A constraint follows from this. A capability of the successor that is not yet accepted is never assumed to be available to establish its own acceptance.

MOVE states the principle and takes over no one's responsibilities. The Change lifecycle, including the transition from candidate to accepted state, belongs to Change. Evidence and governance belong to Testing and Controls.

## Realization today

This part describes the current realization. It is not a requirement of the principle, and Git `main` is not the principle itself.

Today the accepted KAAL is meant to be what is deployed from `main`, not only the source held there. Three things are kept distinct:

- `engineering/` engineers KAAL.
- `packages/` holds the distributable components.
- Deployment produces the deployed KAAL. That is the KAAL Engine in `.kaal/` ([AGENTS.md](../.kaal/AGENTS.md)), agent-facing `AGENTS.md` guidance, and Agent Skills folders that conform to the Agent Skills specification (`SKILL.md` and its prescribed structure).

The intended deployment is oriented toward agents. `.kaal/` carries only the governance, identity and registration that are specific to KAAL. Agents work through the standard guidance and skill interfaces, which are native agent interfaces and not a proprietary KAAL format. KAAL is to consume its own deployed structure on the same terms as any other consumer, with no privileged hidden path.

What is demonstrated, and what is not yet:

- Demonstrated: the KAAL Engine is deployed into this repository as `.kaal/`, with `AGENTS.md` guidance at the root and in `.kaal/`. A packed `kaal-core` installs into a fresh host (`engineering/acceptance/embed.test.mjs`). Each skill package carries an Agent Skills folder (`packages/skills/*/skills/*/SKILL.md`).
- Not yet demonstrated: deploying those Agent Skills folders, and KAAL consuming its own deployed Skills on the same terms as other consumers. Until that is shown, this part of the realization is intended, not proven.

Candidates for *x+1* are built on working branches and collected on `kaal/*`. Only `kaal/*` reaches `main`, through required checks ([branching](github/branching.md)). One concrete instance is how the Change Isolation, Lineage Synchronization and Promotion Source checks run `engineering/github/lineage.ts`. They take it from `main` with `git show`, never from the candidate. So *x* judges *x+1*, and a candidate cannot certify itself with its own checker.

Two KAAL-wide mnemonics name where that boundary is enforced. HITMAN (Hooks Integrating Tests, Making Agents Nervous) is local feedback through Git hooks. CLAUSE (CI Lets Agents Update Service Errors) is CI and required checks: agents implement and propose, and required checks govern integration. Guard realizes both mechanisms and owns neither.

MOVE owns none of this realization. Engineering, packaging, hosting, Change and Testing each keep their own.
