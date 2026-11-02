# Intent ownership and traceability: Requirements

- **intent/F7. Ownership.** Intent owns: what an Intent is (`Intent`, `IDEA`, `I WON`), how an Intent element is identified (`intent/F2`), the Skill that tells an agent how to capture one, and the Intent plan documents. It claims `packages/skills/kaal-intent/` (`intent/F6`, delivered by `intent/C2`) and nothing else [intent/I3].
- **intent/F8. What Intent does not own** [intent/I3]. Intent does not own the relationship from a Requirement to an Intent (`Serves`, Requirements'), any capability's own Intents (each consuming capability holds its instances, `intent/F3`), Requirements, Architecture, Tests or Evidence, the Graph Edge mechanism, or Change Isolation's impact computation.
- **intent/F9. The traceability map** [intent/I4]. This PLAN records each relationship with its owner. Test Cases trace Intent, Requirements, Architecture and Defects independently; there is no required order and no Code hop:

| Relationship | Owner | State | Blocker |
| --- | --- | --- | --- |
| Intent element is addressable | Intent | Planned and delivered on the collector (`intent/C1`, `C2`): the form is a Node `<capability>/I<n>` | Collector not promoted; no capability yet states an Intent as a Node |
| Requirement → Intent (`Serves`) | Requirements | Planned (`requirements/C10`, #741); no DO | Needs Intent's Node form; Graph pinning rule |
| Architecture → Requirement | Architecture | Planned as outgoing `Placement` from a decision to Requirement Nodes (PLAN #891, Architecture thread); Requirements states only that Requirement Nodes are addressable (`requirements/A4`) | #891 not merged; Kai's decision on holding Placement C9–C11 |
| Test Case → Intent, Requirement, Architecture, Defect | Testing | Planned (`testing/C48`, #745), deferred from Testing 0.0.1. A new RED Case from learning is answered by implementation reaching GREEN | Testing 0.0.1 release |
| Evidence → Test Execution | Testing, with Packaging for dependency traces | Partly delivered: executions and installed verification; dependency traces planned (#746) | Hosting-first publish order |

- **intent/F10. Open questions, not decisions** [intent/I4]. (a) Whether `Serves` at Requirement granularity is enough for Change Isolation, or Architecture needs its own Edge. (b) Whether the Intent Node form is promoted ahead of the Requirement side, since `Serves` cannot land without it. Code → Architecture is deliberately not a relationship here: it is not the traceability backbone, and this PLAN neither invents nor requires it. Each question goes to the CPO or the owning thread; this PLAN answers none of them.
- **intent/F11. Coordination, in order** [intent/I4]. (1) Requirements and Architecture get owning threads, as the CPO handover directs. (2) Intent, Requirements and Architecture agree the `<capability>/<letter><n>` identification across the three before any Edge is stated. (3) Graph and Testing confirm that pinning and trace derivation read the Nodes as planned. (4) Engineering folds the result into #739 only after these owners ship their parts. Intent starts none of the others' work.
- **intent/N2. Critical path first.** Nothing here touches Hosting → Foundation → Core, uses Hosting's collector, or asks Hosting, Foundation or Core for anything [intent/I3].
- **intent/N3. Honest status.** A link is stated at the state its owner's own documents give. A PR title or merged-to-collector Change is never described as delivered [intent/I4].
