# kaal-defect: Testing acknowledges incubating the Defect concept (PLAN)

Owner: Testing. Target: `kaal/testing`. Planning only; no code, test, manifest, export or identity change, and no Defect identifier is defined here. Cited by Requirements PLAN #893 (`requirements/C11`, F23, F24). Number provisional.

## Decision being acknowledged

On 2 November the Owner decided that **`kaal-defect` owns the Defect concept and the Defect record definition**. It is incubated inside the Testing capability for now and may become its own Skill later. **Instances are owned by their context**, like requirements and every other item: a Defect found in a context belongs to that context's records, not to Testing.

## 1. Testing accepts incubating `kaal-defect`

Testing accepts the incubation. Incubation means the concept and the record definition are developed and reviewed under Testing's PLAN, DO and CHECK discipline, in Testing-owned paths, until a separate Change proposes a standalone Skill. Nothing in this PLAN creates a package, a Skill or an export; a standalone `kaal-defect` is a later, separately reviewed decision, and the npm package rule applies to it at that time.

## 2. What the Defect concept covers, and what it leaves to others

| Concern | Owner |
| --- | --- |
| The Defect concept: what a Defect is, and the definition of its record (what a record must state to be a Defect) | `kaal-defect`, incubated in Testing |
| RED evidence and execution: that a Case observably fails on the subject, with the evidence Testing already calibrates (Testing's existing three results and its rule that unknown is never counted as passed) | Testing |
| The obligation arising from a Defect, and tracing it with `Serves` | Requirements (#893; `requirements/F10` and `T11` stand unweakened) |
| The Test Cases that answer a Defect (a Case added by learning starts RED until implementation answers it GREEN) | The Cases' owning capability, judged by Testing's existing semantics |
| Each Defect instance, its identity and its lifecycle | The context that raised it |

**The agreed model is a four-way split:** definition (`kaal-defect`, incubated in Testing), evidence (Testing), obligation (Requirements) and instance (the raising context). A Defect is therefore not a Requirement kind: the obligation it gives rise to is a Requirement, traced with `Serves`, and `requirements/F10` and `T11` stand unweakened. This PLAN relies on #893 being amended to the obligation side only (dropping F23/F24 wording that makes Defect a Requirement kind) and citing this PLAN; if #893 states otherwise, the two PLANs are not settled and the conflict returns to the Owner.

The concept does not define requirement text, does not decide whether a Defect is accepted as an obligation, and does not execute Cases outside Testing's existing acceptance and verification mechanisms. It adds no linear chain between loops: Test Cases trace independently to Intent, Requirements, Architecture and Defects, as #893 states.

## 3. Release scope is unchanged

Testing 0.0.1 keeps its existing implemented APIs, practical Skill and installed verifier. The items deferred by #863 stay deferred and outside 0.0.1: standalone `/observe` and `/red`, C33 coverage accounting, C48 trace derivation and composed-Plan execution. `kaal-defect` is not a 0.0.1 prerequisite, adds nothing to 0.0.1, and its RED-evidence use depends on the deferred `/red` work, which this PLAN does not start.

## Open points

- The record definition itself (fields, identity, lifecycle) is for a later Testing PLAN, proposed when it is due; this PLAN authorizes none.
- Whether `kaal-defect` is later a Skill, and its npm status, are decided when that Change is proposed.

No implementation, synchronization, promotion or publication is authorized by this PLAN.
