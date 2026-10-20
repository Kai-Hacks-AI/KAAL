# KAAL

KHAI's Artificial Agent League

## The name

**KAAL** stands for **KHAI's Artificial Agent League**. The name also plays on the Sanskrit *kāla*: time, and the end that time brings. That wordplay is intentional and part of KAAL's identity.

Earlier records spell it "KHAIs Artificial Agent League". That spelling is provenance, not a second expansion.

## What KAAL is

KAAL is built from four parallel concepts: Capabilities, Agents, Skills and Extensions. [CASE](.kaal/core/CASE.md) defines them, and the KAAL Engine identifies, admits, registers and discovers all four by one mechanism. This README explains how KAAL is engineered, embedded and taken outside. It defines none of that; each section links the Definition that does.

KAAL is recursive, yet reusable by others. KAAL engineers itself with what it has already accepted, and the same deployment any other host can install is the one KAAL consumes.

## Engineer

KAAL is engineered in this repository.

- [`engineering/`](engineering/) engineers KAAL: lanes, acceptance, and the GitHub workflows that govern how candidates reach `main`.
- [`packages/`](packages/) holds the distributable components, each with its own Definition and its own license.

The principle behind this is [MOVE](engineering/MOVE.md): the currently accepted, deployed KAAL develops its own successor. A candidate is never assumed to be available to establish its own acceptance. How candidates travel through `kaal/*` collectors to `main` is in [branching](engineering/github/branching.md).

## Embed

Embedding puts KAAL into a host. What is deployed is:

- the KAAL Engine, materialized as `.kaal/` ([`.kaal/AGENTS.md`](.kaal/AGENTS.md) is where an agent starts);
- `AGENTS.md` guidance, at the host's root and inside `.kaal/`;
- Agent Skills folders (`SKILL.md` and its prescribed structure).

This repository is itself a host: its Engine is [`.kaal/`](.kaal/) and its root guidance is [`AGENTS.md`](AGENTS.md).

The evidence today is [`embed.test.mjs`](engineering/acceptance/embed.test.mjs). It packs `kaal-core`, installs it with `kaal-graph` and `kaal-hosting` into a fresh host outside this repository, materializes `.kaal/`, verifies the Engine's identities, and registers a Skill and an Extension.

Not yet demonstrated: each skill package carries an Agent Skills folder (`packages/skills/*/skills/*/SKILL.md`), but deploying those folders into a host, and KAAL consuming its own deployed Skills on the same terms as any other consumer, are not shown. [#258](https://github.com/Kai-Hacks-AI/KAAL/issues/258) tracks this. Until then that part of Embed is intended, not proven.

## External

External means using KAAL to work on something else without bringing KAAL into that subject. KAAL remains outside the subject it works on. External is exploratory; no particular realization or workflow is prescribed yet. There is no `external/` area. The only prior evidence is KAAL.v2's learning records 0013 and 0014.

## Feedback

What Engineer, Embed and External teach comes back as candidates for the next accepted KAAL, under [MOVE](engineering/MOVE.md). Accepted experience on `main` is the starting point for the next change.

## Who owns what

Each capability owns its own contract. This README only points to them.

| Concern | Owner |
| --- | --- |
| The four concepts and their admission | Core: [CASE](.kaal/core/CASE.md) |
| A Node's identity and relations | Graph: [Graph](packages/skills/kaal-graph/payload/Graph.md) |
| The host and its paths | Hosting: [Hosting](packages/extensions/kaal-hosting/payload/Hosting.md) |
| Tested evidence | Testing: [Testing](packages/skills/kaal-testing/payload/Testing.md) |
| The Change lifecycle, from candidate to accepted | Change (not yet on `main`) |
| Control requirements and assurance | Controls (not yet on `main`) |
| How candidates reach `main` | Engineering: [branching](engineering/github/branching.md) |
| The self-evolution principle | Engineering: [MOVE](engineering/MOVE.md) |
