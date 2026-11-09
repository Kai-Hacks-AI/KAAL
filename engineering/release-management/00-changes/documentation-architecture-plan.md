# Documentation architecture of Release management: Solution, Delivery, Change (PLAN)

PLAN, nothing is moved by this Change. CPO finding and direction, 9 Nov; normative rule confirmed by the Owner, 9 Nov.

## The rule (normative)

| Architecture | Describes |
| --- | --- |
| Solution | **B**, the target product |
| Delivery | **B**, the target delivery system |
| Change | **A → B**, the transformation from current to target |

Solution and Delivery define B independently of how it is reached. Change owns A (the current state), the differences between A and B (gaps), the transition sequence, the interim states, the temporary requirements and their termination, and the evidence that B has been reached. **Change references the target architecture by id; it never duplicates or redefines it.** A reader who wants B reads only Solution and Delivery; a reader who wants the route reads Change, which points into B.

B is the persistent intent; a Change is disposable. Each Change entry names the B id (requirement, component, control target) it serves and ends when that B's Case is green, so the intended idea survives every Change and drives the next one.

## Finding

The root documents mix the three. The release-management documents state B and A together (`Exists`, `Gaps`, `Today's code`, `Retires`), and the README and architecture carry the migration sequence and the shim rule. The example is `publish.yml` (B) beside `release.yml` (A): the transition between them is Change.

## Placement (every statement keeps its home or moves, possibly reworded; no decision is lost)

Solution here is thin: the consumer-visible promise. Release management is Engineering's Delivery architecture (I4), so most of B is Delivery.

| Today, where | Concern | Goes to |
| --- | --- | --- |
| I1, I4 (stations, Delivery changes independently) | Delivery | stays in `01-intent` |
| I2, I5, I6, I7 (what a consumer installs is what `main` promoted) | Solution (consumer-visible) with Delivery controls under it | stays in `01-intent`, each tagged Solution or Delivery |
| I3 (Engineering owns it until a better owner) | Delivery (ownership) | stays |
| Requirements F1 to F18 (the rule of each control) | Delivery (F2 and F3's consumer-visible half: Solution) | stay in `02-requirements`, written as target only |
| `Exists:` and `Gaps:` lines (F1 to F3; G1 to G11), `Target (set by ...)` lines | Change (A, A→B) | `00-changes/current-state.md` (A) and `00-changes/gaps.md` (A→B); each gap names the target requirement it differs from |
| "Verified against `main` at 251e814", Evidence status table | Change (evidence about A) | `00-changes/current-state.md` |
| "Today's code" column of the component table; "Today (code, check)" and "Retires" columns of the control table | Change (A, A→B) | `00-changes/transformation.md`, one row per control, with the component and control target as references into `03-architecture` |
| Components, controls, control targets, allocation, naming map, trust root, gate specification, queue, pins | Delivery (B) | stay in `03-architecture`, target only |
| "Path to `main`" steps 1 to 8, "Conditions before promotion", "Retiring `Change Isolation (review)`", "Build order", "Open for the Owner" | Change (sequence, conditions, evidence) | `00-changes/transformation.md` and `00-changes/README.md`; the README keeps layout and the loop only |
| The migration element, the shim rule, F20, T12, T13 | Change (temporary, with termination) | `00-changes/` (F20 stays in `change-requirements.md`; the shim rule moves from `03-architecture` to it; T12 and T13 are Change Cases) |
| F18 "Interim" paragraph, T9's "interim, marked temporary" wording, the interim reading `far.json` | Change (interim state) | `00-changes/interim-states.md`, each interim with its `ends when` and the target requirement it stands in for |
| Cases T1 to T10 (standing) | Delivery | stay in `04-test` |
| T11 (the engine lives in `05-src`; old path holds shims) | Change (placement during migration) | `00-changes/`, Case T11 split: the standing half (the engine lives in `05-src/release-engine/`) stays in `04-test`, the shim half is Change |

Open for the Owner: whether T12 and T13 move into `00-changes/` now, as the Change Case lifecycle design proposes (a separate thread owns that design; the move is the same one and is done once, here).

## Traceability (a coherent chain per concern)

- **Solution/Delivery chain (B):** Intent → Requirement → Architecture (component, control, control target) → Case → Implementation. Each hop is an id reference already in the records; nothing in the chain mentions A.
- **Change chain (A→B):** Change Intent (reach B for control X) → current-state entry (A) → gap (names the target requirement id and the Case that will turn green) → transformation step (names the Change, its PR and the component) → completion criterion (the target Case green, and the temporary requirement's `ends when`). Every Change entry names its target id; none restates the target text.
- **Existing Change records stay traceable:** #1323 to #1326 and their records under `.kaal/changes/engineering/26/11/09/05` to `08` are listed in `transformation.md` against the control they moved, with the requirement and Case they serve.

## Acceptance criteria and their Cases (RED first)

| # | Criterion | Case (RED until DO) |
| --- | --- | --- |
| 1 | Delivery documentation describes the target consistently | `01-intent` to `04-test` and the README contain no `Exists`, `Gap`, `Today`, `Retires`, `release.yml` (as a current file) or migration step; read with the Markdown parser by heading and list item, not text search |
| 2 | Current-state observations and gaps are distinguished from target requirements | every gap and current-state entry in `00-changes/` carries a target id that resolves to a requirement or component in the root documents |
| 3 | Migration requirements, including F20, belong to Change | F20 and its Cases resolve only under `00-changes/` |
| 4 | Temporary mechanisms have termination conditions | every shim, interim and temporary requirement has an `ends when` that a parser can read |
| 5 | Nothing is lost | the set of ids (I, F, G, T, A) and the set of decisions before the Change equals the set after, each found exactly once; checked against the list captured at RED |
| 6 | Existing Changes stay traceable | each of #1323 to #1326 is listed against a control, requirement and Case, all of which resolve |
| 7 | Change duplicates no target text | no paragraph of a `00-changes` document equals a paragraph of a root document (compared as parsed text) |

These Cases are Delivery Cases about the documents; they sit with the documents, and the parsers already in Engineering (Markdown AST, YAML) are used. No new parser.

## Sequence

1. This PLAN, CPO review, merge into the collector. A landed PLAN is a go.
2. RED: the Cases above, failing against today's documents, and the captured id list.
3. DO: make each document clean, by moving, rewriting or a mix (Owner, 9 Nov: the result must be clean, the method is free). A rewrite may reword a statement to remove current-state phrasing, but every id, decision, requirement and Case keeps its meaning and appears exactly once (criterion 5). Documents only, no code, no `.github`.
4. The Change record for `.kaal/changes/engineering/` and the transformation table list #1323 to #1327.

## Not in this Change

Any change of a decision, requirement, Case, control, name or implementation; `.github`; the Change-suite phase control and `ends when` for F20 (the Change Case lifecycle design, taken after this Change so it lands on the corrected structure); promotion into `main`.
