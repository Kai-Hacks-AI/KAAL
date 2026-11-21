# Hold adapter: Evidence

Run on `main` at `0226dc86` with Node 22.23 (the sandbox has no Node 24).

## RED on main

`node --test packages/kaal-testing/test/plan/hold-adapter.test.mjs`: 7 tests, 0 pass, 7 fail, each by assertion. `T384`–`T387`, `T389` and `T390` fail on `missing: …/lib/cases.mjs`, and `T388` on the missing `observe` command. None is a load error.

## The Cases can pass

A throwaway reference (about 70 lines, kept outside the repository and not part of this PLAN) was put in place of `lib/cases.mjs`, `lib/observe.mjs` and the `observe` branch of the bin, with the two exports added to `package.json`. With it, `T384`–`T387`, `T389` and `T390` pass and `T388` passes every assertion up to its last, the Node major, which fails on Node 22 as described in `testing.md`. The reference was then removed. Writing it corrected two of the Cases and one Requirement before this PLAN went up: a problem in one file must not make another file's Case UNKNOWN (F160), and the evidence's `reason` must always be a string (T387).

## The present reading of Case ids

On `main`, `grep -rE "^export const id = \"" --include='T*.mjs'` finds 36 Case files, and `grep -rE "^export const id = '"` finds 504. Release's `applicableCases` reads `export const id = '([^']+)'` and so does not see the 36, among them every Case of the open `kaal/testing/multi-loop-sensitivity` collector (`T381`–`T383`). That is the evidence for the F158 reading of both quote forms and for the alignment named in the Architecture.

## The DO (`testing/C74`), run

`lib/cases.mjs`, `lib/observe.mjs`, the `observe` command, the two exports and the README section are in. `T384` to `T390` pass against them. On this sandbox (Node 22.23) `T388` and `T369` stop at their Node 24 assertion, which is last in each; run under a shim that reports Node 24 both pass, so every assertion before it holds. The rest of `npm test -w kaal-testing` passes (105 of 107), and `engineering/contracts/measure.test.mjs` passes (7 of 7) with the README quote and the pin of `boundary.test.mjs` updated.

**Found in the DO, and the choice made.** The catalog must walk a checkout synchronously and past the links to directories that every `node_modules` holds. Hosting reads asynchronously and refuses such a link, so `lib/cases.mjs` reads `node:fs` (read-only) and the boundary Case inspects it on its own. The alternative is a Hosting Change that lists a tree without those links, then an asynchronous catalog and `await` in `T384` to `T390`. The exception is written in `architecture.md` (A54), the README and the boundary Case, and ends with that Change.
