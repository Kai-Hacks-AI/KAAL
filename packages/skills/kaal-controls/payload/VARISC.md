---
name: VARISC
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# VARISC

Verify, Accountable, Responsible, Informed, Sign-off, Consulted.

VARISC names the roles that actors hold on an activity, such as a Change. One actor may hold several roles on an activity, and a role may be held by several actors:

- **Responsible**: performs the work.
- **Accountable**: answers for the outcome.
- **Consulted**: is asked for input before or during the work.
- **Informed**: is told of progress or outcome.
- **Verify**: verifies the work, in the sense of verification: a deterministic, reproducible check against a stated expectation. Judgment, including review by a person or an Agent, is validation, not verification.
- **Sign-off**: accepts the outcome. Sign-off is a decision by the Accountable actor, resting on the verification and validation seen. It is not a type of control.

A role is an assignment of an actor to an activity. It is distinct from structural ownership, which assigns an artifact to the capability, Agent, Skill or Extension responsible for it. A role never decides or changes ownership, and a capability, Agent, Skill or Extension is never accountable: an actor is. A capability can own an artifact while different actors are Responsible, Accountable and Verify for a Change to it.

Verification, validation, an approval record, sign-off and the execution of the governed action stay distinct. An approval record is evidence that a review operated, and evidence of sign-off only when whoever approved is the Accountable actor. A gate that requires verification and approval before the action takes effect is a preventive control that combines them. Executing the action, by hand or automatically, is none of these. A verification or a review is independent only when whoever performed it is not whoever was Responsible for the work, and that is claimed from who acted, never from which accounts recorded it.

VARISC keeps no matrix or registry of assignments, and requires no Node to carry roles.
