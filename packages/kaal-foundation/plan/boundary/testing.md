# Consumer boundary: Testing

## Derivation

Each Foundation identifier is listed with its boundary form (see `intent.md`) and with the requirement that carries it.

| Foundation identifier | Loop | Boundary form | Boundary expectation | Carried by |
| --- | --- | --- | --- | --- |
| foundation/I1 one SHA-256 | Intent | mirror | the Foundation the consumer resolves is a verified Foundation | foundation/F21 |
| foundation/I2 no digest changes | Intent | mirror | every digest the consumer states is Foundation's digest of the same bytes | foundation/F20 |
| foundation/F1 FIPS 180-4 digest | Requirements | mirror | subsumed by I2: agreement with Foundation is agreement with FIPS | foundation/F20 |
| foundation/F2 a view's own bytes | Requirements | mirror | subsumed by I2, for the bytes the consumer names | foundation/F20 |
| foundation/F3 refuses non-bytes | Requirements | inverted | the consumer never relies on a refusal. This needs consumer code to run, so it is not judged here | the consumer's own tests |
| foundation/F12 installed verification | Requirements | mirror | the resolved copy's own verification is `verified` | foundation/F21 step 3 |
| foundation/F14, foundation/F18 command and acquisition | Requirements | inverted | the consumer runs Foundation by the scoped bin. That is visible only in the consumer's own documents, so it is not judged here | the consumer's own tests |
| foundation/I3–I7, foundation/F4–F11, foundation/F13, foundation/F15–F19 | Intent, Requirements | none | they are Foundation's own obligations | Foundation's own cases |
| foundation/N*, foundation/A* | Architecture | none | there is no outer boundary for placement | Foundation's own cases |

So the boundary is not "the same cases with opposite results". Two Intents are mirrored. A few Requirements fold into them. The inverted ones and every Architecture element stay out of reach of a check that knows nothing about the consumer.

## Publisher's planned cases

`test/plan/boundary.test.mjs` holds these planned cases. They are immutable to DO and CHECK. The DO moves the file unchanged to `test/publisher/` and runs it in `test:publisher`. Every fixture is built in a temporary directory. A fixture consumer gets its Foundation as a copy of the shipped files of this package, placed at `node_modules/@kaihacksai/kaal-foundation`, so no case needs npm or a network.

| Test | Loop | Checks | The fixture it must fail, naming the cause |
| --- | --- | --- | --- |
| foundation/T35 | Intent | foundation/I8, foundation/F20: a list that `kaal-foundation sha256` printed for two files is `verified`, exit 0, `checked` 2. Changing one file afterwards gives `failed`, exit 1, with cause `differs` for that file only | Today's command, which has no `check` |
| foundation/T36 | Requirements | foundation/F20: each of these is `cannot verify`, exit 2, with its cause: an empty list, a line with no two-space separator, a digest in uppercase or of 63 digits, and a missing file. If a list also holds a differing line, the result is `failed`. The last line of standard output parses as `kaal-foundation-check {json}` | A check that skips lines it cannot read and reports `verified` |
| foundation/T37 | Intent | foundation/I8, foundation/F21: a fixture consumer that declares the dependency and holds a verifying copy is `verified`. The JSON names the consumer's name and version and the resolved copy's version, and `verification` is `verified` | Today's command, which has no `boundary` |
| foundation/T38 | Requirements | foundation/F21: each of these gives its result. A consumer without the dependency gives `cannot verify` with cause `not a consumer`. A declared but missing copy gives `cannot verify` with cause `unresolved`. A resolved copy with a changed document gives the resolved copy's own `cannot verify`. A resolved copy whose library answers wrongly, with its manifest rewritten to match, gives `failed`. A verifying copy with a differing list gives `failed` | A boundary that verifies the copy it runs from instead of the copy the consumer resolves |
| foundation/T39 | Architecture | foundation/N11: a fixture consumer whose main module, `postinstall` and `test` scripts each write a marker file, and whose source holds its own `createHash("sha256")`, is still `verified` with an agreeing list. No marker exists afterwards | A boundary that imports the consumer, runs its scripts, or judges its source |
| foundation/T40 | Requirements | foundation/F22, foundation/N12: the installed `docs/operations.md`, the skill and `AGENTS.md` name `check` and `boundary` by the scoped bin's path, and never as `npx`. `lib/boundary.mjs` imports only `node:` modules and `./sha256.mjs`. `lib/sha256.mjs` and `lib/sha256.d.ts` keep their `main` digests, and the package declares no dependency | Today's documents, which name neither command |

T35 and T37 are Intent-level. They assert only outcomes a consumer sees, and they survive any solution the DO picks. T36, T38 and T40 pin the Requirements. T39 is the boundary's Architecture: it keeps the boundary at the outer loop.

## Delivered cases

The DO adds these to `test/embed/`. They ship and run in every installation, on fixtures they create in a temporary directory.

| Test | Targets | Checks |
| --- | --- | --- |
| foundation/T41 | foundation/F20 | `check` on its own `sha256` output is `verified`, and on a changed file is `failed` |
| foundation/T42 | foundation/F21 | `boundary` on a fixture consumer that resolves this installed copy is `verified`, and on a package without the dependency is `cannot verify` |

## First consumer: Guard (measured 2026-10-31, before this PLAN)

An ad hoc probe ran Foundation 0.0.1 from npm against `@kaihacksai/kaal-guard` on `main` (0.0.4) and against 0.0.4 from npm. The probe is in the project's shared files, not in this repository. In both:
- Guard's `sha256` agreed with Foundation's on 14 vectors and on every packaged file.
- All 34 digests in Guard's `test/verify.json` equalled Foundation's.

Under this design, the same measurement is expected to give two results. `boundary` on Guard gives `cannot verify` (`not a consumer`), because Guard declares no dependency. `check` on Guard's stated digests gives `verified`. The DO records the actual run on its packed candidate as evidence.

## RED evidence

On `kaal/foundation`, all six planned cases are RED, because `kaal-foundation check` and `kaal-foundation boundary` exit 2 with `unknown command`:
- T35, T37 and T39 fail on their first behavioural assertion.
- T36 and T38 fail on the result line.
- T40 fails because the documents name neither command.

This is missing-deliverable evidence. It is planning evidence, not a behavioural RED. The DO shows the discriminating fixtures in the last column caught by a throwaway weaker reference.
