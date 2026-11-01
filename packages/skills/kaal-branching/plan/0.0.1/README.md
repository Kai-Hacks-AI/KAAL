# Branching 0.0.1 — PLAN

Status: PLAN accepted through #797, subject to the Owner's External-mode clarification in review 5728978939. This documentation-only follow-up reconciles that clarification across the contracts and proposed Cases. TDD/DO remain pending; no implementation, configuration activation, enforcement migration or npm publication is included.

Product: KAAL Branching. Proposed npm identity: `kaal-branching@0.0.1`, following Engineer Skill and Testing's unscoped Skill-package convention. Engineering is its implementer and a consumer; product authority remains with the Owner.

## Review map

| Document | Review decision |
| --- | --- |
| [Intent](intent.md) | Product purpose, ownership and release boundary |
| [Requirements](requirements.md) | Functional and nonfunctional contracts |
| [Architecture](architecture.md) | BASS, configuration authority, public interfaces and application modes |
| [Testing](testing.md) | Package, Configuration and Boundary Cases in three TDD loops |
| [Migration](migration.md) | Source inventory, provenance, focused route and enforcement cutover |

## Decisions proposed for approval

1. Establish the focused collector `kaal/branching-0.0.1` from current trusted `main`; never reset, replace or promote the existing broad `kaal/branching` collector.
2. Deliver a single policy engine at `lib/branching.mjs` in `packages/skills/kaal-branching/`. Retain `branching.ts` as the migration name if a typed source is needed; no authoritative source remains named Lineage.
3. Use strict, versioned JSON with constrained exact/prefix/remainder role matching. Embed reads `.kaal/config/branching.json` from an independently trusted protected revision. External obtains target-bound policy through an explicitly authorized interface in the controlling environment; it requires no configuration file or KAAL installation in the target. Neither mode trusts the proposed head as its policy authority.
4. Ship all operational entry points and adapters under `skills/kaal-branching/scripts/`. Keep host primitives in Hosting; keep branch and transaction semantics in Branching.
5. Support Embed and External with identical policy and assurance contracts. External runs KAAL in the controlling environment and does not install or implement KAAL within the target repository. External initially supports repository inspection, preparation, creation at an exact SHA, PR preparation for an existing head, promotion arming and independent auditing. Creating a synchronization commit externally is explicitly unsupported in 0.0.1; verification of one already supplied is supported when complete remote evidence is available.
6. Preserve the required `Branching` check and all existing required checks. Adopt the package through the old check's existing trusted path, with a delegation shim and no fallback policy.
7. Require all declared acceptance Cases and independent review before candidate promotion. npm publication requires separate independent release approval.

## Owner clarification after #797

[Review 5728978939](https://github.com/Kai-Hacks-AI/KAAL/pull/797#pullrequestreview-5728978939) approves the PLAN and requires this reconciliation before TDD/DO: Embed installs/applies KAAL in the consuming repository; External uses KAAL's knowledge and contracts from the controlling environment against an authorized target. External must not require `.kaal/`, an Agent Skill, scripts, a package or KAAL CI inside that target. Target policy and facts are explicitly authorized and attributed; their source and authority differ from Embed, while Branching semantics remain common.

## Evidence baseline

Inspected trusted `main`: `ef78dcadf11007fb5826b41f47814299ebe8ddb9` on 2026-11-01.

- Existing Branching implementation and real-Git tests are on main.
- [#788](https://github.com/Kai-Hacks-AI/KAAL/pull/788) and [#789](https://github.com/Kai-Hacks-AI/KAAL/pull/789) delivered the auto-merge correction independently.
- [#792 evidence](https://github.com/Kai-Hacks-AI/KAAL/pull/792#issuecomment-6558569755) records same-head GREEN → pending → RED. It explicitly leaves the pre-registration stale-GREEN race unproven.
- [#784](https://github.com/Kai-Hacks-AI/KAAL/pull/784) remains open at inspection, with 21 changed files and unrelated Engineering content. This PLAN proposes its supersession; it does not close it or dispose of its branch.

This is design evidence, not a package, configuration or live-boundary pass. Proposed commands, schema fields, Cases and file layouts below are contracts for review, not implemented interfaces.
