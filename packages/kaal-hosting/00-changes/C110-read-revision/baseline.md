# hosting/C110 baseline

The baseline is `main` (3a3cf6e6), with no commit of this Change.

- Hosting has no operation that reads a revision. Its Intent covers files and installed commands (hosting/I12, hosting/I17), and its operations are `read`, `list`, `scratch`, `readFile`, `kind`, `within`, `digest`, `update`, `reconcile`, `initialize`, `execute`, `executeSync`, `startPlan`, `isolatedEnvironment`, `prepare` and `contribution`.
- Seven pieces of code read a path or a tree at a revision, each its own way (read by hand in `main`):
  1. `engineering/change-isolation/check.mjs` `gitBlob`: `rev-parse`, then `ls-tree`; separates an absent path from an unreadable one; uses `--end-of-options`.
  2. `engineering/change-isolation/attest.mjs` `show`: `git show rev:path`.
  3. `engineering/collector-capability/check.mjs`: `ls-tree -r`, then one `git show` per file, through Hosting `execute`.
  4. `engineering/release-management/05-src/triggers/verify-triggers.mjs` `read` (CTL19): `ls-tree`, one `git show` per workflow.
  5. `packages/kaal-controls/skills/kaal-controls/scripts/registry.mjs` `filesAt`: `ls-tree -r`, one `git show` per file. The package has no dependencies.
  6. `packages/kaal-guard/lib/trusted.mjs` `materialize`: `ls-tree`, `cat-file blob`; refuses links and non-files; keeps the executable bit.
  7. `engineering/github/lineage.ts`: `ls-tree`, `cat-file`, `show`.
- Hosting's `execute` returns `stdout` as UTF-8 text, so it cannot return a file's bytes unchanged. A byte-exact read needs its own start.
- The shipped package-check suite (`04-test/package-check/*.test.mjs`): 113 Cases, all pass on this tree.
- `.kaal/hosting` does not exist in this repository, and the Hosting package declares no installation contract for it.
