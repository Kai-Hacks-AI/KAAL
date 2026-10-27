# KAAL

KHAI's Artificial Agent League

## The name

**KAAL** stands for **KHAI's Artificial Agent League**. The name also plays on the Sanskrit *kāla*: time, and the end that time brings. That wordplay is intentional and part of KAAL's identity.

Earlier records spell it "KHAIs Artificial Agent League". That spelling is provenance, not a second expansion.

## What KAAL is

KAAL is a foundation for engineering with AI agents that lives inside a repository. It gives agents Markdown they can read and find, and it gives software a way to establish narrow, exact facts about that Markdown: which document it is, what type it has, who registered it, which files a package owns, and what a check's verdict was.

KAAL is not an autonomous multi-agent orchestrator. Nothing in it schedules work or assigns tasks among agents. The agents do the work; KAAL defines what they read and what can be established about it.

This README explains KAAL to someone new and links the Definitions that govern each part. It defines none of them.

## Nodes and identity

A Node is a Markdown file that begins with YAML frontmatter naming the Node and its type. Its identity is the SHA-256 of its exact bytes: moving or renaming the file leaves it the same Node, and editing it makes a new one. References name a Node by name and identity together, not by path. One genesis Node, `Node`, declares no type; every other Node is admitted when its type resolves to an admitted Node. The [Kernel](.kaal/KAAL-KERNEL.md) sets these rules, and [Graph](packages/skills/kaal-graph/payload/Graph.md) owns the Node's Form and identity.

## CASE

KAAL has four parallel kinds: Capabilities, Agents, Skills and Extensions. None is a kind of another. A Capability is a responsibility that overlaps with no other, delivered in any number of packages or none. [CASE](.kaal/core/CASE.md) defines the four, and the KAAL Engine identifies, admits, registers and discovers all of them by one mechanism. Relations between them belong to Graph and to the capabilities that define them, not to the Engine.

## The Engine

A repository embeds KAAL as an Engine, materialized in `.kaal/`: the Kernel, the foundational Nodes and every registered contribution. An agent starts at the repository's root [`AGENTS.md`](AGENTS.md), which points it to [`.kaal/AGENTS.md`](.kaal/AGENTS.md). The directory layout is a delivery convention; it gives no Node its identity or authority.

This repository is itself such a host:

- [`.kaal/`](.kaal/) is the Engine that governs it;
- [`packages/`](packages/) holds the distributable components, each with its own Definition and its own license;
- [`engineering/`](engineering/) holds the engineering and acceptance work.

## The packages

| Package | What it does | On npm |
| --- | --- | --- |
| [`@kaihacksai/kaal-guard`](packages/kaal-guard/README.md) | Connects a repository's own checks to its Git `pre-push` hook and to GitHub CI, one meaning per check | released, `0.0.3` |
| [`kaal-core`](packages/kaal-core/README.md) | The smallest working KAAL: the Kernel and foundational Nodes, identity, admission, registration, and the `kaal` CLI (`init`, `verify`, `list`, `resolve`, `identify`, `register`) | not released |
| [`kaal-graph`](packages/skills/kaal-graph/) | A Node's Form and identity, the Edges embedded in Nodes, lookup and traversal | not released |
| [`kaal-hosting`](packages/extensions/kaal-hosting/) | The host-facing Extension: the filesystem operations KAAL needs on Linux, Windows and macOS | not released |
| [`kaal-testing`](packages/skills/kaal-testing/) | Test design in three loops, and findings calibrated to their evidence | not released |
| [`kaal-engineer-skill`](packages/skills/kaal-engineer-skill/) | Producing and updating KAAL Skills, conformant to the Agent Skills standard | not released |
| [`@kaihacksai/kaal-foundation`](packages/kaal-foundation/README.md) | Shared, dependency-free primitives every Capability may build on | private, not published |

Core depends on no Git host and no agent provider. Guard depends on no other KAAL package.

**Core** reads every Node by its exact content, resolves types and references by name and identity, and bootstraps an Engine with `kaal init`. Registration accepts a contribution whole or not at all: registering identical content again changes nothing, and different content under a name already taken is refused. When Core deploys Skills for agent providers, it claims only the files its own record holds; a file someone changed, or anything Core did not deploy, is kept and reported.

**Guard** is KAAL applied to engineering. You declare a repository's checks in Markdown frontmatter under `.kaal/config/guard/`, and Guard runs them in the hook, in CI, or both, as you choose. A check's exit status is its verdict: pass, fail, cannot judge, not applicable, or held where you configure it. Cannot judge blocks; it never becomes a pass. Guard keeps three claims apart: that a workflow declares a check (`kaal-guard verify`), that GitHub ran it (the CI job), and that a merge requires it (your branch protection). Its README says what Guard [does not establish](packages/kaal-guard/README.md#what-guard-does-not-establish).

## Narrow claims

KAAL's parts share one habit: each claims exactly what it can establish, and no more.

- A Node's identity is its bytes, not its filename.
- Installing a package activates nothing; each surface is your separate choice.
- A declared check is not evidence that it ran, and a run is not evidence that a merge requires it.
- A passing check is not proof that the check or its tests are unchanged since you accepted them.
- A file whose content matches a package's is not a file the package owns; only its record says that.

## Engineer

KAAL is engineered in this repository. [`engineering/`](engineering/) holds the lanes, the acceptance tests, and the GitHub workflows that govern how candidates reach `main`.

The principle behind this is MOVE: the currently accepted, deployed KAAL develops its own successor, and a candidate is never assumed to be available to establish its own acceptance. MOVE's Definition is not yet on `main`. How candidates travel through `kaal/*` collectors to `main` is in [branching](engineering/github/branching.md).

## Embed

Embedding puts KAAL into a host. What is deployed is:

- the KAAL Engine, materialized as `.kaal/`;
- `AGENTS.md` guidance, at the host's root and inside `.kaal/`;
- Agent Skills folders (`SKILL.md` and its prescribed structure).

The evidence today is [`embed.test.mjs`](engineering/acceptance/embed.test.mjs). It packs `kaal-core`, installs it with `kaal-graph` and `kaal-hosting` into a fresh host outside this repository, materializes `.kaal/`, verifies the Engine's identities, and registers a Skill and an Extension. Guard is embedded through npm on its own; its README is the [place to start](packages/kaal-guard/README.md#start).

Not yet demonstrated: each skill package carries an Agent Skills folder (`packages/skills/*/skills/*/SKILL.md`), but the acceptance test does not deploy those folders into a host, and KAAL consuming its own deployed Skills on the same terms as any other consumer is not shown. [#258](https://github.com/Kai-Hacks-AI/KAAL/issues/258) tracks this. Until then that part of Embed is intended, not proven.

## External

External means using KAAL to work on something else without bringing KAAL into that subject. KAAL remains outside the subject it works on. External is exploratory; no particular realization or workflow is prescribed yet. There is no `external/` area. The only prior evidence is KAAL.v2's learning records 0013 and 0014.

## Feedback

What Engineer, Embed and External teach comes back as candidates for the next accepted KAAL, under MOVE. Accepted experience on `main` is the starting point for the next change.

## Who owns what

Each capability owns its own contract. This README only points to them.

| Concern | Owner |
| --- | --- |
| The four concepts and their admission | Core: [CASE](.kaal/core/CASE.md) |
| A Node's identity and relations | Graph: [Graph](packages/skills/kaal-graph/payload/Graph.md) |
| The host and its paths | Hosting: [Hosting](packages/extensions/kaal-hosting/payload/Hosting.md) |
| Tested evidence | Testing: [Testing](packages/skills/kaal-testing/payload/Testing.md) |
| Checks in the hook and in CI | Guard: [kaal-guard](packages/kaal-guard/README.md) |
| The Change lifecycle, from candidate to accepted | Change (not yet on `main`) |
| Control requirements and assurance | Controls (not yet on `main`) |
| How candidates reach `main` | Engineering: [branching](engineering/github/branching.md) |
| The self-evolution principle | Engineering: MOVE (not yet on `main`) |
