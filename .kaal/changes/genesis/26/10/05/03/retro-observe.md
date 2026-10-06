# Retro

## Learned

The admission rule is smaller than its three documents suggest. The code is one set comparison in about thirty lines, and closure, identity and history are all delegated. I learned that "new" is defined by content, as no baseline address and no closed baseline identity, which is why a renamed closed Change is refused as "not new" rather than treated as an addition. I also learned that the predicate checks only that a Change is closed, not what its retrospectives contain. The tests close Changes whose retros are the bare line "# Retro", and those are admitted. R10 states this limit, so it is a documented boundary and not an omission. The command is named `check-kaal-admission` in the Work and README, `admit` in the CLI and tests, and `admit-lineage.sh` appears among the host scripts. These are consistent, because the README maps the npm script onto the subcommand, but I had to read three places to see that.

## Liked

The requirements carry their own refusals. Each of R3, R4 and R5 maps to a distinct reason string and to a test, and the architecture's list of what the Change carries matches the test names closely. I liked that the Work states what it does not do (no phase metadata, no registry, no way to remove a seal), and that the out-of-scope section says plainly that host wiring is not described here. The test for baseline Changes that are not closed shows the "no exception" stance as behaviour, not only as prose. The code header repeats the Work's boundary (knows nothing of Git, PRs or CI), so the claim can be checked against the imports, and the imports bear it out.

## Lacked

The moved-whole test accepts either of two messages (`no closed Change with that identity|no new Change`). It therefore does not pin which refusal the design promises for that case. Its fixture also creates and then removes a directory, which makes the intent hard to follow. The Work says the host's controls are delivered by this Change but are not described in it, so the isolation edit and the host script, which retro-work.md discusses at some length, have no sealed description I can check them against. I could see that `.github/scripts/admit-lineage.sh` exists, but nothing in the sealed Work says what it should do. The architecture also says the Change's own steps "were staged together", but nothing in the sealed material shows that. I had no record of the order of events or of the question about host wiring that retro-work.md mentions, so I could not weigh that account.

## Longed

A check that the retrospectives are more than present, even a minimal one, or an explicit decision recorded as such that none is wanted, so the limit in R10 is a choice and not just a fact. I would like the one-to-one mapping from requirement to refusal to be visible in a single place, since it is spread across the requirements, the code messages and the tests. I would also like the Work to name the predicate's input contract, meaning what makes a path count as a Change address, so that a reader does not have to open `changes.ts` to know what "address" means.
