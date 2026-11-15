# C33 baseline

Investigation on `main` at 7acb6d41, 15 Nov 2026.

## Templates

- Installed in `.github/`: `PULL_REQUEST_TEMPLATE/{plan,do,act,sync,promotion,hotfix}.md` and `pull_request_template.md` (the older Intent / Design / Verified by default, undeclared). WIRE has no installed template: its source is `engineering/release-management/05-src/wiring/templates/wire.md` and its bootstrap install is a separate, authorized step.
- Engineering sources: `sync-template.md` (A34) and `fallback-template.md` (A41, DEFAULT as capability text) on `main`; the plan, do, act, promotion and default sources are release/C25 (collector `kaal/release/wire-envelope-cue-engineering`, promotion #1683, waiting for the seat). The hotfix source is `03-architecture/A36-create-hotfix/` with its GitHub deployment A39.
- The chapters of a type are derived from the base template by `05-src/plan-body/templates.mjs`; the envelope judge (`envelope.mjs`, `check.mjs`) compares a body with them. The interfaces F3, F10, F11, F14, F15, F16, F18 and F22 each say "exactly N chapters and nothing else".

## Mnemonics today

- HOW: "Human Observes Work", the first word of the Definition `HOW ARE WE DOING?`, in `packages/kaal-review/payload/HOW-ARE-WE-DOING.md`. Review owns it. It is not deployed into `.kaal/` in this repository, so no `.kaal/` path resolves it today.
- TO ("Testing Orchestrated") and WORK ("Worker, Owner, Reviewer, Knowledge"): defined nowhere on `main` or in any branch. Related, not equal: ROWING (Review; the Owner holds the target and stays out of the stroke), VIVA AQUA (`engineering/VIVA-AQUA.md`; verification belongs to Testing and validation to Review) and TOGETHER WE CAN GO FAR.

## Existing work and review expectations, per type

PLAN: F2, F3, "a PLAN is a PLAN only when its Cases run RED". DO: F11, the Cases turn green, `.red` becomes `.test`. ACT: F10, the 4L retrospective. SYNC: F14 and `engineering/github/branching.md#synchronize`. PROMOTION: F15 and Pull Promotion (`05-src/pull-promotion/`, advisory). HOTFIX: F16 and A36. WIRE: F22 and A47. DEFAULT: F18 and F19. Review as an activity is Review's (ROWING: independent, observed work, deterministic checks are evidence and never a replacement for judgment) and verification is Testing's (VIVA AQUA). No document tells a worker or a reviewer, per type, what to do first.

## Reference resolution today

`.kaal/` holds the Engine (`core/`, `config/guard/`, `changes/`) and no installed capability payload, so a reference to Review or Testing text cannot resolve through `.kaal/` yet. Everything referable today is under `engineering/`.
