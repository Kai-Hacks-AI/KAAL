# The trial part of architecture/F4 (moved from the Target by architecture/C15)

The Target requirement F4 keeps only its first sentence. What follows is the trial design it carried, as it stood.


The Skill's report ends in a next move: keep, split or ask. A trial that asks only for the parts and the finding cannot observe whether an agent chooses to ask. The trial therefore asks every agent, with and without the Skill, for the next move of each statement, and records it with the answer. `ambiguous` is a finding value only where the evidence supports it: S4 and S5 do not say whether a limit is an accepted Solution requirement or what "reliable" requires, so their next move is ask. The earlier trial of the same statements, which did not ask for the next move, stays on record unchanged.
