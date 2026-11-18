# engineering/C17 change

## From, to, because

- **From:** Guard runs the checks of a place that declares itself. A capability, an Engineering area or a Change with no `kaal-guard.json`, or one with no check, is not noticed.
- **To:** a detective control, `engineering/CTL1 verify Registration`, reports each place of a pull request (or of the whole repository) that has no valid registration. The control is data about the repository, not part of Guard.
- **Because:** the CPO accepted, at point 1 of the review of guard PLAN #1949, that registration is capability-driven and cannot be empty, and left the control for it to Engineering. The Owner confirmed that `engineering/<name>` is Solution and registers through its own `kaal-guard.json`.

## What the PLAN adds

`interface.md` (I1, F36 to F39, A1, CTL1), Cases T1022 to T1031 (all RED on `main`), `drafts/` (the check and the control, to be moved by the DO), and the registration of the area and of this Change folder, which the control itself would require.

## Not in this Change

- Putting the control in a ruleset or a workflow. That is a second, preventive control, a WIRE, and the Owner's decision; the control lands as implemented only.
- Whether a Solution pull request may touch Delivery assets (CTL16, release thread, point 2 of the same review). The control reads no Delivery list. If a declaration of Delivery locations appears, the control does not need it, because places are named by what they are.
- Registering the existing capabilities, areas and Changes. The whole-repository scope reports them. Each registers in its own Change.
- What a registered check does or whether it is green.

## Landing order

1. PLAN into the collector `kaal/engineering/registration`: this folder, T1022 to T1031 RED.
2. DO into the same collector: drafts become `engineering/registration/check.mjs` and the control; Cases GREEN.
3. ACT, then PROMOTION. Nothing under `.github` changes.

## Open questions for the Owner

1. **When is a Change closed?** A Change folder registers while it is open and the registration is removed when it closes (guard C143). The control needs a fact to tell the two apart. Recommendation: a Change folder that holds `act.md` is closed and is no place. Without it, the ACT pull request that removes the registration fails.
2. **Which areas count?** F36 counts every folder under `engineering/` and `packages/` that is not a file. Several `engineering/` folders hold research or reports. Recommendation: count them all; an area with nothing to run registers a check that says so, and the inventory shows how large that migration is before anything is enforced.
3. **Is "executable" only a non-empty `run`?** The control checks the declaration, not that the command exists, because Guard reports a command it cannot run and a check may be RED by design. Confirm.
