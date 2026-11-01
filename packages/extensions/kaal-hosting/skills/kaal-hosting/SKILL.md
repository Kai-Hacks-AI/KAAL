---
name: kaal-hosting
description: Select and use Hosting operations for portable file reads, initialization, publication, guarded file changes and installed commands. Use when working through @kaihacksai/kaal-hosting, handling a refused or stale operation, recovering from a failed reconciliation, verifying an installation or interpreting its boundary results.
license: MIT
compatibility: Node.js 24 or later, npm, and an installed @kaihacksai/kaal-hosting with its runtime dependencies.
---

# Using Hosting

Hosting is the KAAL Extension that crosses the host boundary. Use its public API; leave operating-system decisions to it. This Agent Skill accompanies the same Extension and introduces no new runtime API or authority. Core consumes the API independently of this Skill.

## Bare: start with the installed product

Work from the consumer directory where the package is installed. Reach it by `@kaihacksai/kaal-hosting`, never a checkout's source or another installation. Use the artifact and version authorized for that consumer; do not publish, upgrade or install globally to make a command succeed.

Locate the installed package's manifest:

```sh
node --input-type=module -e 'console.log(import.meta.resolve("@kaihacksai/kaal-hosting/package.json"))'
```

Its package directory carries the authoritative `docs` (Intent, Requirements, Architecture, Testing and Limitations) and the `payload` Hosting Extension Node. Read those installed documents when a guarantee matters. The package's TypeScript declarations describe callable inputs. This Skill guides their use; it does not replace their contracts. Its own resources remain usable wherever the complete Skill directory is placed.

## Agent: establish the task and authority

1. Identify the installed package, authorized target and requested outcome. Hosting's writer lock, staging and recovery locations can be beside the target; establish authority for that footprint too. A literal target-only write boundary may exclude it. Ask for missing authority before changing consumer content. A request to inspect grants no permission to repair.
2. Select the operation using [the operation guide and executable examples](references/operations.md). Pass paths, bytes and intent; do not branch on the OS or recreate a filesystem operation with another API.
3. For changes to existing content, retain the bytes used to plan and their expected digest. Re-check a changed plan with its owner. Never turn stale evidence into unconditional replacement.
4. Execute only the authorized operation. Keep the actual report or error, including findings, cause, recovery location and leftovers. A nonzero child exit is a completed command result; failure to start is a different event.
5. Report what ran, what changed and what remains unknown. Interpret verification and review separately. Escalate through PREACH when evidence or authority is insufficient; preserve the open obligation.

## Skill: choose and handle the result

Use [the operation guide](references/operations.md) for selection, guarded changes, recovery and the exact example blocks. The examples accept caller-supplied scratch roots; their `run` functions are examples, not additional package exports. Copy a block into an ESM module in the consumer and call it with that consumer's authorized inputs. Do not execute a demonstration against unrelated files.

- `STALE`: preserve unexpected content and the findings. Stop and re-read/re-plan with the appropriate authority; do not automatically retry the write.
- Refused input/path: report the refusal. Correct the requested plan rather than bypassing path checks.
- Observed apply failure with successful rollback: preserve and report the original failure; it is not a successful apply.
- `UNRESTORED`: the root may be partly applied. Preserve `kept` originals and `cause`, stop further mutation and escalate recovery. Do not delete the recovery directory.
- `leftovers`: preserve their paths and errors. They describe failed cleanup after the outcome was settled; they do not turn a settled result into its opposite. Do not silently clean them away.

Reconciliation serializes Hosting writers and rolls back observed failures. It is not crash atomicity, protection against uncooperative writers or proof of physical containment. See the installed Limitations before relying on it.

## Script: use the existing entry points

Use the named library exports and the existing commands. No additional filesystem CLI or shell wrapper is required.

Verify the installed copy from the consumer directory:

```sh
npm explore @kaihacksai/kaal-hosting -- npm test
```

The final `kaal-hosting-verification` JSON and actual process exit must agree:

| Result | Exit | Interpretation |
| --- | --- | --- |
| `verified` | 0 | The declared installed cases passed within the reported applicability and coverage. |
| `failed` | 1 | A case failed or verification changed the consumer. Preserve the findings. |
| `cannot verify` | 2 | Evidence or a prerequisite is missing; it is not verified. |

An undeclared skip, missing case, changed installed file or malformed/missing summary is not a pass. The shipped manifest establishes consistency, not provenance. A repository test pass, installed verification, promotion and npm publication are separate facts.

For a boundary inspection, use the installed `kaal-hosting-boundary` command or `/boundary` export according to the installed contract. Its exits have a separate meaning: 0 is deterministic verified with no review requested; 1 failed; 2 unknown; 3 deterministic verified with review requested. A verified deterministic result with `review: requested` leaves the request open. Find the `kaal-hosting-boundary` Agent Skill by name for review guidance; an acknowledgement is evidence, not approval. Do not assume that sibling Skill is installed at a relative path.
