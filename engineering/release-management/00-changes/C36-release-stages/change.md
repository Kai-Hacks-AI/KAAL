# C36 change

## PLAN

1. Define the abstract concept for a consumer of `kaal-release`, in three layers. The Skill teaches the Stage vocabulary (F54). The consumer declares and configures its Stages as plain files in `.kaal/config/release/`, following the Guard pattern, with no platform term. A binding realizes the declaration on a platform and is a later Change. Release management as such is the first two layers; GitHub and githooks exist only in the third.
2. Add I26, F54, A50, the gap G68 and four Cases, all RED on `main`.
   - T500 (judge): the judge `05-src/stages/stage-judge.mjs` accepts a well-formed Stage set and rejects a duplicate name or order, a missing key, an unknown authority or transition, an empty gate, and a route naming an unknown Stage; it always reports `bindingCoverage: UNKNOWN`.
   - T501 (neutrality): the judge rejects a Stage file that names GitHub, githooks, git, npm, a ruleset, a branch or a workflow.
   - T502 (instance): KAAL's four Stages (Development, Integration, Promotion, Publishing) exist as an example set in `05-src/stages/instance/` and the judge accepts them. This ties the abstract concept to the real instance without moving any of it into the package.
   - T503 (vocabulary): the Skill vocabulary reference `05-src/stages/stages-reference.md` equals the draft in `interface.md`, states every term of the concept, and names no platform.
3. Plain configuration files follow the Guard pattern and no Core Node is added. Whether Stages should be a Node type is left open for the Owner.
4. The PLAN installs nothing in `.kaal/`, wires no workflow, hook or ruleset, delivers nothing into `packages/kaal-release`, bumps no version and publishes nothing.

## Relation to other Changes

It reuses the separation of release/C32 (scope completeness, product verification and publication readiness are separate gates) and builds on no ruleset source (release/C34, C35). It does not take over release/C35, which defines KAAL's own Engineering stages. Ids: C36, I26, F54, A50 and G68 were allocated by the coordinator; T500 to T503 come from the block T500 to T509.

## DO

1. In the collector `kaal/release/stages`: `05-src/stages/stage-judge.mjs`, `05-src/stages/stages-reference.md` and the example set `05-src/stages/instance/`. T500 to T503 are renamed to `.test.mjs` when green.

## ACT

A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`, before the promotion.

## Not in this Change

A GitHub or githooks binding, installing Stages into `.kaal/`, delivering the reference or judge into the package, a Core Node type for Stages, the publication-readiness gate, version bumps and publication.
