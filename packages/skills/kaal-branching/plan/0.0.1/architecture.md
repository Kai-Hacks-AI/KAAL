# Branching: Architecture

## A1 — One product, BASS realization

The pure policy engine owns configuration validation, role resolution, graph-fact classification, transaction method selection, obligations and verdicts. It consumes validated facts and returns decisions, never performing host calls.

Agent instructions route to the installed Skill. The Skill explains operations and required evidence. Its scripts orchestrate the same engine through Hosting ports. Enforcement calls the same public engine and scripts. A compatibility shim contains only argument translation and delegation; it cannot supply an alternative policy or fall back to the former implementation.

Proposed Agent instruction, adapted to the consumer's actual installation:

> Use the installed kaal-branching Skill for branch establishment, Change integration, synchronization, promotion and audit. Resolve the governed repository and trusted .kaal configuration first. Follow its scripts and report unsupported or unverifiable operations.

This instruction contains no merge-method policy. Installation writes or proposes it through the consuming repository's governed Change process.

## A2 — Package contract

Follow accepted Skill workspace conventions:

- `packages/skills/kaal-branching/package.json`, README, LICENSE, .gitattributes.
- `capability/Branching.md`: product contracts; `payload/Branching.md`: Skill Node admitted through Core, with Foundation identity.
- `skills/kaal-branching/SKILL.md`, `references/`, `scripts/`.
- `lib/branching.mjs`: sole pure implementation, publicly exported as `kaal-branching`.
- Public `./package.json`; bin `kaal-branching` points inside the Skill, to `scripts/inspect.mjs`.
- `test/architecture/`, `test/acceptance/`, `test/implementation/`; PLAN material is not shipped as operational code.

All executable operational code, including CLI dispatch, runners and adapters, resides under the Skill's scripts directory. Proposed entry points are inspect.mjs, establish.mjs, engineer.mjs, synchronize.mjs, promote.mjs and audit.mjs. Shared orchestration and adapters live in scripts/modules/. Pure reusable semantics alone live in lib/.

The installed Skill must remain runnable if Core installs its directory away from the npm package. Scripts resolve `kaal-branching` by declared package dependency and an explicit installation context; they do not reach outside the Skill using relative paths or assume a repository-root node_modules. Installation and relocation acceptance must prove that resolution. The package's README documents prerequisites and supported contexts. A copied Skill without its declared runtime dependency fails clearly.

The proposed npm identity is unscoped `kaal-branching`, matching Engineer Skill, Testing and Graph. This is a packaging decision, not a registry availability claim. Node >=24, MIT and an explicit files allowlist follow those packages. Tests, fixtures, credentials and PLAN files do not ship. Digest operations use Foundation. Node admission and installation use Core; Agent Skill conformance uses Engineer Skill's public checker. No personal ChatGPT Skill installation is part of this delivery.

## A3 — Configuration format and authority

Propose strict JSON, schema `kaal-branching/1`, at `.kaal/config/branching.json`. A schema reference is documentation, never remote executable content. Reject duplicate keys before materializing a map, unknown fields, nonfinite numbers, unsupported schema/features and missing required properties. No imports, environment interpolation, executable hooks, arbitrary regex or policy defaults.

The schema defines these required sections:

| Section | Required meaning |
| --- | --- |
| schema | Exact supported version |
| repository | Host origin and immutable target repository ID, plus display owner/name |
| roles | Role IDs, exact/prefix/remainder selectors, lifecycle category, establishment source if applicable |
| transactions | Unique IDs, kind, source/target role, repository relation, integration method and obligations |
| governance | Required PR/review/freshness/check requirements, producer identities, bypass constraints, ordering and holds |
| evidence | Maximum observation age, consistency/re-read requirements and required provider capabilities |

Role IDs are consumer-defined. A role's supported category is promoted, collector or working; it gives the role its product semantics. Exact and prefix selectors must be disjoint: an exact ref inside another role's prefix or nested prefixes fail validation. One explicit remainder selector may classify all remaining valid branch refs as working. It is a set complement, not a priority-based exception. Empty prefixes, invalid ref names and ambiguous roles fail.

Transaction selection uses kind plus role pair and repository relationship. Synchronize has a working proposal head and collector target, with a separately named promoted role whose state is incorporated. Its head shape, ancestry, first-parent source and resolution proof establish its kind. A working proposal into a collector can therefore be Engineer or Synchronize, without ambiguous selection; kind is never accepted from a CLI flag or title alone.

0.0.1 supports these semantic combinations: Engineer working → collector by squash, Synchronize working → collector incorporating a promoted role by merge commit, Promote collector → promoted by squash. Consumers can prohibit any combination and choose names/role pairs; they cannot configure an unsupported algorithm and receive a guessed implementation.

### KAAL consumer declaration

The following is a schema design example, not an activated configuration:

```json
{
  "schema": "kaal-branching/1",
  "repository": {
    "host": "https://github.com",
    "id": "1415996637",
    "name": "Kai-Hacks-AI/KAAL"
  },
  "roles": [
    {"id": "release", "category": "promoted", "selector": {"exact": "main"}, "lifecycle": "retain"},
    {"id": "integration", "category": "collector", "selector": {"prefix": "kaal/"}, "establishFrom": "release", "lifecycle": "delete-after-complete-promotion"},
    {"id": "change", "category": "working", "selector": {"remainder": true}, "lifecycle": "delete-after-integration"}
  ],
  "transactions": [
    {"id": "engineer", "kind": "engineer", "from": "change", "to": "integration", "repositoryRelation": "same", "method": "squash", "obligations": ["on-target-tip", "no-unincorporated-promoted-history", "change-claim", "governed-integration"]},
    {"id": "synchronize", "kind": "synchronize", "from": "change", "to": "integration", "incorporates": "release", "repositoryRelation": "same", "method": "merge", "obligations": ["on-target-tip", "strict-forward-progress", "preserve-outstanding-work", "explicit-resolutions", "governed-integration"]},
    {"id": "promote", "kind": "promote", "from": "integration", "to": "release", "repositoryRelation": "same", "method": "squash", "obligations": ["contains-target-tip", "validated-head-tree", "promotion-order", "governed-integration"]}
  ],
  "governance": {
    "pullRequest": true,
    "autoMerge": "required",
    "strictFreshness": true,
    "review": {"minimumApprovals": 1, "independent": true, "dismissStale": true, "resolveThreads": true},
    "checks": {"authority": "effective-host-rules", "requireCompleteEnumeration": true, "requiredIdentity": {"name": "Branching", "integrationId": 15368}},
    "claims": {"applicability": "when-provider-admitted", "provider": "kaal-change", "contract": "checkClaim"},
    "bypass": "forbidden",
    "promotionOrder": {"mode": "fifo-owner-override", "enforcement": "manual-preflight", "authority": "repository-admin"},
    "holds": {"authority": "repository-admin", "source": "trusted-revision", "path": "engineering/github/holds.json", "outcome": "held"}
  },
  "evidence": {
    "maxObservationAgeSeconds": 60,
    "recheckBeforeMutation": true,
    "recheckAfterMutation": true,
    "requireCompletePagination": true,
    "requireRevisionBinding": true
  }
}
```

Every obligation and enum is a closed supported vocabulary. Omitting any required governance value is invalid. Required checks are enumerated from complete effective host rules; the configuration cannot silently omit a host-required check. The named Branching identity is a minimum consumer requirement, not a replacement for that complete set. Contradictory lifecycle, role references, method/obligation combinations fail configuration verification. The explicit claim applicability preserves today's rule: when no provider is admitted at the trusted revision, claims are not applicable; when admitted, its declared public contract is mandatory and a missing or broken provider fails. Absence must be evidenced from the complete trusted installation/source inventory, never inferred from a failed fetch.

KAAL currently accepts valid stepwise synchronization; the schema represents that through strict-forward-progress rather than requiring the latest promoted tip for every step. Promotion still requires current tip ancestry. Freshness age is a maximum reading age, not proof of atomicity.

### Trust bootstrap and policy changes

The authority context is supplied outside candidate content: target host/repository ID, protected governance ref and its observed commit, allowed product revision/dependency lock and caller authority. For KAAL the governance ref is main. The installed consumer's protected CI/controller configuration establishes that context; .kaal does not authenticate itself.

Fetch active configuration, holds, product and dependency authority from that exact trusted commit. Re-read its ref before Execute. Candidate configuration is assessed as proposed data under the active policy, and cannot govern its own review, CI, permissions or integration. Activation happens only after a separately governed integration to the trusted ref and subsequent read at the new trusted revision. No command flag can substitute the candidate's config for active policy.

An initial consumer with no trusted configuration cannot execute governed transactions. Bootstrap requires an independently reviewed initial policy/install Change using the existing host protections or an explicit authorized installation process. Never infer trust from a file being present. The already accepted legacy checker remains KAAL's authority until the package/configuration cutover is promoted.

Policy or product advancement makes prior operational plans stale. Check producers must include authority revision in their evidence; enforcement must rerun on relevant policy changes or conservatively block until current evidence exists.

## A4 — Public operation and evidence interfaces

Propose pure exports `validateConfiguration`, `classify`, `assess` and `audit`. The scripts accept an explicit operation, mode, target descriptor and phase; operation scripts accept `--phase inspect|prepare|execute|verify` plus structured input. No implicit Execute phase.

Inspect obtains facts and judgments. Prepare returns a serializable proposal with preconditions and required evidence. Execute takes that proposal plus explicit authorization, rechecks it and makes only its declared mutation. Verify independently reads the target's actual state; it cannot reuse an API acceptance response as its observation. Inspect and Audit are read-only; audit's execute phase is unsupported.

A fact envelope records target host/repository ID, refs and SHAs, trusted policy revision/digest, product identity, PR/head/base, provider identity, timestamp, run/check attempt and producer where relevant, pagination completeness, exact objects and unavailable facts. A proposal also records mutation kind, expected before/after, required checks/reviews, evidence expiry and operation identifier.

Possible operation states include prepared, submitted, pending, verified and failed/unknown. Verdicts remain pass/fail/cannot-judge/not-applicable/held/unsupported; submission is never pass. Legacy exit codes 0/1/2/3/4 retain pass/fail/cannot-judge/not-applicable/held; unsupported uses 5. A required gate maps only a complete applicable pass to success. A verified held state does not make a pending promotion pass.

Re-read refs, policy, PR head, effective governance and mutable auto-merge/check/review facts before mutation and during verification. Use expected-head/expected-ref conditions where the host supports them. If the necessary operation lacks an atomic condition, declare that limitation and perform bounded reconciliation; never claim race freedom. Timeout leads to inspection by operation identity before any retry, avoiding duplicate branches or PRs.

Observe the required checks without waiting for Branching itself to turn green inside its own evaluation: Branching assesses its own transaction obligations and evidence attribution; host protections enforce all required jobs, including Branching. Execute may arm auto-merge while required work or review is pending, but cannot report integration complete until Verify observes a protected landing and its evidence.

## A5 — Hosting boundaries and modes

Hosting supplies process/filesystem primitives, local Git invocation and authorized GitHub reads/writes. Branching's script adapters map those results into domain facts; they contain no independent method/role policy. Required GitHub capabilities include complete PR/review/check/rules enumeration, repository IDs, refs, commit/tree objects, activity, conditional mutations and explicit-method auto-merge.

The currently available GitHub auto-merge wrapper infers its method and returns only success. That interface is insufficient for deterministic Execute. Do not use it and hope. Hosting must expose an explicit-method operation and readback or report unsupported; this is an execution release dependency, not permission to infer the method.

| Operation | Embed 0.0.1 | External 0.0.1 |
| --- | --- | --- |
| Inspect/configuration/boundary | Local Git plus authorized host facts | Authorized target APIs, complete remote objects/history and effective rules |
| Establish | Exact-SHA local/remote ref creation, no replacement | Authorized create-ref at observed trusted SHA; re-read target ref |
| Engineer | Create explicit working ref and PR for caller-supplied Change; do not generate application code | Create ref/PR for an existing target commit; no assumption of local files |
| Synchronize | Create merge commit via local Git; conflicts require explicit caller-provided resolutions and review | Inspect/Prepare/Verify supplied synchronization supported; Execute creating merge/resolutions unsupported |
| Promote | Prepare/open promotion PR, arm exact-method auto-merge after authorization, verify eventual result | Same contract through authorized target APIs; controller state is irrelevant |
| Audit | Read host activity, topology and branch lifecycle | Same, from authorized target interfaces; missing objects/history fail closed |
| Repair | Inspect and prepare repair; use an already supported transaction for explicit Execute | Same supported transactions only; no destructive repair or remote conflict synthesis |

External may use a host-backed Git computation service only with explicit provenance, object completeness and target binding. A permissive mock Boolean such as containsTip=true is not remote Git evidence. No target clone, process cwd, controller origin or implicit credential is required by the External interface. If a host cannot provide the exact merge-tree computation, the relevant verification is cannot-judge and execution is blocked; 0.0.1 support must be demonstrated on the declared GitHub adapter, not advertised from doubles alone.

In both modes, missing permissions, incomplete history or unavailable administrative rules are evidence failures. Mode does not change the verdict for equivalent evidence.
