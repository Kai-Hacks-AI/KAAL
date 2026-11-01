# KAAL Branching — inspection candidate

Private 0.0.1 candidate under [PLAN #797](https://github.com/Kai-Hacks-AI/KAAL/pull/797) and [External clarification #801](https://github.com/Kai-Hacks-AI/KAAL/pull/801).

This package provides strict configuration validation, commit-parent transaction classification and a portable [kaal-branching Agent Skill](skills/kaal-branching/SKILL.md) for supplied-snapshot inspection. It remains an incomplete 0.0.1 delivery: live operations and release acceptance are pending.

## Public interfaces

| Interface | Established scope |
| --- | --- |
| validateConfiguration(JSON text) | Supported schema/vocabulary, unique keys, roles, transactions and consistent declarations |
| classify(configuration JSON text, observation JSON text) | Configured role pair, Engineer/Synchronize/Promote kind, integration method, declared snapshot binding and pending obligations |
| kaal-branching bin / Skill inspect.mjs | Read explicit controller-side input files through Hosting; classify through the selected installed product; report digests and evidence limits |

The pure implementation is lib/branching.mjs. Operational code lives inside the Skill; scripts do not select policy independently. The package declares Hosting and Foundation runtime dependencies.

## Inspect an explicit snapshot

Resolve the installed Skill's entry and the intended installed runtime context, then supply every argument explicitly:

```sh
node <skill-directory>/scripts/inspect.mjs --runtime <installed-context> --mode <embed-or-external> --phase inspect --config <policy-json> --proposal <observation-json>
```

The observation schema, complete parent-graph requirements and operation stages are documented inside the shipped Skill's references. A classification pass is not a merge permission or a verified repository operation. Every transaction obligation remains pending assessment; tree preservation, actual policy authority, freshness, reviews/checks and landing verification are not established.

Embed and External apply the same semantics. External keeps installation and authorized policy in the controller; the target needs no .kaal, package, Skill, scripts or KAAL CI. The current inspector reads supplied files and does not acquire or authenticate live remote observations. Prepare, Execute and Verify phases return unsupported without invoking a target mutation.

## Assurance and delivery

Configuration syntax and vocabulary, candidate transaction classification, Agent Skill format and installed inspection are covered within the test scopes recorded in the source tree's test/README.md and test/classification.md. A conforming Agent Skill is narrower than Skill Node admission through Core or complete Package/Configuration/Boundary assurance; those remain release obligations.

Input and runtime-source digests identify bytes only. The module-linker bootstrap uses an explicit runtime context and reports its identity; it does not establish trusted provenance or full dependency-graph integrity. Runtime authority must be established before any future privileged enforcement use.

The existing required Branching check remains active and unchanged. Root Workspaces and Acceptance lanes exercise the candidate; full supported-platform CI, independent review, governed promotion and separate npm release approval are required. No publication is authorized by this candidate.

