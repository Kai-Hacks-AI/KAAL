# Intent

KAAL enables agents to collaborate across distinct process roles without requiring the human Owner to manually orchestrate every handoff.

## Constraints

- Preserve semantic boundaries. Worker, Owner and Reviewer remain distinct roles with distinct acts.
- Do not equate role with agent. One agent may perform multiple roles; multiple agents may collaborate on one Change.
- Do not equate transition with permission. A legal next process step should not automatically require another human "go".
- Require independence only where it has meaning. Agent switching is not manufactured merely to make the process look independent.
- Keep authority explicit. The Owner's actual judgment remains the Owner's act; collaboration machinery must not silently manufacture it.
- Allow continuation. Once an authorized act creates the conditions for subsequent legal acts, an agent may carry those forward where its authority permits.

## Test

After the Owner performs the one act that genuinely requires the Owner, can the collaborating agent take the Change from that handoff through the remaining legal process without the Owner becoming a message router?

This is the friction observed in Change `genesis/26/10/07/02` (#47).

## Not decided

Whether the answer is a handoff artifact, a capability, a protocol, a permissions model, or nothing new at all. The Change is about collaboration, not automation; automation may follow from it later.
