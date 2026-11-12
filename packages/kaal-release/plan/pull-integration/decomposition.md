# Pull Promotion and Analyze Flow: the proposed decomposition

Status: **proposal for CPO alignment.** Nothing here is implemented, and the integration DO (`pull/C2`) does not start on it. It answers the CPO's direction of 12 Nov 2026: Pull Promotion must not depend on Analyze Flow, neither on its findings nor on its supplier as an Analyze-Flow-owned component; what the two genuinely share is carved out into independently owned elements that both consume as peers.

## 1. Two questions, two models

| | Analyze Flow | Pull Promotion |
| --- | --- | --- |
| Question | Where is the work in the chain, now? | Looking from `main` upstream, is this collector eligible to be promoted? |
| Output | A point-in-time overview: findings and next actions along the chain. | A judgment per collector: READY, BLOCKED or NOT JUDGED, traced to the owning control. |
| Owns | The flow, the lane and the actions. | The readiness judgments and their allocation to controls. |

Neither owns the other's model or contract. Where today they touch, they touch by coupling, not by a shared contract:

- **The capability as merged (`pull/C1`) is coupled to Analyze Flow.** `pull/F3` says the Script reads only the fields of `coordination/F2` (facts) and `coordination/F4` (findings); `pull/T10` enforces it; `lane.active`, the findings' actions and `flow.notJudged` are read from Analyze Flow's output. The Script imports no code of it, but it depends on its data contracts, which Analyze Flow owns. That is the dependency to remove, and it concerns the capability as well as the integration.
- **The integration as planned (`pull/C2`) reuses Analyze Flow's supplier** (`gather`), which is Analyze Flow's own component. Reusing it would make Pull Promotion depend on Analyze Flow's delivery and leave Analyze Flow owning the host mapping.

## 2. What is genuinely shared

| Shared concern | Why it is shared | Not shared |
| --- | --- | --- |
| **Host observations**: the neutral description of what the host shows (pieces, collectors, deliveries with landing times and provenance, checks, reviews, merge state, the explicit gaps) | Both models start from the same observed facts. | How either interprets them. |
| **Host access**: reading the host read-only, with explicit authentication and an audit of every request | One reader, one read-only claim, one place to prove it. | Any decision. |
| **Normalization**: mapping host data to the observation contract (template type from the title, Change id from the body, fit, landing time) | Duplicating it creates two mappings that drift. | The vocabulary of either consumer. |
| **Gaps as data**: a gap is `{ subject, missing }` with an optional, machine-readable `affects`, never prose | The prose gaps of today forced Pull Promotion to guess relevance (`pull/F19`). | What a gap means for a judgment: that stays the consumer's rule. |
| **The declaration's common part**: the target, the declared template types, the roles | Both read the same repository record. | The consumer's own sections (Analyze Flow: pairs, policy; Pull Promotion: `readiness`). |

Not shared, each owned by its consumer: Analyze Flow's lane, findings and actions; Pull Promotion's judgments, check ownership, lifecycle rule, dependencies and `gapRules`.

## 3. The proposed elements, ownership and dependencies

```
                 host observation contract  (neutral, host-independent)
                          ^                ^
        consumes          |                |          consumes
   Analyze Flow ----------+                +---------- Pull Promotion
   (flow, lane, actions)                               (readiness judgments)
                          ^                ^
        GitHub observer (reader + normalizer, KAAL delivery) implements the contract
                                   ^
                      integration commands (one per consumer, run by hand)
                                   ^
                      wiring (hook or CI trigger): separate, future
```

| Element | Proposed owner and place | Depends on | Contract and Cases |
| --- | --- | --- | --- |
| **E1. Observation contract** | A new neutral capability, **host observation** (name for the CPO to choose), in the `kaal-release` Skill's neighbourhood but owned by neither consumer: a reference and a validator script (read-only, built-ins only). | Nothing. | The schema, the gap shape, the normalization rules as requirements; Cases check a document against it and fail on prose gaps and on missing landing time. |
| **E2. GitHub observer** | KAAL's Delivery, `engineering/release-management/05-src/host-observation/`: the read-only reader (explicit credential, request audit, snapshot of host state: today's `pull/F15` and `F16`) and the normalizer to E1. | E1. | Cases on recorded host responses prove the mapping, and a live Case on the real repository proves the host, as `coordination/T22` and `pull/T14` do today. |
| **Analyze Flow** | Unchanged owner. Re-bases its input on E1 and drops its private supplier in favour of E2. | E1, E2. | Its own Change, which it owns. |
| **Pull Promotion (capability)** | Unchanged owner. Re-bases its input on E1 and drops its use of Analyze Flow's findings (see 4). | E1. | Its own Change (`pull/C3`, proposed). |
| **Pull Promotion (integration)** | `pull/C2`, narrowed: the command that runs E2 and the capability. No host mapping of its own. | E2 and the re-based capability. | `pull/T14`, `pull/T18` revised. |
| **Wiring** | A future Change. | The integrated command. | Not planned. |

The coupling is not relocated under a new name: E1 has no consumer among its owners, it imports nothing of either, and each consumer's contract mentions E1 and never the other.

## 4. What changes for Pull Promotion

The capability reads from E1 what it reads from Analyze Flow today, and computes by itself what it takes from the findings:

- **Turn and WIP.** Whether another promotion is in flight is read from the observations (open PROMOTION pieces and the declared limit), not from `lane.active`. Whose turn it is in the chain stays Analyze Flow's question; Pull Promotion states only whether the collector is eligible and whether a promotion is already open.
- **Next step.** It recommends from its own judgment and the declared holds: a hold gives WAIT and escalate; READY gives "eligible to open a promotion"; anything else names what to revise or what evidence is missing. It stops echoing an Analyze Flow finding (`pull/T8` is reworked to the holds).
- **Gaps.** Structured by E1, so `pull/F19`'s prose rule shrinks to a fallback for foreign input and a declared `affects` becomes the normal path.
- **Analyze Flow's `flow` argument disappears** from `pullPromotion(facts, declaration, collector)`. `pull/F3` and `pull/T10` change from "reads only Analyze Flow's fields" to "reads only the observation contract's fields".

## 5. Delivery order and the Changes it needs

1. **E1, the observation contract** (own Change: PLAN, DO, ACT, own collector). It has no dependency, so it goes first, and nothing below can be accepted before it.
2. **E2, the GitHub observer** (own Change). It needs E1. Analyze Flow's supplier (#1476) is its starting point only in the sense that the mapping is extracted and re-owned: the extraction is a Change of E2's owner and Analyze Flow's owner together, never a copy. The Analyze Flow thread and the CPO decide whether #1476 lands first and is migrated, or is held until E2 exists.
3. **`pull/C3`, the capability re-based on E1** (own Change). It needs E1 and amends the merged `pull/C1` contract: F3, T8, T10, F19.
4. **`pull/C2`, the integration** (this PLAN, narrowed). It needs E2 and `pull/C3`.
5. **Wiring**: separate, later.

Analyze Flow's own re-basing on E1 and E2 is its Change and its schedule, not a precondition of the above.

## 6. Decisions for the CPO

1. The decomposition itself: E1 and E2 as separate elements, and `pull/C3` as the capability's re-basing.
2. Who owns E1 and where it lives (recommendation: a neutral capability, not inside either consumer, with the contract in a neutral place and the GitHub observer in KAAL's Delivery).
3. What happens to #1476's supplier: land and migrate, or hold for E2 (recommendation: hold the supplier's part until E1 is accepted, so it is not built twice; the Analyze Flow thread says whether that is possible).
4. Whether `pull/C1` stays "done" while `pull/C3` amends it. Recommendation: yes, its record is accurate for what shipped, and `pull/C3` is a new Change with its own ACT.

## 7. Cost of this decomposition

Two further Changes before the integration (E1 and E2), one amendment of the merged capability, and a rework of its Cases T8, T10 and F19's. The integration waits for all of them. The reason to pay it is that the alternative couples two models through a supplier that only one of them owns.
