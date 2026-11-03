# Requirements ownership: Architecture

This is the map of existing work, and the boundaries it follows. It states no design. State is as of 2 November 2026 and comes from the git tree, manifests and PR titles. No test suite was re-run.

## Map of existing Requirements and traceability work

| Piece | Owner | State | Blocker or next step |
| --- | --- | --- | --- |
| Capability Node `Requirements`, Definition `Requirement` (#276, #553) | Requirements | Merged to `kaal/requirements` | SYNC, promotion and a publish, in that order (`requirements/F21`) |
| Optional composition with Architecture, `requirements/F1`–`F6` (#590) | Requirements | PLAN merged to the collector. No DO | Needs `architecture/C8` (#588, PLAN merged) and `architecture/C5` on `main` |
| Packaging readiness, `requirements/F7`–`F11`, `T9`–`T14` (#595, #603) | Requirements | PLAN and RED tests on the collector. `T13` deferred | `core/C29` contribution lifecycle, and the Hosting scoped rename |
| Traceable Requirements, `Serves`, `F12`–`F16` (#741) | Requirements | PLAN merged to the collector. No DO | Intent elements as Nodes (`intent/C1`, `C2` #748 on `kaal/intent`) |
| Intent elements as Nodes, the target of `Serves` | Intent (no thread) | DO merged to `kaal/intent` | Intent needs an owning thread |
| `Placement` Edges to Requirements (#588) | Architecture (no thread) | PLAN merged to `kaal/architecture` | Architecture needs an owning thread |
| `**<cap>/F<n>** [<cap>/I<n>]` bracket citations in 24 `requirements.md` files | Each consuming capability | On `main`, as prose | Moves to Nodes incrementally, in the Change that first states a Requirement as changed (`requirements/F15`). No bulk migration |
| Change Isolation by reverse traceability (#739, draft; #880 ledger on `main`) | Engineering, Change | Draft on fixtures | Needs the `Serves` Edges above to compute real impact |
| Test Case and dependency traces (#745, #746) | Testing, Packaging | PLAN, open | Their own owners |
| Defects in the Requirements loop (`requirements/F23`); `requirements/F10` and `T11` stand (`F24`) | `kaal-defect`, incubated in Testing, owns the Defect concept; Requirements owns the obligation; Testing owns RED evidence | Owner decided 2 Nov (21:21). No `kaal-defect` thread or Node yet | Testing thread to incubate `kaal-defect`; then align the Node wording with it |

## Boundaries

- Requirements owns the `Requirement` Definition, its identification rule and `Serves`. Intent owns what an Intent is and how it is identified. Architecture owns placement. Graph owns traversal. Testing owns whether a Requirement holds. Change carries Requirements without defining them. Engineering consumes them.
- Every trace is stated once, in the source's own Node, and the reverse is computed (`core/N15`). Requirements adds no reverse Edge.
- Traceability is not one linear chain. The traces Requirements and its neighbours state are `Serves` (Requirement → Intent) and `Placement` (Architecture decision → Requirement), each outgoing from its source and owned by the source's capability, with reverse views derived, never stored. Test Cases trace independently to Intent, Requirements, Architecture and Defects (Testing's). This PLAN invents no Code → Architecture hop and does not make one the backbone. Cross-capability coordination is Engineering's (#886, C2) and creates no owner of a whole.

## The loops

Intent, Requirements (functional, nonfunctional, Defect), Architecture and Code are loops, each answering the one above it in the Owner's concept. A loop is not a link in a chain. Test Cases trace to Intent, Requirements, Architecture and Defects independently, so a Case can be added when learning shows something new. It starts RED, and implementation answers it with GREEN. A GREEN result reflects current knowledge only. Requirements states only `Serves`; `kaal-defect` (in Testing) owns the Defect concept, bounded in `requirements/F23`.
