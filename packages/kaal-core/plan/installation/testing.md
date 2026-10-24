# Installation Contract and Agent Realization: Testing

The planned outer tests live in `packages/kaal-core/test/plan/installation.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C4` turns them GREEN and may add Code tests of its own. The conformance Test Cases (core/T10–core/T13) are Core's, and Engineering also runs them against every Capability's instance (`core/A8`). Each run records its own evidence and does not copy the definitions.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T10: a minimal conforming contract has no findings | core/F9–core/F13 | Requirements |
| core/T11: an unknown or missing member, or a value of the wrong kind, is refused and named | core/F15 | Requirements |
| core/T12: a target that is not repository-relative, or a catalogue entry for no asset, or a digest that is not SHA-256, is refused | core/F10, core/F11 | Requirements |
| core/T13: `provides` naming a location instead of a Skill is refused | core/F14 | Requirements |
| core/T14: with no declared provider, a Skill is deployed only to `.agents/skills/<name>/` | core/F16 | Requirements |
| core/T15: declaring Claude Code adds `.claude/skills/<name>/`, from the same source | core/F17 | Requirements |
| core/T16: a provider the placement table does not know is `unknown`, and no path is planned for it | core/F17 | Requirements |
| core/T17: upgrade rewrites unmodified files, keeps and reports modified ones, and prunes only what Core deployed | core/F18, core/F22 | Requirements |
| core/T18: no plan writes an instruction file. A pointer names the canonical path and is never circular | core/F20 | Requirements |
| core/T19: `renderSkill` copies `## Description` verbatim into `description`, keeps the body, and refuses a source without it | core/F21 | Requirements |
| core/T20: the same inputs give the same plan and the same rendered bytes | core/N4 | Requirements |
| core/T21: `kaal-core/installation` and `kaal-core/agent` import no host module | core/N4, core/A5, core/A6 | Architecture |
| core/T22: no source outside `kaal-core` carries a provider location | core/N6 | Architecture |

`core/F19` (the Capability's record) and `core/A7` (Hosting application) are realization behaviour. `core/C4` covers them with Code tests through Hosting, and Engineering covers them by realizing Guard's instance and then running Guard's own `upgrade` and `remove`. `core/I4` is validated by observation: an agent of each declared provider reaches the Skill, as `guard/N9` records observations.

## RED evidence

At `core/C3`, all thirteen tests are RED, and each is **blocked before behavioural assertion**, because `kaal-core` exports neither `./installation` nor `./agent`. They run with `npm run test:plan -w kaal-core`, outside Core's `npm test` until `core/C4`.
