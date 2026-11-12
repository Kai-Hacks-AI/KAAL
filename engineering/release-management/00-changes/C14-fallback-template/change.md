# C14 change

## PLAN

1. Add I8, F18 and A41 with their Cases T172 to T176, and C14 with its own Cases T178 to T180, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The fallback has two chapters, Change and Because, as F18 states. Intent is absorbed by those two, Design stays in the files of the Change, and Verified by and Validated by stay with the checks and the reviews.
4. The fallback declares itself with `<!-- KAAL-PR-template: DEFAULT -->` on the first line of its text, and has a leading comment that calls it the fallback. DEFAULT is a reserved identity and not a TYPE.
5. The text lives in this Change as `03-architecture/A41-fallback-template/fallback-template.md`. The Cases T173 to T176 read that file, not `.github`. The capability is complete when they are green, whatever the host does.
6. The PLAN delivers no template text, no checker and no enforcement, and cites no document that is not on `main`.

## Split (12 Nov amendment)

A capability lands first and its wiring into the host lands after, as a separate Change with its own PLAN and collector, to prevent weakening the contract to go green.

- release/C14 (this Change, collector `kaal/release/fallback-template`): I8, F18, A41 with `fallback-template.md`, G45 to G47 and the Cases T172 to T176 and T178 to T180. Nothing here depends on the wiring, so this Change completes on its own.
- release/C15 (`wire fallback template`, collector `kaal/release/wire-fallback-template`): the deployment target A42, the installed default template, G48, and its own PLAN with its own Cases. It lands only after this Change is delivered, and verifies its installation against the fixed text of this Change.

An earlier version of this PLAN read the wired `.github` file in T173 to T176, which made this Change complete only after the wiring and the wiring complete only after this Change. That circle is removed: A42, T177 and the C15 documents leave this collector.

## DO

1. SYNC `main` into the collector, add `fallback-template.md`, and rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs`, by name, as release/C10 did. They are green with the text and need nothing outside this collector.

## Check

The Cases T172 to T176 and T178 to T180 are run by hand with Node 22 over the collector and are all green. The manual execution is to copy `fallback-template.md` into a pull request body.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`. It lands in the collector before the promotion.

## GitHub behavior

GitHub reads a default template from the default branch, in the root, `docs/` or `.github/`. A pull request opened through the API gets no template. This Change touches none of that: it holds the text and the contract only. What GitHub does with the text, and what is only policy, is stated and tested in release/C15.

## Dependencies

- release/C15 wires this capability into GitHub and comes after it. Its increment declares that it follows this collector.
- The contract with check PR Envelope (release/C12, #1435), confirmed with that Change, which implements it: the reader recognizes the fallback only when a default file, at GitHub's default locations and not inside `PULL_REQUEST_TEMPLATE/`, declares DEFAULT as its first line. A default file without the declaration is not the fallback: it is reported as a template that is not a KAAL template, an Owner decision point. The fallback is never in the registry, never judges a pull request and never takes precedence over a declared TYPE. DEFAULT is exact and upper-case. DEFAULT declared in a file inside `PULL_REQUEST_TEMPLATE/`, declared twice or declared by a specialized template, and two default files at once, are findings on the template set. A title whose TYPE is DEFAULT is unsupported. This Change adds no code to the reader.
- The specialized templates stay as they are.
