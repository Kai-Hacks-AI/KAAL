# C118 DO record

The DO on the merged PLAN (#2882): `scripts/run-facts.ts` (`contentIdentity`, `describeRun`, `RunFactsError`), `readCheckout` in `scripts/revision.ts`, their exports, the command row in the interface contract (`00-changes/interface/architecture.md`), the command `scripts/run-facts-cli.mjs` (the build list, `bin` and the interface table), the draft `run-facts.red.mjs` delivered as `04-test/package-check/run-facts.test.mjs` with its bodies and assertions unchanged (only the header comment changed), the ids I25, F113 and A50 (free on `main` and every remote branch at the PLAN), T349 to T353 (the allocation row), and the README and operations entries.

- `readCheckout` reads the working copy through Hosting's own `list` (skipping `.git` and links to directories) and `readFile`, and the head's content through `readRevision`; a commit that is not in the repository (`REVISION_NOT_FOUND`) is `null`, any other failure is an error. A directory that is not a Git working copy still has content and `git: null`.
- The drafts passed on a throwaway implementation before the PLAN merged; the DO is that implementation placed on the collector, with the documentation. No Case changed.

Not done: no ratchet, no change to Release's records or Testing's check, no choice of what counts as the examined content (the consumer's), no fetch of a missing commit, no workflow, no WIRE, no publication.
