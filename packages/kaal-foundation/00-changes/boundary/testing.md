# Consumer boundary: Testing

## Derivation

Each Foundation identifier is listed with its boundary form (see `intent.md`) and with the requirement that carries it.

| Foundation identifier | Loop | Boundary form | Boundary expectation | Carried by |
| --- | --- | --- | --- | --- |
| foundation/I1 one SHA-256 | Intent | mirror | the Foundation the consumer resolves is a verified Foundation | foundation/F23 |
| foundation/I2 no digest changes | Intent | mirror | every digest the consumer states is Foundation's digest of the same bytes | foundation/F22 |
| foundation/F1 FIPS 180-4 digest | Requirements | mirror | subsumed by I2: agreement with Foundation is agreement with FIPS | foundation/F22 |
| foundation/F2 a view's own bytes | Requirements | mirror | subsumed by I2, for the bytes the consumer names | foundation/F22 |
| foundation/F3 refuses non-bytes | Requirements | inverted | the consumer never relies on a refusal. This needs consumer code to run, so it is not judged here | the consumer's own tests |
| foundation/F12 installed verification | Requirements | mirror | the resolved copy's own verification is `verified` | foundation/F23 step 3 |
| foundation/F14, foundation/F18 command and acquisition | Requirements | inverted | the consumer runs Foundation by the scoped bin. That is visible only in the consumer's own documents, so it is not judged here | the consumer's own tests |
| foundation/I3–I7, foundation/F4–F11, foundation/F13, foundation/F15–F19 | Intent, Requirements | none | they are Foundation's own obligations | Foundation's own cases |
| foundation/N*, foundation/A* | Architecture | none | there is no outer boundary for placement | Foundation's own cases |

So the boundary is not "the same cases with opposite results". Two Intents are mirrored. A few Requirements fold into them. The inverted ones and every Architecture element stay out of reach of a check that knows nothing about the consumer.

## Publisher's planned cases

`04-test/engineering-check/plan/boundary.test.mjs` holds these planned cases. They are immutable to DO and CHECK. The DO moves the file unchanged to `04-test/engineering-check/publisher/` and runs it in `test:publisher`. Every fixture is built in a temporary directory. A fixture consumer gets its Foundation as a copy of the shipped files of this package, placed at `node_modules/@kaihacksai/kaal-foundation`, so no case needs npm or a network.

| Test | Loop | Checks | The fixture it must fail, naming the cause |
| --- | --- | --- | --- |
| foundation/T37 | Intent | foundation/I9, foundation/F22: a list that `kaal-foundation sha256` printed for two files is `verified`, exit 0, `checked` 2. Changing one file afterwards gives `failed`, exit 1, with cause `differs` for that file only | Today's command, which has no `check` |
| foundation/T38 | Requirements | foundation/F22: each of these is `cannot verify`, exit 2, with its cause: an empty list, a line with no two-space separator, a digest in uppercase or of 63 digits, and a missing file. If a list also holds a differing line, the result is `failed`. The last line of standard output parses as `kaal-foundation-check {json}` | A check that skips lines it cannot read and reports `verified` |
| foundation/T39 | Intent | foundation/I9, foundation/F23: a fixture consumer that declares the dependency and holds a verifying copy, run with no list, is `verified` with `scope` `["resolution"]`, `observations.resolution` `verified` and `observations.digests` `not checked`. The JSON names the consumer's name and version and the resolved copy's version, and `verification` is `verified` | Today's command, which has no `boundary` |
| foundation/T40 | Requirements | foundation/F23: each of these gives its result. A consumer without the dependency gives `cannot verify` with cause `not a consumer`. A declared but missing copy gives `cannot verify` with cause `unresolved`. A resolved copy with a changed document gives the resolved copy's own `cannot verify`. A resolved copy whose library answers wrongly, with its manifest rewritten to match, gives `failed`. A verifying copy with a differing list gives `failed` | A boundary that verifies the copy it runs from instead of the copy the consumer resolves |
| foundation/T41 | Architecture | foundation/N13: a fixture consumer whose main module, `postinstall` and `test` scripts each write a marker file, and whose source holds its own `createHash("sha256")`, is still `verified` with an agreeing list. No marker exists afterwards | A boundary that imports the consumer, runs its scripts, or judges its source |
| foundation/T42 | Requirements | foundation/F24, foundation/N14: the installed `references/operations.md`, the skill and `AGENTS.md` name `check` and `boundary` by the scoped bin's path, and never as `npx`. `scripts/boundary.mjs` imports only `node:` modules and `./sha256.mjs`. `scripts/sha256.mjs` and `scripts/sha256.d.ts` keep their `main` digests, and the package declares no dependency | Today's documents, which name neither command |
| foundation/T45 | Intent | foundation/I9, foundation/F23: the two observations stay distinct. For one verifying consumer: with no list, `digests` is `not checked`, `check` is `null`, `scope` excludes `digests`, and the summary says `digest agreement: not checked` and never `digests verified`. With an agreeing list, `scope` holds both and `digests` is `verified`. With a differing list, `resolution` stays `verified`, `digests` is `failed`, and the result is `failed`. With a wrong resolved library and an agreeing list, `resolution` is `failed`, `digests` stays `verified`, and the result is `failed`. Every summary line states that the result does not certify the consumer | A boundary that reports `digests: verified`, or one combined flag, when no list ran; or that lets one observation's result overwrite the other's |
| foundation/T52 | Requirements | foundation/F25: the shipped package holds `dist/test/boundary-check/boundary-check.md`. It names `check`, `boundary`, `kaal-hosting-boundary`, both axes, and the limits of `verified`; it never says the check is "not applicable" | Today's package, whose `boundary-check` folder is empty and declares nothing |
| foundation/T53 | Architecture | foundation/F25, foundation/N13: Hosting's scan run on the shipped `dist/` reads every JavaScript source and reports `result: complete` with no findings. If Hosting cannot be resolved the case is `cannot judge`, never a skip or a pass. It runs in the repository's publisher lane only; it does not ship | A Foundation that decides by platform, or a scan that silently read nothing. A control: GREEN before and after the DO |
| foundation/T54 | Requirements | foundation/F25: the shipped `dist/test/boundary-check/scan.mjs` runs, prints a last line `kaal-foundation-scan {json}` that holds Hosting's result for `dist/`, and exits 0 on a `complete` scan with no findings. With Hosting unresolvable it exits 2 with `cannot verify`, never 0 | Today's package, which ships no scan script; or a script that exits 0 when Hosting is missing |

T37, T39 and T45 are Intent-level. T52, T53 and T54 are Foundation's own Boundary Check record, its scan script and its peer evidence. They assert only outcomes a consumer sees, and they survive any solution the DO picks. T38, T40 and T42 pin the Requirements. T41 is the boundary's Architecture: it keeps the boundary at the outer loop.

## Delivered cases

The DO adds these beside their Nodes, in `05-src/skills/kaal-foundation/scripts/`, as the layout of foundation/C20 puts embedded Cases. They ship and run in every installation, on fixtures they create in a temporary directory.

An embedded case never makes `boundary` run a resolved copy's `verify`. Every installation's verification runs all embedded cases, so a case that resolved this installed copy would run itself again without end. The full self-resolution case, `verified` on a copy the consumer resolves, is foundation/T39 in `04-test/engineering-check/publisher/`, which does not ship.

| Test | Targets | Checks |
| --- | --- | --- |
| foundation/T43 | foundation/F22 | `check` on its own `sha256` output is `verified`, and on a changed file is `failed` |
| foundation/T44 | foundation/F23 | `boundary` on a package without the dependency is `cannot verify` with cause `not a consumer`, and on a consumer whose declared dependency is not installed is `cannot verify` with cause `unresolved`. Both branches end before any resolved copy runs, so the case cannot recurse |

## First consumer: Guard (measured 2026-10-31, before this PLAN)

An ad hoc probe ran Foundation 0.0.1 from npm against `@kaihacksai/kaal-guard` on `main` (0.0.4) and against 0.0.4 from npm. The probe is in the project's shared files, not in this repository. In both:
- Guard's `sha256` agreed with Foundation's on 14 vectors and on every packaged file.
- All 34 digests in Guard's `test/verify.json` equalled Foundation's.

Under this design, the same measurement is expected to give two results. `boundary` on Guard gives `cannot verify` (`not a consumer`), because Guard declares no dependency. `check` on Guard's stated digests gives `verified`. The DO records the actual run on its packed candidate as evidence.

## RED evidence

On `kaal/foundation`, nine of the ten planned cases are RED and T53 is a control that stays GREEN. The commands are missing, because `kaal-foundation check` and `kaal-foundation boundary` exit 2 with `unknown command`:
- T37, T39, T41 and T45 fail on their first behavioural assertion.
- T38 and T40 fail on the result line.
- T52 fails because `04-test/boundary-check/` holds no record.
- T54 fails because `scan.mjs` is not delivered.
- T53 is GREEN today (Hosting's scan of `dist/` reports no findings on 8 sources). It is a control: it stays GREEN and guards the evidence the record cites.
- T42 fails because the documents name neither command.

This is missing-deliverable evidence. It is planning evidence, not a behavioural RED. The DO shows the discriminating fixtures in the last column caught by a throwaway weaker reference.
