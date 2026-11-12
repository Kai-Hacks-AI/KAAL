# C14 change

## PLAN

1. Add I8, F18 and A41 with their Cases T172 to T176, and C14 with its own Cases T178 to T180, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The fallback has two chapters, Change and Because, as F18 states. Intent is absorbed by those two, Design stays in the files of the Change, and Verified by and Validated by stay with the checks and the reviews.
4. The fallback declares itself with `<!-- KAAL-PR-template: DEFAULT -->` on the first line of the single default file GitHub names, and has a leading comment that calls it the fallback. DEFAULT is a reserved identity and not a TYPE.
5. The Cases T173 to T176 read the template file. They are the contract that the wiring must satisfy, and they stay with this Change so that the wiring cannot weaken them. They fail until the file is wired.
6. The PLAN delivers no template, no checker and no enforcement, and cites no document that is not on `main`.

## Split (12 Nov amendment)

The Owner's rule: a capability lands first and its wiring into the host (GitHub, git hooks) lands after, as a separate Change with a separate PLAN and collector, to prevent weakening the contract to go green. The first PLAN of this Change held both. It is split:

- release/C14 (this Change, collector `kaal/release/fallback-template`): I8, F18, A41, G45 to G47 and the Cases T172 to T176 and T178 to T180.
- release/C15 (`wire fallback template`, collector `kaal/release/wire-fallback-template`): A42, the default template file, G48 and the Cases T177 and T181. It lands only after this Change is delivered at its current version.

The `.github` DO #1458 was delivered into the wiring collector before the split. Its PLAN is release/C15. The promotion #1461 is held.

## DO

1. SYNC `main` into the collector, then rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs`, by name, as release/C10 did. T173 to T176 assert the wired template and pass only once release/C15 has delivered it.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`. It lands in the collector before the promotion.

## GitHub behavior

- Confirmed: one default file may stand in the root, `docs/` or `.github/`; several templates stand in a `PULL_REQUEST_TEMPLATE/` directory and a person picks one with the `template` query parameter; GitHub reads templates from the default branch.
- Not confirmed: what the web UI shows when both exist and no `template` parameter is given. Nothing here depends on it.
- GitHub does not choose the best template. A pull request opened through the API gets no template. The fallback is used by policy, and any enforcement belongs to check PR Envelope (release/C12), which this Change does not touch.

## Dependencies

- release/C15 wires this capability into GitHub and comes after it. Its increment declares that it follows this collector.
- The contract with check PR Envelope (release/C12, #1435), confirmed with that Change, which implements it: the reader recognizes the fallback only when a default file, at GitHub's default locations and not inside `PULL_REQUEST_TEMPLATE/`, declares DEFAULT as its first line. A default file without the declaration is not the fallback: it is reported as a template that is not a KAAL template, an Owner decision point. The fallback is never in the registry, never judges a pull request and never takes precedence over a declared TYPE. DEFAULT is exact and upper-case. DEFAULT declared in a file inside `PULL_REQUEST_TEMPLATE/`, declared twice or declared by a specialized template, and two default files at once, are findings on the template set. A title whose TYPE is DEFAULT is unsupported. This Change adds no code to the reader.
- The specialized templates stay as they are.
