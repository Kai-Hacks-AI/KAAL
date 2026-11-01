# Supplied snapshot input

The public classify(configurationText, observationText) interface takes exact JSON text. It rejects decoded duplicate keys and unsupported fields. Configuration uses kaal-branching/1; the observation uses kaal-branching-observation/1.

The observation has these required fields:

| Field | Meaning |
| --- | --- |
| schema | kaal-branching-observation/1 |
| repository | Host and immutable governed repository ID, bound to the declaration |
| head | Source repositoryId, branch ref and full commit tip |
| base | Target branch ref and full commit tip |
| promoted | One role/ref/tip observation for every configured promoted role |
| commits | Complete commit-parent records: sha and parents, including ancestors to roots |

Use full lowercase Git object IDs. Each commit appears once. Include every referenced parent; truncated, cyclic, repeated or inconsistent ancestry cannot be judged. Every branch tip must have a commit record. A title, kind flag or a claimed synchronization marker is not graph evidence.

Capture this input through an explicitly authorized target interface. This inspector does not acquire or authenticate that capture. A structurally complete table can still be fabricated; its authority, revision and freshness require separate Boundary evidence.

A pass returns the configured transaction, its method, declared role pair, observation binding and pending obligations. It does not prove that the proposed merge preserves content or that any operation is authorized. Preserve the result's classification scope in downstream reports.

In Embed, policy belongs to the consumer's trusted .kaal integration; in External it is an independently authorized controller declaration bound to the target. Neither the inspector's explicit local policy path nor an input digest establishes that authority.

