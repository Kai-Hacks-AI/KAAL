# Foundation as a capability: Architecture

Each element names, in brackets, the Requirements it answers.

- **foundation/A7** [foundation/F11–foundation/F17]: **Layout.** It follows the layout the Packaging thread uses (packaging/A12).

  | Path | Role | Ships |
  | --- | --- | --- |
  | `lib/sha256.mjs`, `lib/sha256.d.ts` | the library, unchanged | yes |
  | `bin/kaal-foundation.mjs` | the command | yes |
  | `skills/kaal-foundation/SKILL.md` | the skill | yes |
  | `docs/` | the six documents, which define the identifiers | yes |
  | `test/embed/*.test.mjs` | the delivered cases (testing/F76) | yes |
  | `test/verify.mjs` | the installed verification | yes |
  | `test/run.mjs` | the runner | yes |
  | `test/verify.json` | the manifest | yes |
  | `test/publisher/` | the publisher's suites and `manifest.mjs`; today's `test/plan/` tests move here (#702) | no |
  | `plan/` | the PLANs | no |

  `test/consumer/` moves to `test/embed/`. The repository's `AGENTS.md` gains the Foundation section.
- **foundation/A8** [foundation/F11, foundation/F13]: **The manifest script.** `test/publisher/manifest.mjs` does five things:
  1. It asks npm for the pack list (`npm pack --dry-run --json --ignore-scripts`, through `npm_execpath`).
  2. It hashes every listed file but `test/verify.json` with Foundation's own `sha256`.
  3. It reads each delivered case's title from `test/embed/` by the title form of foundation/F13. A title in any other form is refused.
  4. It writes `test/verify.json`, sorted and stable.
  5. With `--check`, it writes nothing, and fails if the committed file differs.

  The manifest is committed, so a source checkout verifies too, and no `prepack` script ships.
- **foundation/A9** [foundation/F12, foundation/N10]: **The verification.** `test/verify.mjs` imports only Node's built-in modules. It reads the manifest and checks `files` with `node:crypto`. Then it runs `test/embed/*.test.mjs` in process through `node:test`'s `run()`, with `NODE_TEST_CONTEXT` cleared, and takes each test's name and outcome from the run's events. It prints one human line per cause, then the summary line.
- **foundation/A10** [foundation/F14, foundation/N8]: **The command.** `bin/kaal-foundation.mjs` imports `../lib/sha256.mjs` and starts `test/verify.mjs` under the running Node with `spawnSync`, without a shell. It parses arguments and does nothing else.

## Sequence

| Order | Change | Depends on |
| --- | --- | --- |
| 1 | `foundation/C7` PLAN, this Change | the Owner's bar (2026-10-31), the Packaging review on #686 |
| 2 | `foundation/C8` DO: the layout, manifest, verification, command, skill and agent instructions, with foundation/T15–T31 GREEN and Packaging's suite run on the packed candidate | 1 |
| 3 | promotion `kaal/foundation` → `main` | 2, and the coordinator's turn |
| 4 | publication of `@kaihacksai/kaal-foundation` 0.0.1 | 3, the Owner |
