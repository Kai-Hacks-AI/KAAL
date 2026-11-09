# FAR, Features Accepted Regression: Intent

This is `change/C2`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

The Owner decided on #558 (2026-10-28) that FAR is Change's composition for integrating a source into a target. FAR is exactly three artifacts: a Features Test Plan, an Accept list and a Regression Test Plan. It is the FAR of Review's TOGETHER WE CAN GO FAR (#270), Features Accepted Regression.

The capabilities divide FAR as follows:
- **Testing** evaluates ordinary Test Plans generically and knows nothing of FAR. That evaluation is `testing/C4` (#385) and Testing's Test Plan PLAN.
- **Engineering** selects the revisions and runs the integration gates.
- **Review** supplies the authorization evidence.

- **change/I5.** FAR is Change's composition for one named integration of a source into a target, at the target's protected baseline. Engineering names the integration and supplies its immutable revision evidence. Change compares that evidence and gives it no Git semantics.
- **change/I6.** Features and Regression are ordinary Test Plans, each owned by its own capability:
  - **Features** is the incoming Change's Plan. It protects what the source promises, and it is never excepted.
  - **Regression** is the target's Plan at the protected baseline. It protects what the target already delivers.

  Change selects both and edits neither, nor any of their Cases.
- **change/I7.** Accept is Change's separately negotiated and authorized list of individual Regression Cases that may stay RED.
  - **Justification.** Each Case is justified by Features Cases.
  - **Scope.** It applies only to the integration it names, and it never transfers to another.
  - **Evidence.** Accepted Cases stay observed RED, while the Regression Plan's evaluation succeeds under the authorized exceptions.
  - **No waiver.** There is no standing waiver.
- **change/I8.** Change decides and composes. Testing evaluates the Plans, Engineering gates, and Review evidences the authority.

## Revision: authorization before reliance (9 Nov 2026)

Decided by the CPO after the CTO's assessment, and requested of Change by Engineering's PLAN `far-authorization-plan.md` (#1340). Change owns the authorization and lifecycle of Accepts. The rest of FAR is unchanged.

- **change/I9.** An Accept is authorized before a DO relies on it. A DO may consume only Accepts that an accepted PLAN established, and the evidence names that exact PLAN and the designated authority that decided it.
- **change/I10.** A PLAN fixes what its DO is judged by. The Cases and the Accepts a PLAN established are immutable to its DO. A correction is a Defect or a Change that drives a new PLAN, never an edit by the DO. Authorization that is unknown, expired or cannot be verified is never a pass.

change/I7 stays as written: "separately negotiated and authorized" now has a requirement behind it.
