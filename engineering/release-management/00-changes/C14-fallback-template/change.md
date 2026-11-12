# C14 change

## PLAN

1. Add I8, F18, A41 and A42 with their Cases T172 to T177, and C14 with its own Cases T178 to T180, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The fallback has two chapters, Change and Because, as F18 states. Intent is absorbed by those two, Design stays in the files of the Change, and Verified by and Validated by stay with the checks and the reviews.
4. The fallback identifies itself by the declaration `<!-- KAAL-PR-template: DEFAULT -->` on the first line of the single default file GitHub names, and by a leading comment that calls it the fallback. DEFAULT is a reserved identity and not a TYPE.
5. The PLAN delivers no template, no checker and no enforcement, and cites no document that is not on `main`.

## DO

1. Replace `.github/pull_request_template.md` with the two chapters of F18, as its own `.github` change on its own collector, because Change Isolation keeps `.github` apart from engineering.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green, and wire them where the other release management Cases run.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## GitHub behavior

- Confirmed: one default file may stand in the root, `docs/` or `.github/`; several templates stand in a `PULL_REQUEST_TEMPLATE/` directory and a person picks one with the `template` query parameter; GitHub reads templates from the default branch.
- Not confirmed: what the web UI shows when both exist and no `template` parameter is given. Nothing here depends on it.
- GitHub does not choose the best template. A pull request opened through the API gets no template. The fallback is used by policy, and any enforcement belongs to check PR Envelope (release/C12), which this Change does not touch.

## Dependencies

The contract with check PR Envelope (release/C12, #1435), confirmed with that Change, which implements it: the reader classifies a default file, at GitHub's default locations and not inside `PULL_REQUEST_TEMPLATE/`, that declares DEFAULT, or none, as the fallback, separate from specialized templates and from templates that are not KAAL templates; the fallback is never in the registry, never judges a pull request and never takes precedence over a declared TYPE; DEFAULT is exact and upper-case; DEFAULT declared in a file inside `PULL_REQUEST_TEMPLATE/`, declared twice or declared by a specialized template, and two default files at once, are findings on the template set; a title whose TYPE is DEFAULT is unsupported; a default file with no declaration stays the known default, reported as undeclared. This Change adds the declaration and its Cases and implements nothing in the reader. The specialized templates stay as they are.
