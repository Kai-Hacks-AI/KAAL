# Requirements

R1. **ROWING is named.** The meaning of ROWING is delivered by Changing KAAL's capability as a sealed KAAL Definition, in the pattern of RATIFICATION. It states the mnemonic and what it restricts; it states no mechanism and names no host concept.

R2. **Review is a step.** The process is: allocate, work, review until converged, seal work, the three retrospectives in order, seal Change. A Change cannot be closed without a review that converged on exactly the Work that was sealed and all three retrospectives.

R3. **Review is recorded as rounds.** A round is one review of the Work as it then stood, written by the Reviewer, never edited afterwards. It binds itself to the identity of the Work it reviewed and states one result: findings or converged. Findings are the concrete matters to resolve, stated in the round.

R4. **Convergence is derived.** A Change's review has converged exactly when its latest round says converged and names the identity of the Work as it now stands. Nothing else records it; changing the Work afterwards makes it not converged again.

R5. **Review may iterate inside the Change.** Findings are resolved in the Work (its Requirements, Architecture and evidence, never its Intent), which stays open until review converges. Another round follows. No further Change is needed.

R6. **The Reviewer does not change Work.** The Reviewer writes only review rounds and its own retrospective.

R7. **Review and retrospective stay distinct.** The Reviewer's result is in the rounds. The Reviewer's retrospective is the 4L retrospective of the review seat, `retro-review.md`, and carries no verdict.

R8. **Three perspectives, ordered, honestly named.** `retro-work.md` is the Worker's, `retro-owner.md` the Owner's, from the Owner's seat, and `retro-review.md` the Reviewer's. Each is written after the Work is sealed, from its own seat, in that order: Worker, Owner, Reviewer (WORK), because knowledge accumulates. A later retrospective may read the earlier ones. The order is derived from the artifacts present; who wrote a file is not provable and not asked of the check.

R9. **Roles are roles.** Owner, Worker and Reviewer are defined as process roles in the capability's Agent Skill. They are not Nodes, are not identified in any artifact, and one actor may hold several. What is recommended and what KAAL's checks can and cannot show are stated separately.

R10. **Owner judgment is not an artifact and the Owner's retro carries no approval.** After the Work is sealed and the Worker's retrospective exists, the Owner judges, against the fixed Intent, whether the sealed Work answers it. That judgment is a process act: KAAL records no approval, verdict or approval metadata. `retro-owner.md` is written after it and carries no approval or verdict; it reports what the Work as it stands taught the Owner about the product and the Intent, may inform a future Intent, and cannot revise this Change's. How a host authorizes or admits the closed Change, with its accounts, approvals and checks, is outside KAAL.

R11. **State stays derived.** The evaluator derives the stage and what is next from `work/`, `review/`, the retrospectives and the seals only. No status file, no phase metadata, no role or writer identity.

R12. **History is preserved.** Changes closed before this one stay valid exactly as sealed: the single `retro.md`, `retro-work.md` with `retro-observe.md`, and no `review/`. They are judged by their own seals. In an open Change `retro.md` and `retro-observe.md` are reported, never accepted: `retro-observe.md` is the historical name of the outer perspective from before it was understood to be the Owner's, and no Observer role exists, so the old name is not carried forward.

R13. **No host in KAAL.** Nothing this Change adds to `.kaal`, the Node, the Agent Skill or its reference speaks of any hosting, tooling or provider concept, or of any person. Work files of this Change likewise.

R14. **ROWING is not the topology.** The Node defines the discipline between realized Work and its review and names no role. The three roles and their shape are in the Agent Skill as how Changing KAAL currently uses it, so that later roles change the Skill and not ROWING.

R15. **Smallest implementation.** Two new Nodes, ROWING and WORK, each a KAAL Definition with its seal; the Agent Skill and its retro reference revised and one reference added; the one evaluator extended; acceptance for each. No change to Core, the Changing KAAL Node, RATIFICATION, any seal or any host control.

R16. **The Intent is the fixed target.** Inside the Change the Intent is not revised by the Worker, by the Reviewer or by the Owner entering the Worker-Reviewer loop; review judges the realization against it and does not renegotiate it. A review that finds the Intent cannot be delivered as stated leaves the Change unconverged as a successful realization; it is not resolved by editing the Intent in the same Change. What the Owner does with such a result is outside the Change.

R17. **ROWING and WORK divide the lifecycle at the Work seal.** ROWING governs `Work ⇄ Review → convergence → seal Work`; WORK governs the retrospectives after it, `Worker → Owner → Reviewer → Knowledge`. The evaluator requires the order `WORK SEALED → retro-work → retro-owner → retro-review → RETROS PRESENT → seal Change`: its stages name no seat as privileged but follow the order, the next step is the first missing retrospective in order, a retrospective present while an earlier one is missing is reported as out of order, and closing needs all three. WORK is a sealed KAAL Definition beside ROWING and RATIFICATION (round 03): the mnemonic Worker, Owner, Reviewer, Knowledge and the durable constraint that knowledge comes in that order, none revising the Work or the Intent; it holds no filename, stage, host, GitHub, account or CI. The Agent Skill describes how the current process realizes it (`retro-work.md → retro-owner.md → retro-review.md`, the Owner's judgment boundary, the evaluator's order). Not a role or a status file.
