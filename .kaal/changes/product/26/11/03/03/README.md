# Product PLAN: External KAAL, consumer journeys, requirements and acceptance (provisional number 26/11/03/03)

Markdown only. PLAN only: no Node, Definition, claim, package, workflow, policy or implementation is created or changed, no capability is introduced, and nothing here is started. The knowledge-only promotion proposal is a separate Owner discussion and is not covered.

## 1. Intent

The CPO accepted a credible product gap: External KAAL is a first-class consumption mode that is insufficiently designed and validated. External KAAL means applying KAAL knowledge to work in some other repository with **no installation, no registration and no Engine**. Embedded KAAL (installed, registered, used) and Engineering KAAL (developing KAAL itself) are the other two concerns and are not changed here.

Product direction given by the CPO:

1. One authoritative knowledge source.
2. A discoverable external entry point.
3. Explicit dependencies and authority boundaries.
4. Independent consumer acceptance.
5. Reproducible knowledge versions.
6. No mandatory Engine for external consumption.

This PLAN turns that direction into consumer journeys, requirements and acceptance criteria. Product owns what External KAAL means to its consumers and when it is accepted. It does not own how any of it is built, verified or distributed (section 7).

## 2. Evidence and limits

Evidence is the CTO portfolio view of 3 Nov 2026 (§1A, §6, §6A: gaps X1 to X7), read from the repository and registry, not re-run. Its External-value ratings are the author's reading of Skill and Node text and are **not tested**; that is gap X5 and is the reason acceptance is a requirement here (R7). Nothing in this PLAN asserts that any capability is externally ready today.

## 3. Consumers

- **Cold agent**: an Agent session in an unrelated repository, primed with nothing KAAL-specific, given a task and pointed at KAAL knowledge as plain text.
- **Maintainer**: a person in an unrelated repository who wants to apply a KAAL method (for example Review, Testing or PDCA) to their own work.
- **Pinning consumer**: a person or organization that must cite or reproduce "the KAAL knowledge as of a given version" in their own records.

An Embedded user is not an External consumer. A KAAL agent already primed with KAAL vocabulary is not independent evidence of External readiness (§6A).

## 4. Consumer journeys

| # | Journey | What the consumer must be able to do, with no install, registration or Engine |
|---|---|---|
| J1 | **Discover** | Land on the repository's default branch, find where KAAL knowledge is and which task each part serves, without being routed to the Embedded path first. |
| J2 | **Apply** | Take one task, follow one Skill or Definition as text, and complete the work, with the knowledge standing alone or stating exactly what it assumes. |
| J3 | **Know the boundary** | Tell before acting whether a piece of knowledge is advice only, a procedure to follow in plain text, a command to run, or something that writes into the consumer's repository, and what authority applying it does and does not grant. |
| J4 | **Resolve dependencies** | See which other knowledge a piece relies on, and read those without the Engine. |
| J5 | **Pin and cite** | Refer to a specific version of the knowledge and get the same text again later. |
| J6 | **Escalate to Embedded** | Know when the task needs the Engine or a package, and what that step would add, without being required to take it. |

## 5. Requirements

Each requirement names the direction point it serves (D1 to D6, in section 1 order) and the gap in the portfolio view it answers.

| # | Requirement | Serves | Gap |
|---|---|---|---|
| R1 | There is one authoritative text for each piece of KAAL knowledge. External KAAL reads that text; it is never a parallel External copy, and the Engine, where used, is an optional index over it. | D1, D6 | (principle, §6) |
| R2 | A single entry point is discoverable from where an outside consumer first lands, and lists, for each task, which knowledge serves it and what it assumes. It points to knowledge before it points to the Engine. | D2, D6 | X1 |
| R3 | Knowledge an External consumer is expected to use is reachable from the same place an outside consumer first looks, not only on development branches. How it becomes reachable is not decided here. | D2 | X2, X7 |
| R4 | Each piece of knowledge declares whether it stands alone, and if not, exactly what it needs: the Engine, another piece of knowledge, or a command. | D3, D6 | X3 |
| R5 | Each piece of knowledge declares its effect: read-only advice, a procedure followed in plain text, a command to run, or a write into the consumer's repository. External application implies no installation, no registration and no write authority unless the consumer chooses an Embedded step. | D3, D6 | X4 |
| R6 | A consumer can cite and obtain a specific version of the knowledge reproducibly. | D5 | X6 |
| R7 | External readiness is accepted by an independent consumer test, not by internal use. | D4 | X5, §6A |
| R8 | Dependencies between pieces of knowledge are explicit and resolvable as text, so a consumer is never sent to the Engine to find out what a piece relies on. | D3, D6 | X3 |

## 6. Acceptance criteria

**Independent consumer acceptance (R7).** A piece of knowledge is accepted as External only when all of these hold. They follow the portfolio view's rule for externally validated use:

- The consumer is an unrelated repository with no KAAL workspace, no installation, no registration and no Engine.
- The artifact is exactly what an external consumer receives: plain text, at a stated version.
- The task is a real task in that repository, chosen by someone other than the author of the knowledge.
- The checker is not the author of the knowledge and is not primed by KAAL beyond the text under test.
- The result is measured against the knowledge's own stated claims (what it says it enables), not against a new standard.
- No write into the consumer's repository occurs that the knowledge did not declare (R5).

**Per requirement (each is a statement a checker can decide):**

| # | Accepted when |
|---|---|
| R1 | For a sampled set of knowledge, exactly one authoritative text exists, and no second copy diverges from it. |
| R2 | A cold agent, given only the repository's default branch, finds the entry point and, for a stated task, reaches the right knowledge without being routed through the Engine first. |
| R3 | The knowledge listed at the entry point is readable at the place an outside consumer lands, at the version cited. |
| R4 | Every listed piece states whether it stands alone and, if not, what it needs. A piece that says it stands alone is applied by a cold agent with no other file and no Engine. |
| R5 | Every listed piece states its effect in the vocabulary of R5. Applying any listed piece as declared makes no undeclared write and requires no installation or registration. |
| R6 | A stated version can be named in a citation, and obtaining it later yields the same text. |
| R7 | The six conditions above hold for each piece of knowledge claimed External. |
| R8 | For a stated piece, every dependency is listed and every listed dependency is readable as text. |

A piece of knowledge that fails any of these is not External-ready. It may still be useful Embedded or Engineering knowledge.

## 7. Ownership: what is Product's and what is not

| Question | Owner |
|---|---|
| What External KAAL means to consumers; which journeys, requirements and acceptance criteria; when a capability may be called External-ready | **Product** (this PLAN; the Owner decides) |
| Running independent consumer acceptance and recording its evidence | **Testing** (evidence and verification semantics); the checker is not the author |
| A reusable "stands alone" conformance profile (does a piece need the Engine, a command, or a write) | **Packaging** may provide the mechanism (see section 8); Packaging is not given External product semantics |
| The content of each piece of knowledge | the owning capability |
| Where and how knowledge is made reachable and versioned (branch, tag, release, page) | open; Engineering and Packaging to be consulted before any proposal. **Promotion routes are the Owner's** and are out of scope |
| Whether the Engine offers an optional index over the knowledge | Core |

## 8. Packaging #907

Packaging's general conformance profile (#907, a draft DO) is the natural place for one judgment engine that answers R4 and R5 (does a piece need the Engine, a command or a write) without a new verifier. Product's position:

- Product states **what** must be judged and **what pass means for the consumer** (sections 5 and 6). Packaging may supply **how** it is judged, once its contract allows it.
- Assigning External product semantics to Packaging is not requested. If #907 can serve the profile as written, Product reuses it; if it cannot, Product records the difference as a finding for Packaging rather than defining a second engine.
- Whether #907 fits is for Packaging's thread to say. This PLAN asks the question and starts nothing.

## 9. Out of scope

- Implementation of any entry page, profile, scenario, version scheme or tooling.
- A new capability or a new npm package. A capability needs no package to carry External value.
- The knowledge-only promotion proposal and any change to promotion policy. This is a separate Owner discussion.
- Changes to what Embedded or Engineering consumers do.
- Release-critical work (Hosting, Foundation, Core, Guard) is unaffected.

## 10. Cross-capability requests (proposals, nothing started)

- **Packaging**: can #907's profile express R4 and R5 as written? Asked through the Packaging thread.
- **Testing**: would an External acceptance scenario (section 6) sit with Testing, and what does it need? Asked through the Testing thread.
- **Engineering**: how can an entry point and a citable version be offered without changing promotion policy? Engineering owns the branching and release mechanics; any answer that touches promotion returns to the Owner.
- **Review**: the one capability the portfolio view marks as explicitly standing alone; a candidate first subject for acceptance.

## 11. Decisions for the CPO and Owner (proposals, not settled by approving this PLAN)

1. Whether section 5's eight requirements (R1 to R8) are the right scope for External KAAL.
2. Whether independent consumer acceptance (section 6) is the bar for calling a capability External-ready.
3. Which capability is the first subject of an acceptance trial (Review is suggested).
4. How knowledge becomes reachable and versioned for External consumers. This is Owner territory where it touches promotion.

## 12. Verified by / Validated by

Markdown only; required checks on this PR and the Codex review triaged on it. Validated by CPO review of the product meaning and Owner review of the decisions above. This PLAN authorizes no SYNC, promotion, publication, capability or implementation.
