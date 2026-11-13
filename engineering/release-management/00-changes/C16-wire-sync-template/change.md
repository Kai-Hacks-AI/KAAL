# C16 change

## PLAN

1. Add A37 with its Cases T116 and T117, and C16 with its Case T121 for the gap. T117 and T121 compare the installed template with `sync-template.md` of release/C9 byte for byte, so the installation cannot drift from the capability.
2. The Cases are RED until release/C9 is delivered, because the capability text is not yet on `main`, and until the template is installed.
3. The PLAN installs nothing and changes nothing of release/C9.

## DO

1. The template `.github/PULL_REQUEST_TEMPLATE/sync.md`, unchanged from release/C9, travels alone in its own `.github` collector `kaal/release/wire-sync` (delivered by #1443) and reaches `main` first, because Change Isolation keeps `.github` apart from engineering. This Change's engineering files travel in this collector, `kaal/release/wire-sync-engineering`, and reach `main` second. The DO is this PLAN's Cases renamed from `T<n>.red.mjs` to `T<n>.test.mjs` once the template is on `main` and this collector is synchronized.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`. It lands in the collector before the promotion.

## Not in this Change

Hooks, workflows, required checks, ruleset changes, a checker of SYNC bodies, the text and the interface of the SYNC template, and the other templates.

## Dependencies

release/C9 comes first. This Change follows it and installs its text unchanged.
