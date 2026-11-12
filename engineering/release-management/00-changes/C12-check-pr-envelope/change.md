# C12 change

## PLAN

1. Rename I7 and A33 to check PR Envelope and widen their text, add F17 (shared rules, structure derived from declared templates, rules keyed by TYPE), add A40 template-reader, add the Cases T161, T162 and T164, and add C12 with its Case T163.
2. T161, T162, T163 and T164 are RED on `main`.

## DO

1. Add `05-src/plan-body/templates.mjs` (A40): it reads the templates of the base and derives the registry of types and their chapters from the declarations.
2. Add `05-src/plan-body/envelope.mjs` (A33): it takes title, body, base, head, commits and the registry as input, applies the shared rules, the structure of the declared template and the rows keyed by TYPE, and reports what it did not judge. It runs by hand and reads no git or GitHub.
3. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.

## Dependency: template declarations

The templates on `main` carry no declaration yet, and `.github` cannot ride with an engineering change. Each template gets its declaration in its own `.github` change, the PLAN template first. Until a template declares its TYPE, that TYPE is unsupported and the result says so. Adding a declaration to the PLAN template is not part of this Change.

## Staging and what is not judged

- Types are not a closed set. A TYPE is judged by structure as soon as a template that declares it is on `main`. A TYPE with no declared template is unsupported.
- Rules that cannot be derived from headings are rows keyed by TYPE. Only PLAN's `Change` shape is on `main`.
- The HOTFIX route is not judged here. It comes from the Hotfix delivery-path Change, not from the HOTFIX template.
- The `Driven-by` agreement is judged for PLAN, DO and ACT only, for the reason F17 gives.
- What a chapter must say stays with the requirements and Cases of its type.

## Promotion hold

Kai's hold stands: this Change is not promoted to `main` before the Hotfix route is known, which is the Hotfix delivery-path Change. The PLAN cites no document that is not on `main`.

## Decision on the commit subject

The PR title is the commit subject (Kai, 11 Nov). A squash merge takes it, so the old rule `<Area> <PHASE>: <concern>` is dropped and replaced by the title rule of F17. This Change does not check commit subjects separately.

Not in this Change: wiring, hooks, CI, merge blocking, a GitHub adapter that fetches pull request facts, and the declarations in the templates.
