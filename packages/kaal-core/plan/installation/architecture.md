# Installation Contract and Agent Realization: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A5** [core/F9–core/F15, core/N4, core/N5]: The format is a `KAAL Definition`, `Installation Contract`, in `payload/core/` beside `CASE`. It is not one of the Kernel's foundational Nodes, so the Kernel and its pinned hash are unchanged, and the repository's `.kaal/core/` copy moves with it in the same Change. Its JSON shape and conformance checking are offered as `kaal-core/installation`, which provides:
  - `installationFormat()`, the Definition's reference;
  - `checkContract(contract)`, the findings for one instance, empty when it conforms.
- **core/A6** [core/F16–core/F22, core/N4, core/N6]: Agent Realization is a `KAAL Definition`, `Agent Realization`, beside `KAAL Agent` in `payload/core/`. Its mechanism is offered as `kaal-core/agent`, which provides:
  - `realize({ skills, providers, record, present })`, a pure plan from the Skills to install (name and canonical source files), the declared providers, Core's record, and the SHA-256 of what is present at each target. It returns `{ write, keep, prune, pointers, unknown, record }`;
  - `renderSkill(bytes)`, a supplier `SKILL.md` rendered from a canonical source.
  
  The placement table is a constant in `kaal-core/agent`, and the only one (`core/N6`). Provider entries come only from suppliers' documentation, as `guard/N10` records it.
- **core/A7** [core/N4, core/F18]: Core plans and Hosting realizes. `core/C4` reads `agents.kaal.json` and the present files through Hosting, applies the plan through Hosting, and keeps Core's record at `.kaal/state/core/installation.json`.
- **core/A8** [core/N5, core/F15]: Conformance is verified at engineering time. Engineering runs Core's conformance Test Cases against each Capability's instance, for example Guard's `contract.json` (`engineering/C…`, numbered by Engineering). No Capability package imports `kaal-core/installation` to conform.
- **core/A9** [core/I4]: A Capability's standalone lifecycle and Core's enrichment are not feature-equivalent (`guard/N12`). Standalone, a Capability realizes its own instance at the canonical locations only. Core adds registration, provider-aware deployments, pointers, and conflict handling.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C3` PLAN, this Change | Core | none |
| `core/C4` realization: both Definitions, `kaal-core/installation`, `kaal-core/agent`, Hosting application | Core | `core/C3`, `core/C5` |
| `engineering/C…` conformance of instances, and KAAL applying Agent Realization to itself (#258) | Engineering | `core/C4` |
| Guard's `contract.json` instance | Guard | `core/C3` |
