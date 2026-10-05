# Retro

## Learned

"Sealing" was three questions I had been answering as one: what an artifact's identity is, how a seal is recorded, and when something must be sealed. They have different owners, and the work only became coherent once I let each domain choose its own identity form and gave Sealing nothing to decide. I first parameterised only directories; the file case, which is a Node's bare bytes, was missing until I saw that files and directories, named or unnamed, are one grammar. I also learned that I can describe a boundary more broadly in words than the code holds it: I wrote that Core's private sealing existed to birth the first Skills, and it can only seal Core's own artifacts.

## Liked

Asking the state of a Change instead of reading a status. It told me the next step each time, and when I had to replace the Work seal after correcting the Work, recomputing the identity independently and getting the same ID was cheap and convincing. I also never reached for RATIFICATION as a step, which suggests that leaving it as vocabulary was right.

## Lacked

A stated rule for what a Change's Work may hold. I put a record of delivery mechanics in the Work because nothing told me it did not belong, and I only saw the mistake because the Work was about to become immutable. Nothing in the model either said how a Skill's own first Node is sealed before the capability that seals exists; I used a bootstrap helper outside Sealing and Core, and the audit has to say so by hand.

## Longed

For a domain to declare its own identity form and domain name in one place that an agent and anything enforcing seals from outside can both read, so that nobody has to know that a Change is a directory identified one way and a named tree another. I did not want a finer boundary inside Work: one sealed audit was the right size for this Change.
