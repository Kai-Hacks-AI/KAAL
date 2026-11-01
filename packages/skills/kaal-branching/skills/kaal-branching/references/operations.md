# Operation stages

| Stage | Current support |
| --- | --- |
| Inspect | Read explicit policy/proposal files, validate configuration and classify supplied commit-parent snapshots |
| Prepare | Unsupported; no authorized mutation plan is produced |
| Execute | Unsupported; no repository or host mutation is performed |
| Verify | Unsupported; no independent live observation or result verification is performed |

Establish, Engineer, Synchronize, Promote, Audit and repair are the product's operation scope. This candidate is their inspection entry point, not an implementation of their complete operational contracts.

The script reports exit 0 for a classification pass, 1 for a classified/configuration failure, 2 for missing/invalid evidence or invocation context, and 5 for unsupported phases. Exit 0 is not authorization or live Branching enforcement. Do not use this snapshot inspector to replace the existing required Branching check.

A Synchronize classification establishes graph shape and relevant ancestry only. Tree preservation, conflict resolution, full freshness, required auto-merge, reviews/checks and actual landing remain obligations for later assessment and verification.

Report unavailable authorized interfaces, stale or incomplete snapshots and unsupported phases explicitly. Do not repair them by changing policy, bypassing protection, resetting branches or substituting controller Git state for an External target.

