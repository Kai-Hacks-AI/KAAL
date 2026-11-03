# Process: metamodel, PDCA as a template, ACT as learning, ESSA as a separate candidate (PLAN)

Capability: Process. Target: kaal/process at `0033510`. Record number is
provisional until integration. Markdown only: no Node, Definition, claim,
package, workflow or policy changes.

Owner direction (3 Nov): the core concept is PLAN -> DO/CHECK -> ACT.
kaal-process holds the core concepts of process management. PDCA, DevOps and
possibly others are instances of it. Revised after the CPO handover: ACT is
learning, not a closure status, and ESSA is a separate concept.

## 1. Who owns what

| Piece | Owner | Why |
|---|---|---|
| The metamodel (Process, Activity, Role, State, Transition, Ordering, Entry/Exit) | Process | Process's whole scope (#275). |
| **PDCA**, the generic learning and improvement cycle, as a reusable **template** | **Process** (incubated) | Generic, and no other capability's semantics (#526, #620). It lives in the package that already holds it. No new package. |
| A capability's own lifecycle and records (a Change's PLAN, DO, CHECK) | That capability (Change) | Already stated in the Process Node. Change owns its lifecycle records, not the generic meaning of ACT. |
| Evidence and verification semantics | Testing | Unchanged. |
| Persistence and retrieval of learning | **Undecided**; Learning is a candidate | Considered separately (section 3). |
| **DevOps** | **Undecided** | An instance of the metamodel. Nothing here infers that it belongs in Process or in Engineering. #851 and #852 treat it as a process, not a capability, and are not changed. |
| **ESSA** | **Undecided** | A candidate optimization method (section 4). |

**Template and instance, defined.** A *template* is a reusable process design
that Process owns because it is generic (PDCA). An *instance* is what a capability
creates when it adopts a template for its own work, and the adopter owns it. The
metamodel is the vocabulary both are written in. Concrete processes and their
learning stay in their own contexts. Process keeps no registry of instances and
dictates no instance's semantics.

## 2. ACT is learning

ACT is learning based on what happened. Some of that learning needs persistence,
and it feeds another PLAN. So:

- ACT is about learning, retention and feedback. It is **not** a closure-status
  mechanism, and no taxonomy of outcomes (Standardize, Adapt, Drop) is proposed.
  The earlier proposal of that taxonomy is withdrawn.
- **No mandatory ACT note** in every Change record is prescribed. Its purpose,
  ownership and relation to Learning are not established, so it is not asked of
  Change either.
- Persistence should be sufficient for a later PLAN to find and use the relevant
  learning. How, and where it is kept, is open.
- What PDCA.md says today stands: Act preserves knowledge for a later Plan and
  changes nothing by itself. A later wording change to PDCA.md, if any, would
  only sharpen "learning that persists and feeds the next Plan", and is a separate
  Change after #560.

## 3. Learning's possible role

Learning may own reusable persistence and retrieval of what ACT produces, since
retrospectives and retrievable learning are already Learning's concern. No
decision is made here. This PLAN raises the question with the Learning capability
by pull request and does not assume the answer.

## 4. ESSA, a separate candidate

The Owner favours **Eliminate -> Standardize -> Simplify -> Automate** as a process
optimization method:

1. Eliminate work that is unnecessary.
2. Standardize what remains so repeated executions produce the same data
   structure by design (comparable structure and meaning; values may differ).
3. Simplify using comparable evidence, including deterministic calculation.
4. Automate only after the process is understood and optimized.

ESSA is **not** ACT and not part of PDCA's learning cycle. It is a candidate
method within process management. Ownership and implementation are undecided, and
**no ESSA capability, Definition or package is proposed** without a separate
product justification.

## 5. Maturity as context only

Process maturity models (CMM/CMMI: managed/repeatable, defined, quantitatively
managed, optimizing) are context. The useful principle is that standardized
execution and consistent evidence enable quantitative comparison, which supports
systematic optimization. When the metamodel evolves, repeatability, consistent
evidence structure and quantitative comparability are considerations. **No CMMI
implementation is proposed.** CMMI does not prescribe ESSA, and automation is not
itself a maturity level.

## 6. What this record changes

Nothing is implemented. The metamodel promoted by #560 stays the unamended text.
The Serving amendment of #852 and any PDCA wording change are separate later
Changes, after #560. Package independence holds, and no other capability's
technical answer is duplicated.

## Open questions (Owner choices; a later DO must not assume any)

1. Where and how learning persists, and whether Learning owns retrieval.
2. Who holds DevOps's description.
3. Where ESSA lives, if it is adopted at all.

## Scope and authorization

This record only. No SYNC, promotion or publication.
