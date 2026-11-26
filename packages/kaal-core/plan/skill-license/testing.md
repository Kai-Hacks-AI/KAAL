# Skill License: Testing

The planned outer tests live in `packages/kaal-core/test/plan/skill-license.test.mjs`. They are immutable to DO and CHECK. The DO turns them GREEN and adds them to Core's `npm test`.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T125: a top-level `LICENSE`, `LICENSE.md` and `LICENSE.txt` are not layout findings, while a directory `LICENSE/`, `license`, `LICENSES` and `LICENSE-notes` still are | core/F117, core/A60 | Requirements |
| core/T126: the Definition states that a Skill may bundle a license file and that by default it is the package's license | core/F118, core/A61 | Requirements |

## Follow-up for each capability

Each Skill gets its package's `LICENSE` bundled at the top of its folder (MIT today, as the packages are). A Skill with no frontmatter `license` also gets `license: MIT`, or the value of its file. These are each capability's Changes, and none belongs to Core.

Skills with `license: MIT` and no file yet: architecture, controls, engineer-skill, engineering, graph, hosting, release, research, retro, review, testing. Skills with neither: change, foundation, guard, and Guard's delivery template.

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/skill-license.test.mjs`, outside Core's `npm test` until the DO. At `core/C151` both are RED: the layout reports every top-level `LICENSE*`, and the Definition does not mention it.
