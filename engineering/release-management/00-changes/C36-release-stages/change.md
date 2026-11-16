# C36 change

## PLAN (revised 16 Nov after the CPO product review of 6f34109)

1. Define the abstract concept for a consumer of `kaal-release`, in three layers. The Skill teaches the Stage vocabulary (F54). The consumer declares and configures its Stages as plain files in `.kaal/config/release/`, following the Guard pattern, with logical destinations and gate identities and no platform data. A binding realizes the declaration on a platform and holds all platform data; it is a later Change.
2. **Vocabulary aligned with release/C35.** The example uses C35's activities: Developing; Integrating with the parts Collecting, Hotfixing and Wiring; Promoting; Publishing. No competing Development, Integration or Promotion model is introduced.
3. **Logical identities, platform data in bindings.** `target: main` and the check name `Promotion-Source` are removed from the example. A Stage file names a logical `destination` and logical `gates`; the binding draft in `interface.md` shows where `main`, patterns and check names live. The judge rejects platform data in a Stage file, paths and glob patterns included.
4. **`routes` replaced by `parts`, defined for a pure judge.** A part is a named alternate incoming path into its Stage; every part passes the Stage's gates. It is not a Stage and not a predecessor (predecessors follow from `order`). Checks: part names are non-empty, unique within the Stage and across the declaration, and never a Stage name.
5. **Structure is not authorization.** The result is `structure: SOUND | UNSOUND` with `authorization`, `readiness` and `bindingCoverage` always UNKNOWN. There is no `valid` or `ready` boolean.
6. Add I26, F54, A50, the gap G68 and four Cases, all RED on `main`.
   - T500 (judge): `05-src/stage-declaration/declaration-judge.mjs` finds a well-formed set sound and an incomplete, duplicate or unconnected one unsound (duplicate name or order, missing key, unknown authority or transition, empty gate, a part that repeats or is named like a Stage), and for a sound set still reports authorization, readiness and binding coverage UNKNOWN with no boolean `valid` or `ready`.
   - T501 (neutrality): the judge rejects a Stage file that holds platform data: a platform, tool or registry word, a path or a glob pattern.
   - T502 (instance): KAAL's activities in C35's names exist as an example set in `05-src/stage-declaration/instance/`, with Collecting, Hotfixing and Wiring as parts of Integrating, free of platform data, and the judge finds it sound.
   - T503 (vocabulary): the Skill vocabulary reference `05-src/stage-declaration/reference.md` equals the draft in `interface.md`, states every term of the concept, and names no platform.
7. Plain configuration files follow the Guard pattern and no Core Node is added; whether Stages should be a Node type is left open for the Owner.
8. The PLAN installs nothing in `.kaal/`, adds no binding, wires no workflow, hook or ruleset, delivers nothing into `packages/kaal-release`, bumps no version and publishes nothing.

## Relation to other Changes

It reuses the separation of release/C32 and states the same activities as release/C35, whose `05-src/stages/stages.json` is KAAL's GitHub-bound declaration of them; reconciling the two is a later Change. It builds on no ruleset source (release/C34, C35). Ids: C36, I26, F54, A50 and G68 were allocated by the coordinator; T500 to T503 come from the block T500 to T509.

## DO

1. In the collector `kaal/release/stages`: `05-src/stage-declaration/declaration-judge.mjs`, `reference.md` and the example set `instance/`. T500 to T503 are renamed to `.test.mjs` when green.

## ACT

A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`, before the promotion.

## Not in this Change

A GitHub or githooks binding, installing Stages into `.kaal/`, delivering the reference or judge into the package, a Core Node type for Stages, reconciling with C35's `stages.json`, the publication-readiness gate, version bumps and publication.
