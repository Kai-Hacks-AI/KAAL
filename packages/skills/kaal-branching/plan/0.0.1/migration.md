# Branching: migration and delivery

## Inspection and provenance

Baseline: trusted main `ef78dcadf11007fb5826b41f47814299ebe8ddb9`.

| Source | Inspected identity / consequence |
| --- | --- |
| engineering/github/lineage.ts | blob `9fd91e3a1cfa6e3c7a2821faf0614defb90611ba`; pure verdicts, Git readers, host I/O and CLI currently share one file |
| engineering/github/lineage.test.ts | blob `35548555494513b143ab0eb8306c7c69b2dcdeb7`; 123 statically written it() titles observed, not a claimed runtime Case inventory |
| engineering/github/branching.md | Current consumer policy and procedural reasoning; documented promotionOrder is still PLAN, absent from inspected exports |
| #779 → #788 → #789 | Approved auto-merge correction is already on main; no need to import it from broad collector history |
| #792 | Closed unmerged controlled probe; same-head GREEN/pending/RED, no proof of race closure |
| #784 | Open broad promotion, head `58ae04364e91460c7a9664f41e9c9a51aa9fa639`, 21 changed files at inspection; not suitable as release baseline |

GitHub source search for lineage.ts returned direct users and documentary references. Before migration execution, repeat tracked-file search at the then-current trusted revision and record all matches. This inventory is source-inspection evidence, not a claim that untracked/deployed copies were searched.

## Responsibility extraction

| Existing responsibility | Product destination / boundary |
| --- | --- |
| promotionSource, establishment role detection, workingBranch role exclusions and readCollectors name reconstruction | Replace kaal/ assumptions with validated consumer role configuration; source-repository relationship remains a configured obligation |
| promotionFreshness, synchronization, marker verification, incorporated, landedAs, landing, attribute | Branching semantics; preserve ancestry, exact trees, modes, attribution and stated evidence limitations |
| methodFor, autoMerge | One configured transaction selector and auto-merge obligation in lib/branching.mjs |
| stateAt, collector, workingBranch, holds validation | Product lifecycle semantics over complete facts; hold source/authority and lifecycle choices come from consumer configuration |
| claim and readClaim, RULES hard-coded package path | Branching determines applicability/fact revisions and delegates to trusted Change public contract; Change retains numbering/collision ownership |
| merge/readFreshness/readSync/readExpected/readLanding/readCollectors/readWorkingBranch and Git helpers | Domain fact mapping inside Skill scripts; Git/filesystem/process mechanics behind Hosting |
| CLI, temporary files, JSON readers and resolutions output | Skill-contained entry points/runners; preserve exit behavior and NUL-separated own-resolution output required by Change Isolation |
| GUIDE and imperative Git repair text | Product diagnostics plus Skill references; KAAL guide remains consumer explanation with links, no second policy implementation |

The authoritative reusable source becomes Branching. Prefer direct ESM lib/branching.mjs in line with Testing and Graph. If preserving typed development source is beneficial, call it branching.ts and build a single ESM artifact; do not keep two manually maintained engines. A temporary engineering/github/lineage.ts is a delegation shim only and is removed after its consumers migrate.

## Consumer/dependency inventory

| Consumer or dependency | Migration obligation |
| --- | --- |
| .kaal/config/guard/Branching.md; engineering/github/branching.sh; .github/workflows/lineage-synchronization.yml | Preserve exact required job name Branching, producer identity and opened/synchronize/reopened/edited/auto-merge events. Trusted entry point delegates to installed product. |
| .kaal/config/guard/Promotion-Source.md; engineering/github/promotion-source.sh; .github/workflows/promotion-source.yml | Same product source verdict, no candidate execution; keep existing required check. |
| .kaal/config/guard/Branching-audit.md; engineering/github/branching-audit.sh; .github/workflows/branching-audit.yml; engineering/github/holds.json | Preserve landing, creation and lifecycle audits, full pagination, trusted holds and held outcome. |
| .githooks/pre-push; .kaal/config/guard/push.md; engineering/github/push-check.sh | Replace copied role/target assumptions with product/config delegation; local fetch-age limits remain explicit, CI remains authority. |
| engineering/github/change-isolation.sh; .github/workflows/change-isolation.yml | Consume verified own-resolution output from the same trusted Branching product. Preserve adopted exact-entry semantics and whole-tree CI. |
| package.json and package-lock.json | Add workspace/dependency/public test wiring; replace test:github/test:engineering source paths when authoritative tests move. |
| engineering lane/pack/acceptance/inventory/contracts/report drivers and ownership metadata | Include the new workspace, packed candidate and its exact tracked ownership; use existing Testing/Engineering interfaces, no duplicate recorder. Enumerate concrete metadata edits before their DO Change. |
| engineering/github/branching.md; engineering/MOVE.md; engineering/controls/README.md | Correct authority/path references and preserve evidence limits. |
| engineering/research/representation.md | Historical source reference retained or annotated; do not rewrite history as current assurance. |
| kaal-hosting | Existing public process/filesystem/conformance contracts; required explicit-method GitHub and remote evidence capabilities must be inventoried/provided by Hosting before execution support is declared. |
| kaal-engineer-skill, kaal-core, kaal-graph, kaal-testing | Skill conformance, Node admission/installation, lookup and three-loop acceptance through public contracts. Do not modify Core to admit Branching. |
| @kaihacksai/kaal-foundation; kaal-change (when trusted) | Digest authority; Change claims through accepted public contract. Missing optional legacy claim rule retains current documented not-applicable result until KAAL explicitly activates that obligation. |
| kaal-guard | Trusted invocation, findings and status reporting; verify its trust mechanism includes all imported product files/config/dependencies, rather than trusting only an extracted shim file. |

Claim-policy transition: the proposed configuration explicitly sets applicability to when-provider-admitted and names the Change provider/contract. A complete trusted inventory evidencing no admitted provider gives not-applicable, matching today's accepted behavior. Once admitted, a missing/broken provider fails. A failed fetch is never evidence of absence; candidate-added providers cannot judge their own acceptance.

## Effective governance snapshot

Read active repository rulesets on 2026-11-01:

- Main ruleset `24951062`: default branch, one approval, stale-review dismissal, resolved threads, strict required checks, deletion and non-fast-forward protection; no bypass actors.
- Collector ruleset `24952357`: refs/heads/kaal/*, one approval, stale-review dismissal, resolved threads, strict required checks, non-fast-forward protection; no bypass actors. Branch creation is excluded from status-check enforcement.
- Both require Branching, producer integration ID 15368. Main's allowed host methods include squash/rebase; collectors allow squash/rebase/merge. Branching still restricts each transaction's method.
- Main requires Change Isolation, Branching, Promotion Source, Hosting (Linux/Windows/macOS), Workspaces, Acceptance, Engineering and both CodeQL checks. Collectors additionally require Guard, Guard (macOS), Guard (Windows). Code-scanning rules apply.
- A branch response's legacy protection summary was empty while these active rulesets were present. Never infer effective absence of protection from that summary alone.

These are observations, not a perpetual policy snapshot. Re-read complete effective rules, including inherited rules, before each governed mutation and at release acceptance. Do not relax or replace them as part of this work.

## Focused route

Proposed collector: `kaal/branching-0.0.1`, created at then-current trusted main. PLAN working branch: `engineering/branching-0.0.1-plan`, from that collector. PLAN contains only this directory. Creation of an empty collector for PLAN does not authorize package DO.

1. Independently review this PLAN through a working-branch → collector PR, squash. No TDD/DO before accepted PLAN.
2. Write immutable architecture/acceptance tests and independent RED controls as focused Changes into the collector.
3. Deliver one policy engine, configuration parser, Skill/scripts and installed-package acceptance in small TDD Changes. Preserve the source/test ledger.
4. Deliver Hosting prerequisites separately under Hosting's ownership and governed collector; synchronize accepted prerequisites from main into this collector by merge commit. Do not smuggle Hosting work into Branching.
5. Add candidate KAAL configuration plus compatibility delegation and trust-loading support. Every production entry point still uses trusted main until promotion.
6. Migrate Guard bindings, hooks, root metadata, documentation and claim/resolution consumers. Compatibility paths contain delegation only. Remove old operational scripts after all callers move into the Skill; leave hooks/workflows as thin invocation plumbing.
7. If workflow changes are necessary, use a separate .github-only Change, as current Change Isolation requires. Keep existing workflow/job identities. Do not change a workflow and package code in one ordinary Change.
8. Record full main-relative diff, fresh ancestry, package/configuration/boundary evidence and independent review. Synchronize if main advanced, then promote the focused collector → main by squash. Follow the existing promotion queue, including explicit Owner ordering decisions.
9. The promotion is judged by old trusted main; the package/config activation becomes trusted only when accepted on main. Immediately inspect the same required Branching check and controlled GREEN→RED probe. Missing configuration/package must fail closed.
10. Delete the fully promoted focused collector only under lifecycle policy and authorized cleanup, after dealing with its open PRs. No npm publication until independent release approval.

Expected review units: PLAN; outer TDD; product implementation (split as tests require); KAAL configuration/delegation integration; consumer wiring; .github-only update if needed; promotion. This is an ordering/dependency outline, not a promise of a fixed PR count or approval of later Changes.

### Trust-preserving cutover

The legacy checker remains active while the candidate product is being tested. Preservation runs compare old accepted behavior to the candidate in the test harness only; they do not install a second production decision engine.

Before promotion, verify that trusted loading covers the complete module graph, lockfile, product and active policy. Today's Guard takes one named trusted file; copying a new shim to a temporary directory while its imports resolve from candidate node_modules would violate trust. Do not cut over until a test demonstrates resolution from the authorized trusted revision with pinned dependencies.

Prefer changing .kaal Guard bindings and thin wrappers while keeping workflows unchanged. If workflow changes are required, first promote a compatible workflow-only preparation that still executes the existing active checker and stable job. Use the governed focused collector route; no premature enforcement switch. Then activate package/configuration through the later fresh promotion. Remove transitional files only after every caller delegates successfully.

Once active, there is one product engine. Missing package/config fails; no fallback to a hard-coded KAAL engine. A defect is repaired through a governed corrective Change, with existing protections intact.

### #784 disposition

Do not merge #784 or cherry-pick its aggregate state. Auto-merge's replacement route already exists through #788/#789. This PLAN proposes closing #784 as superseded once the focused PLAN route is reviewable and its residual-file/ownership inventory is recorded. Keep kaal/branching intact with its accepted history and unpromoted content; do not reset, rename or delete it to simplify this release. Any retained work must be delivered separately by its owners.

No closing action is included in this PLAN Change; the exact disposition is submitted for review alongside the route.

## Release boundary and stopping conditions

0.0.1 candidate requires every declared supported Case, exact package/configuration/boundary findings, source/test preservation, installed execution on supported OSes, real hosted evidence, effective-rule verification and independent acceptance review.

Unresolved Hosting explicit-method execution, remote merge evidence, trusted module loading, claim applicability or governed Skill installation is a release dependency. Resolve it through the owner or return a scope adjustment to PLAN review. Do not silently downgrade a promised supported operation or label an unrun Case passing.

Release approval is separate from capability PLAN acceptance, collector integration and promotion. No npm publication, production probe mutation or unrelated collector disposition is authorized merely by accepting the design.
