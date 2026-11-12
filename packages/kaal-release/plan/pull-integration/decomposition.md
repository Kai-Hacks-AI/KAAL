# Pull Promotion and Analyze Flow: the proposed decomposition

Status: **revised after the CPO review of 12 Nov 2026 (direction agreed, not approved).** Nothing here is implemented, and no DO starts on it. Naming: Analyze Flow is being renamed **Show WIP** (CPO); this document uses "Show WIP (formerly Analyze Flow)" and keeps the old id scope `coordination/` where it cites it. It answers the CPO's direction of 12 Nov 2026: Pull Promotion must not depend on Analyze Flow, neither on its findings nor on its supplier as an Analyze-Flow-owned component; what the two genuinely share is carved out into independently owned elements that both consume as peers.

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
| **E1. Host observation (the contract)** | An explicitly owned, neutral shared architectural concern: its own component of the release-management architecture (`engineering/release-management/03-architecture/`), with its own owner role named by the CPO. Neither Show WIP nor Pull Promotion owns it, and it is **not** placed inside or beside `kaal-release` or either capability. The host-independent contract and its validator (read-only, built-ins only) are its own Delivery module, with its own Cases; E1's PLAN fixes the folder. | Nothing. | The schema, the gap shape, the normalization rules and the declaration's common part as requirements; Cases check a document against it and fail on prose gaps, on a missing landing time and on any field a consumer would have to invent. |
| **E2. GitHub observer** | Independently owned in KAAL's Delivery architecture, `engineering/release-management/05-src/host-observation/`: the read-only reader (explicit credential, request audit, snapshot of host state: today's `pull/F15` and `F16`) and the normalizer to E1. Owned by neither consumer. | E1. | Cases on recorded host responses prove the mapping, and a live Case on the real repository proves the host. The reader's read-only claim is proved here once, not per consumer. |
| **Show WIP (formerly Analyze Flow)** | Unchanged owner. Lands with its current supplier private to it, then migrates to E1 and E2 in an explicit later Change. | E1, E2 for the migration only. | Its own Changes, which it owns. |
| **Pull Promotion (capability)** | Unchanged owner. Re-bases its input on E1 and on the authoritative Release declaration, and drops its use of Show WIP's findings (see 4). | E1. | Its own Change (`pull/C3`). `pull/C1` stays as the accurate record of what shipped. |
| **Pull Promotion (integration)** | `pull/C2`, narrowed: the command that runs E2 and the capability. No host mapping of its own, and no use of any capability's private supplier. | E2 and the re-based capability (`pull/C3`). | `pull/T14`, `pull/T18` revised. |
| **Wiring** | A future Change. | The integrated command. | Not planned. |

The coupling is not relocated under a new name: E1 has no consumer among its owners, it imports nothing of either, and each consumer's contract mentions E1 and never the other.

## 4. What changes for Pull Promotion

The capability reads from E1 what it reads from Show WIP today, and decides by itself only what is its own:

- **Release policy is read, never invented.** The WIP limit and the order of collectors are the Release process's rules. They come from the **authoritative Release declaration** (the repository's record of the release policy, the common part of the declaration of section 2, owned by Release and read by both capabilities). Pull Promotion's `sequencing` judgment reads them and judges the collector against them; it defines no limit and no order of its own, and where the declaration does not state them the judgment is UNKNOWN. It does not reimplement a release control, and it does not read Show WIP's output (its lane, its findings, whose turn it is).
- **In flight.** Whether another promotion is open is observed in E1 (open PROMOTION pieces) and compared with the declared limit; whose turn it is follows from the declared order and the observations, never from Show WIP. Where the declaration does not state an order, Pull Promotion states eligibility and that a promotion is open, and says nothing of turn.
- **Next step.** From its own judgment and the declared holds only: a hold gives WAIT and escalate; READY gives "eligible to open a promotion"; anything else names what to revise or what evidence is missing. It stops echoing a finding (`pull/T8` is reworked to the holds).
- **Gaps.** Structured by E1, so `pull/F19`'s prose rule shrinks to a fallback for foreign input and a declared `affects` is the normal path.
- **Show WIP's `flow` argument disappears** from `pullPromotion(facts, declaration, collector)`. `pull/F3` and `pull/T10` change from "reads only Show WIP's fields" to "reads only E1's fields and the Release declaration".

## 5. Delivery order, boundaries and acceptance evidence

Each is its own Change with its own PLAN, DO, Check and ACT in its own collector. None borrows another's ACT or completion evidence.

| # | Change | Boundary (in / out) | Depends on | Contract | Acceptance evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | **E1** host observation | In: the neutral contract, the validator, the gap shape, the common declaration part. Out: any host access, any consumer rule. | Nothing | The schema and the requirement list | Cases on valid and invalid documents; no import of either consumer (checked) |
| 2 | **E2** GitHub observer | In: reader, audit, snapshot, normalizer to E1. Out: any decision, any consumer vocabulary. | E1 | E1's contract, `pull/F15` and `F16` carried over | Recorded-response Cases; a live read-only Case on the real repository |
| 3 | **`pull/C3`** capability re-based | In: the input of `pullPromotion` becomes E1 plus the Release declaration; `F3`, `T8`, `T10`, `F19` amended. Out: any host access, any trigger. | E1 | The amended `pull/` requirements | The re-based Cases green; a Case that fails if Show WIP's output or supplier is read |
| 4 | **`pull/C2`** integration (this PLAN, narrowed) | In: the command that runs E2 and the capability by hand. Out: host mapping, triggers. | E2, `pull/C3` | `pull/F14` to `F18`, `F20` | `pull/T14`, `T18` |
| 5 | **Wiring** | In: a hook or CI trigger. | The integrated command | Not planned | Not planned |

`pull/C1` is preserved untouched as the accurate completed record of what shipped on 12 Nov 2026. `pull/C3` amends it forward and never edits its record.

**Show WIP's transition (CPO preference, 12 Nov).** Show WIP is corrected and landed with its current supplier private to it, after its own separate CPO review; that preference authorizes nothing about #1476. Its migration to E1 and E2 is an explicit later Change of its owner. Until E2 exists, Pull Promotion consumes no supplier of Show WIP's, private or not.

## 6. Decisions

Agreed by the CPO (12 Nov): the direction (E1 and E2 as separate, independently owned elements consumed by both as peers; `pull/C3`; the narrowed `pull/C2`; wiring separate), the transition of Show WIP and the preservation of `pull/C1`. Not approved: this PLAN.

Still to settle:
1. **The owner role of E1** and the exact folder of its component and Delivery module (E1's PLAN proposes it; the CPO names the owner).
2. **The authoritative Release declaration**: whether it is the declaration both capabilities already read (the repository's record of promotions, order and policy) or needs its own PLAN, and who owns it (Release).
3. **The name of E1 and E2** in the architecture (this document uses "host observation").

## 7. Cost

Two further Changes before the integration (E1 and E2), one amendment of the merged capability (`pull/C3`) and a rework of its Cases T8, T10 and the F19 fallback. The integration waits for all of them. The reason to pay it is that the alternative couples two models through a supplier that only one of them owns.
