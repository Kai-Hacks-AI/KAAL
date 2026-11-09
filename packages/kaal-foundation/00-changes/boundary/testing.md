# Foundation Boundary Check: Testing

## Derivation

A boundary Case is derived from what Foundation owns, not from what a consumer does. Each rule of foundation/F34 answers one Foundation obligation:

| Foundation identifier | Rule | What it looks for |
| --- | --- | --- |
| foundation/I1 one SHA-256 for KAAL | `copy`, `implementation` | a second SHA-256 anywhere: a copy of Foundation's bytes, or the algorithm written out |
| foundation/I2 no digest changes, and the C18 position that no KAAL digest uses `node:crypto` | `crypto` | the platform asked for SHA-256 |
| foundation/I3–I7, foundation/F4–F21 and Architecture | none | Foundation's own obligations; no outer boundary |

The rules see what is written in source. They cannot see a digest computed some other way, and the record says so.

## Publisher's planned cases

`04-test/engineering-check/plan/boundary.test.mjs` holds these planned cases. They are immutable to DO and CHECK. The DO moves the file unchanged to `04-test/engineering-check/publisher/` and runs it in `test:publisher`. Every fixture is built in a temporary directory, so no case needs npm or a network. The cases run the generated `dist/test/boundary-check/scan.mjs`.

| Test | Loop | Checks | The fixture it must fail, naming the cause |
| --- | --- | --- | --- |
| foundation/T54 | Requirements | foundation/F34: a target with a copy of `sha256.mjs`, a file with the two round constants, and a file with `createHash("sha256")` gives three findings, with the rules `copy`, `implementation` and `crypto`, at the expected files and lines. A clean file, a `createHash("md5")` line and a file that only mentions "sha256" in a comment-free word give none | Today's package, which ships no scan; a scan that matches on the word, or that misses a rule |
| foundation/T55 | Requirements | foundation/F35: ids read `kaal-foundation/<file>:<line>` with the file relative to `--base`; two matches on one line are one finding; `digest` equals Foundation's SHA-256 of the line text; the last line is `kaal-foundation-scan {json}` with `mode` `scan`, `result` `complete` and exit 0 even with findings | A scan that exits 1 on findings, that reports a match per occurrence, or whose digest is not Foundation's |
| foundation/T56 | Requirements | foundation/F35: a target that does not exist gives `result` `unknown`, exit 2, with the path in `coverage.unreadable`; a target that holds no source file is `unknown`; a clean target that was read is `complete` with no findings, and the summary says "none found within this coverage" and never "compliant" or "verified" | A scan that reports a clean result for a target it did not read |
| foundation/T57 | Architecture | foundation/N22: no `--target` is a usage error, exit 2. A directory added after the scan was written, holding a violation, is found by the same unchanged `scan.mjs` bytes. `scan.mjs` holds no `packages/` path and no package directory name | A scan with a target list written into it |
| foundation/T58 | Requirements | foundation/F36: a finding carries the `owner` of the nearest `ownership.kaal.json` (`A` under one directory, `B` under another, `null` where none); a directory whose `ownership.kaal.json` names Foundation is skipped, with the reason `owner` in `coverage.skipped`, and yields no finding | A scan that does not say whose file a finding is in, or that reports the owner's own implementation |
| foundation/T59 | Architecture | foundation/N20: a fixture source that writes a marker file when imported or run is scanned and still gives its finding; no marker exists afterwards and the fixture tree is byte for byte as it was | A scan that imports, runs or changes what it reads |
| foundation/T60 | Requirements | foundation/F37: the shipped package holds `dist/test/boundary-check/boundary-check.md`. It declares **Applicable**, names the command `scan.mjs --target`, the three rules, both axes and the limits (including that an empty list is no compliance), says that findings are audit and decisions are the repository's, and never says "not applicable". It names no `CTO` or `CPO` and no `packages/` path | Today's package, whose `boundary-check` folder is empty and declares nothing |
| foundation/T61 | Requirements | foundation/F37: the installed `references/operations.md`, the skill and `AGENTS.md` name the scan by the scoped package's path, never as `npx`, and state that findings are audit and decisions the repository's. `verify.json` lists `scan.mjs` and the record | Today's documents, which name no scan |
| foundation/T62 | Architecture | foundation/N21: `scan.mjs` imports only `node:` modules and `sha256.mjs`; `scripts/sha256.mjs` and `scripts/sha256.d.ts` keep their `main` digests; the package declares no dependency | A scan that adds a dependency or changes the library |

T37 to T39 and T41 are the Requirements. T40, T42 and T45 are the Architecture of the check: targets are input, the scan only reads, and it adds no reach.

## Delivered cases

The DO adds one Case that ships and runs in every installation, on a fixture it creates in a temporary directory, as `04-test/boundary-check/scan.test.mjs` registered in `verify.json`.

| Test | Targets | Checks |
| --- | --- | --- |
| foundation/T63 | foundation/F34, foundation/F35 | the shipped scan finds a `crypto` line in a temporary fixture and exits 0 with `result` `complete`, and exits 2 for a missing target |

## First run: the repository (before this PLAN, not measured here)

No repository-wide run of the scan exists yet, so no count of findings is claimed. The DO runs it once over the packages and the repository and attaches the result to its Change Record as evidence. The findings are audit and are not decided here.

## RED evidence

On `kaal/foundation`, all nine planned cases are RED, because `dist/test/boundary-check/scan.mjs` and `boundary-check.md` are not delivered: T37 to T42 fail on the missing script and T43 to T44 on the missing record and documents. T45 fails because the script it inspects is missing. This is missing-deliverable evidence, not a behavioural RED. The DO shows the discriminating fixtures in the last column caught by a throwaway weaker reference.
