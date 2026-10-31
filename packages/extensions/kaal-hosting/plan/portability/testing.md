# Portability Across Capabilities: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/portability.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. Run them with `npm run build -w kaal-hosting && node --test packages/extensions/kaal-hosting/test/plan/portability.test.mjs`. `hosting/C17` turns them GREEN and moves them into Hosting's `npm test`, so they run in the Linux, Windows and macOS Hosting lanes. As the operating-system boundary, these tests may name a platform.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T42: `OS_BOUNDARY` is exactly `["@kaihacksai/kaal-hosting"]` and frozen; `osBoundary` is true for it, false for the unscoped name, other KAAL packages, a longer name and the empty string, and throws for a non-string | hosting/F36 | Requirements |
| hosting/T43: `facts()` establishes exactly the planned facts, each with a boolean, a reason and a link; the guide covers each fact on Linux, macOS and Windows with a link, and agrees with `facts()` on this host; where the fact holds, `specialEntries` makes a FIFO and a socket at the stated paths and `close()` keeps them; where it does not, it makes nothing and gives the fact's reason and evidence | hosting/F37, hosting/F38, hosting/F41 | Requirements |
| hosting/T47 (added at the Owner's request on #679, comment 6541495990): where the fact holds, `specialEntries` on a missing directory or on a file throws a `SetupFailure` (`outcome: "unknown"`, the fact, the directory, a reason, no `holds`), leaves nothing behind, and a `node:test` case using it reports fail 1, pass 0, skipped 0; where the fact does not hold, the same directories still give `holds: false` with the fact's evidence | hosting/F38 | Requirements |
| hosting/T44: outside the boundary, a `platforms` declaration and a manifest `os` fail `applicability is not scoped by platform` and are challenged, and a self-declared `osBoundary` is ignored; a well-formed host exception passes both cases and is put to review under a stable id, with no outcome, and a linked judgment does not close it; a complement is not reviewed; an unknown fact, no reason, no linked evidence and an unregistered case each fail `host exceptions are well-formed` and are challenged; the boundary's platform case is `not applicable`; hosting/F33's `summary` is unchanged; an inspection that cannot complete leaves both cases `not run` | hosting/F39, hosting/F40 | Intent |
| hosting/T45: each of Guard's negative sources (#577), a weakened assertion and a fixture set up per platform, is found with its kind and put to review; the case each `registration` or `dilution` decides is challenged by name, a `setup` challenges nothing, and a portable guard/T114 has no finding | hosting/F40, hosting/N6 | Intent |
| hosting/T46: the command exits 1 on a platform scope, 3 on a host exception under review and 0 without `--applicability`, which keeps hosting/F33's result; `portabilitySuite` runs the five cases and reports the pending review as `todo`; the manifest exports `./fixtures`; no shipped entry but the suite loads `node:test`; the guide covers each fact, platform, rule and PREACH, and the Skill points to it | hosting/F40, hosting/F41, hosting/F31 | Requirements |

hosting/A16–hosting/A19 are placements, validated by review. Whether the guide's judgments are right is a Review judgment; hosting/T43 and hosting/T46 check what it states and that each lane agrees with it. The `stale` rule for a fact that holds on every host cannot be exercised while the one planned fact does not, and is stated, not tested. The Limits are stated, not tested.

## RED evidence

At `hosting/C16`, all five are RED before behavioural assertion, because `hosting/C14` has not delivered the suite either: `kaal-hosting/conformance` exports no `OS_BOUNDARY` (T42), `dist/fixtures.js` and `dist/boundary.js` are not built (T43–T45), and the command does not exist (T46). They are not in Hosting's `npm test`, so KAAL's lanes stay green.

## Checked against a throwaway reference

The reference was not committed. On top of the `hosting/C13` reference, it added about 10 lines to `conformance` (`OS_BOUNDARY`, `osBoundary`, the conditional), a 35-line `fixtures` that tries `mkfifo` and `net`, a 70-line `portability` and `portabilitySuite`, 4 lines of command, and a placeholder guide. With it, hosting/T42–T46 are GREEN on Node 24 on Linux, and hosting/T32–T40 stay GREEN. The branch of hosting/T43 where the fact does not hold runs only on Windows, in `hosting/C17`'s lanes. Each weaker variant was caught (the last two rows were checked against the delivered `hosting/C17` code):

| Weaker reference | Caught by |
| --- | --- |
| treats a package's own `osBoundary: true` as the boundary | hosting/T44 |
| matches the boundary by a prefix or the unscoped name | hosting/T42 |
| accepts a non-string name | hosting/T42 |
| makes only the FIFO | hosting/T43 |
| removes the entries on `close()` | hosting/T43 |
| the guide has no Windows row | hosting/T43, T46 |
| ignores a manifest `os` | hosting/T44 |
| ignores a `platforms` declaration | hosting/T44, T46 |
| passes the platform case for the boundary instead of `not applicable` | hosting/T44 |
| does not put a host exception to review | hosting/T44, T46 |
| closes the request when the declaration links a judgment | hosting/T44 |
| puts a complement to review | hosting/T44 |
| accepts an unknown fact, an empty reason or evidence that is not a link | hosting/T44 |
| does not find a stale exception | hosting/T44 |
| reports `pass` when the inspection could not complete | hosting/T44 |
| adds a key to hosting/F33's `summary` | hosting/T44 |
| leaves declared cases out of `challenged` | hosting/T44 |
| leaves decided or weakened cases out of `challenged` | hosting/T45 |
| challenges a case for its fixture setup | hosting/T45 |
| classifies `(WINDOWS ? () => {} : it)(…)` as `setup` (the `hosting/C13` reference did) | hosting/T45 |
| as a suite, reports a pending review as a pass | hosting/T46 |
| as a command, ignores `--applicability` | hosting/T46 |
| loads `node:test` from `kaal-hosting/fixtures` | hosting/T46 |
| exports no `./fixtures` | hosting/T46 |
| the Skill does not point to the guide | hosting/T46 |
| returns `holds: false` with the fact's evidence when the fact holds but the fixture fails in the directory asked for | hosting/T47 |
| reports a setup failure that also claims `holds` | hosting/T47 |
