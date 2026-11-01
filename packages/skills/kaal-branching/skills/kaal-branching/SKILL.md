---
name: kaal-branching
description: Inspect configured branch roles and proposed Engineer, Synchronize and Promote transactions. Use for governed branching work, policy validation, synchronization or promotion preflight. This candidate inspects supplied snapshots; execution, audit and live authority verification remain unsupported.
license: MIT
compatibility: Node.js 24 or later, an explicitly selected installation of kaal-branching and its dependencies, and UTF-8 JSON policy and commit observations.
metadata:
  version: "0.0.1"
---

# Branching

Use the Branching product's scripts for deterministic inspection. Do not infer permission or integration success from a classification result. Product contracts and current coverage are linked in [references/contracts.md](references/contracts.md).

## Establish context

1. Identify the governed repository and whether the application is Embed or External.
2. Resolve this Skill's directory and the explicitly intended installed runtime context. Do not assume the current working directory is either one.
3. Obtain policy and commit observations through the consumer's authorized source. Read [references/snapshot.md](references/snapshot.md) for the input contract. If required facts or policy authority are unavailable, report that gap; do not invent observations.
4. In External, keep the Skill, package, scripts and policy declaration in the controller. Require no KAAL installation or files in the target repository.

## Inspect

Run [scripts/inspect.mjs](scripts/inspect.mjs) from its actual Skill location:

```sh
node <skill-directory>/scripts/inspect.mjs --runtime <installed-context> --mode <embed-or-external> --phase inspect --config <policy-json> --proposal <observation-json>
```

Both input paths name explicitly supplied files available to the controlling process. They are not implicit target filesystem paths. The script validates configuration, classifies the observed proposal through the installed public Branching implementation, and reports its scope and remaining obligations.

Read the JSON output. A classification pass names a consumer-permitted transaction and method. Policy authority, package assurance and live Boundary verification remain unverified. Retain input digests and the reported runtime identity alongside the finding.

## Choose the next action

Read [references/operations.md](references/operations.md) before Establish, Engineer, Synchronize, Promote, Audit or repair work. This candidate provides snapshot inspection only. Prepare, Execute and Verify phases return unsupported; do not replace them with improvised Git commands or claim an actual integration.

Consumer Agent instructions may point here using the concise guidance in [references/agent-instructions.md](references/agent-instructions.md). Installing that guidance in a consuming repository is a separate governed Change; External adds no instructions to its target.


