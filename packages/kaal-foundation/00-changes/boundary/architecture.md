# Foundation Boundary Check: Architecture

Each element names, in brackets, the Requirements it answers.

- **foundation/A19** [foundation/F34, foundation/F35, foundation/N20, foundation/N21, foundation/N22]: **One script, targets as arguments.** `04-test/boundary-check/scan.mjs` holds the three rules and the walk. It imports only `node:` modules and the `sha256.mjs` shipped beside it (`../../skills/kaal-foundation/scripts/sha256.mjs` inside `dist/`). It is not a package export and not a `bin`: it is a file in the shipped Boundary Check, run by path. `scripts/kaal-foundation.mjs` is unchanged, and there are no `check` or `boundary` commands. The rules are data in the script. Targets are never.
- **foundation/A20** [foundation/F34, foundation/F36]: **Where it runs, and who decides.** Foundation ships the scan. Whoever promotes a package, or the repository's own lane, points it at the packages and at the repository. Foundation never runs it against anyone. The scan reports and ships no finding list. A finding is audit, held by Engineering; the repository records its decisions about findings against the finding `id` and `digest`, with the deciders its own role mapping names. Packaging may read the finding list later (its C23 reads only `id`, references and line digest); nothing here depends on Packaging.
- **foundation/A21** [foundation/F35]: **Hosting-shaped output.** The result line, the per-line finding and the exit codes 0 and 2 follow Hosting's scan, so one reader serves both. The id prefix is Foundation's own, and the rules are Foundation's.

## Sequence

| Order | Change | Depends on |
| --- | --- | --- |
| 1 | foundation/C13 PLAN, this Change | the Owner's ask and rulings (2026-10-31, 2026-11-09) |
| 2 | foundation/C14 DO: `04-test/boundary-check/scan.mjs` and `boundary-check.md`, documents, skill, `AGENTS.md`, the manifest regenerated, delivered case T46, and T37–T45 GREEN and moved to `04-test/engineering-check/publisher/` | 1 |
| 3 | promotion `kaal/foundation` → `main`, with the package proof point running every package's own checks | 2, the Owner's go |
| 4 | publication of `@kaihacksai/kaal-foundation` 0.0.2 | 3, the Owner |

Adopting the scan in the repository's lane, and the repository's place for decisions, are separate Changes. They are not part of this PLAN.
