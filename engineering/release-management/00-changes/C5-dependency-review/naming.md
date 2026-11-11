# C5 naming

A proposal for the naming convention of checks, in domain language only. It is stated here because Dependency Review is the first control to need it, and the convention is the Owner's to accept.

| Thing | Convention | For this control |
| --- | --- | --- |
| Control | `<verb> <Subject>`, the verb being its class: guard (preventive), verify (detective), clear or drain (corrective), direct (directive) | verify Dependencies |
| Workflow of a control | the name of the control | `verify Dependencies`, file `verify-dependencies.yml` |
| Job of a control | the place it is applied at, in the boundary's own words | `Integration IN`, `Promotion IN` |
| Declaration of a control | the control's subject in the declaration folder | `.kaal/config/guard/Verify-Dependencies.md` |
| Aggregate of a place | `guard <Place>`, as workflow and as job | `guard Integration`, `guard Promotion` |
| Context in a ruleset | only an aggregate | none for this control |

What a person sees: `verify Dependencies / Integration IN` for the control's own view, and `guard / guard Integration` for the one check that admits. The list is expected to sort by "workflow / job", so all places of one control sit together; this is how GitHub shows checks and is observed in S3, not assumed.

The words Station, Gate and Hook name no check. The old name `Dependency Review` is dropped with the old workflow. No ruleset binds it, so the rename costs nothing.

## Proposed renames of what is live

Applied only on the Owner's go, and none by this PLAN. A ruleset name is matched by nothing in the repository (only plans and acceptance notes cite their ids), so renaming a ruleset is free. A required context is matched by name, so renaming one is a ruleset change and is made with the control it names.

| Live | Proposed | When |
| --- | --- | --- |
| ruleset `integration` (24952357) | `Integration IN` | on the Owner's go, with no other change |
| ruleset `promotion` (24951062) | `Promotion IN` | on the Owner's go, with no other change |
| ruleset `publishing` (26921478) | `Publishing IN` | on the Owner's go; the boundary name is the Owner's to confirm |
| contexts such as `Change Isolation`, `Branching`, `Promotion Source`, `Acceptance`, `Engineering`, `Workspaces`, `Hosting (Linux)` | `<verb> <Subject>` of each control, by its class | one at a time, each with its own MERIT migration, and then they leave the rulesets for the aggregates |
| the old `Dependency Review` | gone | with `dependency-review.yml` at S5 |

The aggregates `guard Integration` and `guard Promotion` are the only contexts a ruleset should end up listing.
