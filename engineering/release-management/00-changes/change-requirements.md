# Change requirements of the migration (temporary, specific to this area)

These belong to the migration (`README.md` in this folder), not to the standing requirements in `../02-requirements` or the standing Cases in `../04-test` (Owner, 9 Nov: `00-changes` if specific to this area, global only if relevant globally). The **terminate** Change deletes this file with the shims.

## A moved module keeps its old interface until its last caller is rewired, then the shim goes [release-management/F20]

Rationale: I4, and the control-continuity condition in the README. **A change requirement, not a product requirement (Owner, 9 Nov): Delivery, not Solution, and temporary.** It is placed by functional placement, like any requirement: allocated in `03-architecture` to the **migration** (the change process from the current controls to the new ones, `00-changes`), which owns it and ends it with its terminate step. There is no flag to maintain: temporary means owned by the migration and gone when the migration ends.

When a Change moves a module into `05-src`, the old path keeps serving the module's **whole** old interface (every export and the command line) for as long as any caller still uses that path, and is removed afterwards, in its own Engineering Change, once its last caller has been rewired. The two cannot be one Change: the callers that live in `.github` (the workflow) travel alone (F6), while a shim lives in `engineering/`, so the rewiring Change comes first and the shim-removal Change follows it. A shim is therefore a full facade (re-export plus the command line), never a partial one. Found by the CPO on #1324 (the first shim exported nothing); the gap was in the requirements and in the architecture's "one-line shim" wording, not in the code. Allocated to the shim rule in `03-architecture` and checked by T12 for every shim.

## Case

| release-management/T12 | F20 | for every shim left at an old path: its export names equal the moved module's export names (compared by import, not by text), and its command line behaves as the moved module's (same exit status and message for an unknown step) |

**Ends when:** the last shim is removed (the terminate Change, step 8 of the path to `main` in `../README.md`). The Case runs from `../05-src/release-engine/placement.test.mjs` while the shim exists and is deleted with it.
