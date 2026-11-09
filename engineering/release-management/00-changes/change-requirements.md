# Change requirements of the migration (temporary, specific to this area)

These belong to the migration (`README.md` in this folder), not to the requirements in `../02-requirements` or the Cases in `../04-test` (Owner, 9 Nov: `00-changes` if specific to this area, global only if relevant globally). Each has an end, and the **terminate** Change deletes this file with the shims. Its Cases are in `cases.md`.

- **release-management/F20. A moved module keeps its old interface until its last caller is rewired, then the shim goes.**

  Rationale: I4, and the control-continuity condition in `transformation.md`. A change requirement, not a product requirement (Owner, 9 Nov): Delivery, not Solution, and temporary. It is placed by functional placement, like any requirement: allocated to the **migration** (the change process from the present controls to the target, `00-changes`), which owns it and ends it with its terminate step. There is no flag to maintain: temporary means owned by the migration and gone when the migration ends.

  When a Change moves a module into `05-src`, the old path keeps serving the module's whole old interface (every export and the command line) for as long as any caller still uses that path, and is removed afterwards, in its own Engineering Change, once its last caller has been rewired. The two cannot be one Change: the callers that live in `.github` (the workflow) travel alone (F6), while a shim lives in `engineering/`, so the rewiring Change comes first and the shim-removal Change follows it. A shim left at an old path is a full facade of the moved module, never a partial one: it re-exports everything (`export * from` the new path) and, where the module has a command line, calls the new module's `main`. Found by the CPO on #1324 (the first shim exported nothing); the gap was in the requirements and in the architecture's wording, not in the code. Checked by T12 for every shim.

  Target: I4, F6, `release-engine/`.

  Ends when: the last shim is removed, which T13 judges (the terminate Change, step 8 of the path to `main` in `transformation.md`). The shim Cases T12 and T14 run while a shim exists and are deleted with it.
