# Core's Lifecycle: Testing

The planned outer tests live in `packages/kaal-core/test/plan/lifecycle.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C19` turns them GREEN, adds them to Core's `npm test`, and may add Code tests of its own. They drive the built `kaal` command in fresh temporary repositories. They read nothing from the engineering repository except kaal-core's own tree.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T43: kaal-core delivers a conforming Installation Contract of its own, for exactly its payload | core/F42, core/A20 | Requirements |
| core/T44: `init` records Core's version in the one Core record it shares with Agent Realization, and `version` reads it, reports an unrecorded Engine, and `--engine` gets no lifecycle | core/F43, core/F46, core/A22 | Requirements |
| core/T45: `upgrade` replaces unmodified files from an earlier version, adopts an Engine without a record, and is idempotent | core/F44, core/A21 | Requirements |
| core/T46: `upgrade` keeps a modified file and reports it, and the upgraded Engine verifies; it refuses, changing nothing, when the result would not verify | core/F44, core/N12 | Requirements |
| core/T47: `remove` removes only Core's unmodified files and its record, and keeps and reports everything else | core/F45, core/N12 | Requirements |
| core/T48: an `upgrade` refuses and changes nothing when an Engine file it does not touch changes after it was read and verified; one that applies keeps an untouched file's executable mark (`core/C21`) | core/N12, core/A23 | Requirements |

## RED evidence

The tests run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/lifecycle.test.mjs`. Until `core/C19` they run outside Core's `npm test`, so no required check carries them. At `core/C18`:

- **core/T43 is RED, blocked before behavioural assertion.** kaal-core has no `installation.kaal.json`.
- **core/T44, core/T45, core/T46 and core/T47 are RED on their first behavioural assertion.** `kaal init` writes no record at `.kaal/state/core/installation.json`. Behind it, `kaal version`, `kaal upgrade` and `kaal remove` are unknown commands, which exit 2 and change nothing.

At `core/C21`, **core/T48 is RED, blocked before behavioural assertion.** kaal-core's built `dist/lifecycle.js` has no `planUpgrade`. core/T48 imports it directly, because the window it tests lies between Core's read and Hosting's reconciliation, and no command exposes that window. On POSIX hosts, its executable-mark assertion pins the regression Codex found on #472 at 02d61d7.
