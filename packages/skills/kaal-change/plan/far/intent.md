# FAR, Features Accept Regression: Intent

This is `change/C2`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

The Owner decided on #558 (2026-10-28) that FAR is Change's composition for integrating a source into a target. FAR is exactly three artifacts: a Features Test Plan, an Accept List and a Regression Test Plan. It is the FAR of Review's TOGETHER WE CAN GO FAR (#270). This amendment follows the Owner's ruling of 2026-11-03 and the CPO handover of the same day, which name it Features Accept Regression: **FAR is a Change concept that uses Testing and Guard. kaal-change drives it and owns all three artifacts and the gate. Testing owns testing semantics, Guard owns guard semantics, and Change owns change semantics.**

The capabilities divide FAR as follows:
- **Testing** evaluates ordinary Test Plans generically and knows nothing of FAR. That evaluation is `testing/C4` (#385) and Testing's Test Plan PLAN.
- **Guard** owns guard semantics. FAR is wired up in Guard's setup as a configured check that Guard executes and reports generically. Guard does not interpret FAR and does not decide whether a regression is acceptable.
- **Engineering** supplies the immutable revision evidence for the named integration and the Git semantics Change does not have.
- **Review** supplies the authorization evidence.

- **change/I5.** FAR is Change's composition for one named integration of a source into a target, at the target's protected baseline. Engineering names the integration and supplies its immutable revision evidence. Change compares that evidence and gives it no Git semantics.
- **change/I6.** Features and Regression are Test Plans that kaal-change drives and owns as FAR concepts. Their form and evaluation are Testing's: they are ordinary Test Plans using Testing's concepts.
  - **Features** is the incoming Change's Plan, read at the source's revision. It protects what the source promises, and it is never excepted.
  - **Regression** is the target's Plan, read at the protected baseline. It protects what the target already delivers. The source cannot weaken it by changing its own tests, because it is read at the baseline and not at the source.

  Change owns the selection and the FAR meaning of both. Testing owns what a Test Plan and a Case mean.
- **change/I7.** The Accept List is Change's separately negotiated, versioned and authorized list of individual Regression Cases proposed for acceptance as RED. It travels with the source Change.
  - **Justification.** Each Case is justified by Features Cases.
  - **Scope.** It applies only to the integration it names, and it never transfers to another.
  - **Evidence.** Accepted Cases stay observed RED, while the Regression Plan's evaluation succeeds under the authorized exceptions.
  - **No waiver.** There is no standing waiver.
- **change/I8.** Change drives the gate, judges and composes. Testing evaluates the Plans, Guard reports what it observes, Engineering supplies revision evidence, and Review evidences the authority. Where Change cannot establish acceptance within its authority, PREACH is the escalation to the accountable human (see the questions below).
- **change/I9.** A confirmed Defect is not an accepted regression. A review finding (for example Codex's) can be valid yet outside the PR it was found on. Judging that is Change's. Once confirmed through a RED Test Case, it needs functional placement first, in the capability that owns the behaviour, which Change Isolation determines.
  - **Where the RED Case lives.** In the owning capability's Defect Plan, a Test Plan kept apart from its Regression Plan. The Regression Plan holds only Cases that are GREEN at the baseline, so a Defect Case never makes Guard or CI fail an unrelated PR.
  - **How Guard shows it (confirmed by Guard on #929).** As a report-only check beside Features and Regression. Guard's setup declares the outcome `held` (exit 4) for known-RED Cases only, and the check must still exit 1 for any unknown RED. The job then succeeds with a warning. Guard reports that verdict and the check's own output unchanged. It carries no per-Case outcome, count or age today, so the FAR check prints them in its own output, and age stays with the Defect record, not Guard. Surfacing a counted and aged group in Guard itself would need a small Guard Change, only after this PLAN fixes what a FAR check emits.
  - **How it turns GREEN.** The fixing Change turns the Case GREEN and moves it from the Defect Plan into the Regression Plan, where FAR now protects it. A Defect Case leaves the Defect Plan only that way, so deleting or weakening one without a fix is a finding that Change judges.
  - **A Change claims the Defects it answers (Owner, 2026-11-03).** A Change's PLAN declares which Defect Cases it answers, as `answers` in its FAR record. The PR gate to `kaal/*` enforces that claim, which makes a fix a verifiable claim and not an incidental one:
    - **Claimed, then GREEN.** Each claimed Case must be GREEN at the head and must have moved from the Defect Plan into the Regression Plan. A claimed Case still RED fails the gate.
    - **Unclaimed stay report-only.** Defect Cases the Change does not claim are reported and never fail anything.
    - **Judged by Change.** A claim naming a Case that is not in the Defect Plan at the baseline, or one that is already GREEN there, is a finding. A Change that moves or removes an unclaimed Defect Case is a finding too.
    - **Guard's part.** Guard's setup takes the claim as the check's input. It treats claimed Cases as gating, like Regression Cases, and the rest of the Defect Plan as report-only. A claimed Case that is still RED exits 1, so the gate fails. Unclaimed known-RED Cases exit 4, held. The FAR check prints the claimed outcomes and the unclaimed count in its own output, which Guard shows unchanged. Guard does not judge whether a claim is right, and it does not decide acceptability.
    - **Testing's part (confirmed by Testing on #929).** A Defect Plan is an ordinary Test Plan, and a Case is defined once with its Plans derived, so a moved Case keeps its identity. Runs are separate and tied to the Case version, so the earlier RED Run does not travel with the Case. The GREEN that justifies the move must be a new Run of the Regression Plan. Change cites the RED Run in its own FAR record when it wants the history.
  - **Why not the Accept List.** Entries there are per integration, justified by Features Cases, and never standing (change/I7). A Defect Case was never GREEN, no source Change justifies it, and it must outlive any one integration. Carrying it as a standing entry would be the standing waiver I7 forbids and would let a source weaken the target's protection.

## Open questions

Questions 1, 2, 4, 5, 6 and 7 stay open in this PLAN and are for the Owner, CPO and the named capabilities to settle before any DO. Question 3 is settled.

1. **Guard's reporting outputs.** What exactly does Guard report for a FAR check: GREEN and RED per Case, accept-list coverage, and unresolved conditions? Guard owns the output format. Change consumes it, judges it, and defines no Guard type.
2. **PREACH.** How does Change escalate through PREACH when acceptance is beyond its authority? PREACH is not in Change's contracts today, only in Core's and Engineering's documents. Who owns the escalation contract?
3. **Settled: entry-point visibility.** FAR sits under kaal-change's single entry point, with no separate entry point and no separate package. Its visibility is a storytelling question, answered by naming FAR prominently in kaal-change's README and docs. That writing belongs to the DO, not to this PLAN. (Owner, 2026-11-03.)
4. **The expansion.** Review's #270 still says Features Accepted Regression. Is the name Features Accept Regression (this PLAN, the CPO handover)? Name only; it affects no contract.
5. **#662.** Delivery counts allowed failed Cases as unmet. An accepted Case that stays RED must remain consistent with that.
6. **Defect Plan (change/I9).** The CTO proposed carrying known-RED Defect Cases as known-red entries on the Accept List. This PLAN recommends a separate report-only Defect Plan instead (reasons in change/I9). Which does the Owner and CPO choose? Testing has confirmed that a Defect Plan is an ordinary Test Plan (the Defect concept is `kaal-defect`, incubated in Testing), and Guard has confirmed that a check can be report-only through the `held` outcome. The CTO withdrew the Accept List option.
7. **Age limits.** Should a known-RED Defect Case that stays RED beyond some age escalate (PREACH, question 2)? Change would judge it; the limit is not yet defined. CTO view: yes, through PREACH once a Case passes an age threshold that the plan sets. Guard is not involved. The CPO judges.
8. **The claim's input to Guard.** Is `answers` read from the Change's FAR record at the source's revision (this PLAN's proposal), or declared elsewhere, such as the PR? Guard owns how its setup receives an input. CTO view: read it from the FAR record the PLAN writes. The claim is part of the PLAN, and one source keeps the gate deterministic; the PR body may quote it but is not the source. The CPO judges. Requirements and planned tests for `answers` follow once questions 6 and 8 are settled.
