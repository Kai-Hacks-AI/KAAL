# C17 change

## PLAN

1. Add C17 with its Case T181 for the gap. T181 compares the installed template with the fenced draft in `interface.md` of release/C11 byte for byte, so the installation cannot drift from the capability.
2. The Case is RED on `main` because the template is not installed.
3. The PLAN installs nothing and changes nothing of release/C11.

## DO

1. The template `.github/PULL_REQUEST_TEMPLATE/hotfix.md`, unchanged from the draft, travels alone in its own `.github` collector `kaal/release/wire-hotfix` and reaches `main` first, because Change Isolation keeps `.github` apart from engineering. This Change's engineering files travel in the collector `kaal/release/wire-hotfix-engineering` and reach `main` second. The DO is the Case renamed from `T181.red.mjs` to `T181.test.mjs` once the template is on `main` and the engineering collector is synchronized.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`. It lands in the collector before the promotion.

## Not in this Change

Hooks, workflows, required checks, ruleset changes, a checker of HOTFIX bodies, the delivery path of a Hotfix, the text and interface of the template, and the other templates.

## Dependencies

release/C11 comes first and is on `main`. The superseded collector `kaal/release/wire-hotfix-template` is deleted only after this one is green, and only with a go.
