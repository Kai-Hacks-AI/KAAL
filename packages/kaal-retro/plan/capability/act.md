Method: 4L
Subject: Making Retro its own capability (retro/C2), PLAN through DO. It supersedes the ownership statements of retro/C1.
Participants: the delivering agent only. The Owner's decision and the CPO's reviews are cited where they changed the work; no consumer's view is available.

## Liked
- Observation: The Owner's decision was clear enough to translate directly: Retro is its own capability, independent of Core and other packages.
- Observation: The Cases for the Nodes, the claim and Core's admission were red before the DO and green after it, and the Skill itself did not change.
- Potential improvement: When an ownership question is open, name the Cases that will settle it in the PLAN, as this Change did.

## Learned
- Observation: retro/T14 called `readClaim` with the wrong signature and failed against a correct claim.
- Interpretation: The defect was in the Case. A Case written without running the API it calls can look like a finding about the claim; running it red against a deliberately wrong claim would have caught this at PLAN.
- Observation: Core admits the Capability and Skill Nodes on a fresh temporary Engine (T12, T13).
- Interpretation: That shows the Nodes are well formed for Core. It is not deployed registration on main, and T15 only checks naming.

## Lacked
- Observation: This repository's own `.kaal/` Engine registers no Capability, so nothing here shows Retro admitted on main.
- Observation: Whether `capability/` and `payload/` belong in the published files was decided by following Testing's layout, not by a stated requirement.
- Potential improvement: Have the Owner decide whether and when Retro is registered in `.kaal/`, and whether #1638 validates collectors against admitted Nodes.
- Potential improvement: Confirm the packed files when publication is first considered.

## Longed For
- Observation: A single place that states, per capability, which collector name is legitimate.
- Potential improvement: Take it up with #1638, not here.

Decisions: None made. Statements in retro/C1 that name Learning as owner are superseded by this Change. Registration in `.kaal/`, publication, wiring, enforcement and promotion are for the Owner and CPO.
