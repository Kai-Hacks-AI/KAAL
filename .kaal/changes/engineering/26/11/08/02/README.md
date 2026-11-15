# Engineering: T111 runs its shell scripts without any derived path reaching a shell

Capability: Engineering. Target: kaal/engineering-b1-record. Record number is provisional until integration.

## Intent

Code scanning reported "Shell command built from environment values" on T111 (`review-unreadable.red.mjs`). A security finding does not go to `main` open. T111 must prove the same thing, that unreadable GitHub reads end in exit 2, without a command line, script text or path that comes from the environment or from the file's location.

## Content (1 path, no `.github`, no ledger entry)

- `engineering/change-isolation/review-unreadable.red.mjs`: the wait step and `bind-group.sh` are written or copied into a fresh scratch directory and run there by a constant name (`bash -e ./wait.sh`, `bash ./bind-group.sh review`); the attestation adapter is run by its constant repository path with `process.execPath`. The shared `run` helper that took a command and arguments is gone. The four Cases and what they assert are unchanged.
- This record.

## Check

`node --test engineering/change-isolation/review-unreadable.red.mjs`: 4 of 4 GREEN. Mutations on a copy of the tree: a wait step that tolerates the failed read turns the wait Case and the structure Case RED (2 of 4 fail); `continue-on-error` on the job turns the structure Case RED; the adapter swallowing the unreadable fact turns its Case RED. Code scanning on this pull request must show no alert on the file.

## Act

Hand-run until the next window. No queue, ruleset, promotion or publication.
