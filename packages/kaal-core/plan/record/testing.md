# Installation Record and Cross-Installer Interoperability: Testing

The planned outer tests live in `packages/kaal-core/test/plan/record.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C13` turns them GREEN, adds them to Core's `npm test`, and may add Code tests of its own.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T32: a record with `assets` and the Capability's own members has no findings | core/F33, core/F38 | Requirements |
| core/T33: a missing `assets`, an entry without `sha256` or `version`, a digest that is not SHA-256, or a path that is not repository-relative is refused, and the finding names the member | core/F33, core/F38 | Requirements |
| core/T34: `register` adds what Core wrote with the contract's version, creates a missing record, and keeps every other entry and member byte for byte | core/F34 | Requirements |
| core/T35: `register` never registers a path Core did not write, or a path that is no asset of the contract | core/F35 | Requirements |
| core/T36: for a contracted Skill, Core's own record holds only provider deployments, and an already registered canonical asset is neither rewritten nor re-registered | core/F36 | Requirements |
| core/T37: a surface-gated asset is accepted by `checkContract` and never appears in a plan | core/F37 | Requirements |
| core/T38: the same inputs give the same record, and `register` and `checkRecord` import no host module | core/N10 | Architecture |

`core/F19`'s round trip is proved outside Core, because it needs a real Capability: Engineering realizes Guard's instance with Core in a fresh repository, then runs the packed Guard's own `upgrade` and `remove`, and the reverse (`guard/init`, then Core). The scenario includes a file at an asset target whose bytes match a catalogued content but that no record registers: neither installer claims, upgrades or removes it. Engineering numbers that scenario once `guard/C25` ships Guard's record. It is not a Core test, and `core/C13` does not claim it.

## RED evidence

At `core/C10`, all seven tests are RED, and each is **blocked before behavioural assertion**, because `kaal-core/installation` exports neither `checkRecord` nor `register`. They run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/record.test.mjs`, outside Core's `npm test` until `core/C13`.
