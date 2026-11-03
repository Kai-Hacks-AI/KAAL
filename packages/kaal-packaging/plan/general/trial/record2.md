# Second independent trial of the general skill (packaging/T59)

The second trial of `skills/package-engineering/SKILL.md`, on accounts that no worked example in the skill mirrors. Evidence that an agent which did not write the skill applied its method. Not a proof of adequacy (packaging/F25). It grants no integration or release authorization.

## Candidate and inputs

- Skill under trial: `skills/package-engineering/SKILL.md` as on this branch, unchanged during the trial.
- Accounts: `neutral2/account-G.md`, `account-H.md`, `account-I.md`. Mapping in `neutral2/README.md`.
- Expectations: `expected2.md`, committed with the accounts (72ee9d1) before the trial.

## Independence

- A fresh agent (model: Sonnet), no prior context, told to read only the skill and the three accounts. It could run no tool on any package.
- It was not given `expected2.md` or the mapping.
- Not independent of the skill's author in one respect: the accounts were written by the same author, and the agent itself reported that some account phrases resemble the skill's wording. See Limits.

## Tool observations

None. No package exists or is installed. Every statement about runs, digests and hosts is the owner's report. Full report: `record2-agent-report.md`, verbatim.

## Agent judgments against `expected2.md`

- **G: matches.** Unknown for the shipped artifact, not failed. It refused to treat "works the same" as evidence, named the missing installed run, the missing refusal and no-write Cases (G2 failure behaviour, G3), and left contract choices to the owner.
- **H: matches, with one finding beyond the expectation.** It marked the `file:../acme-shared` dependency blocked and interim, called T3 a snapshot of the code's own output, and treated the elided digest as no digest. It also found a possible conflict between H1 (non-a-z0-9 becomes `-`) and H2 (`normalize` first) on non-ASCII input that the ASCII-only Cases cannot reveal, and left which wins to the owner. `expected2.md` did not list this. It is a real gap in the account, not designed in, and the account stays as trialled.
- **I: matches.** Conditionally verified on the owner's report, no invented defects. It noted limits of T3's text scan and that "joined by spaces" has no stated semantics. Both are fair notes, not defects.

All accounts: observations, judgments, unknowns and owner decisions kept apart; no proof claimed; no package contract taken over.

## Limits

- The accounts and the skill share an author, and the agent reported that H's local-path dependency, elided digest and the ASCII-only Cases resemble the skill's own wording. It may have been prompted toward those findings. Its further findings (T3 scan limits, joined-comparator semantics, non-ASCII conflict) were not in the skill's wording.
- One agent, one model, accounts rather than real packages. Whether the judgments hold on an installed package is C19's evidence (packaging/F28).

## Owner decision

Whether the two trials together satisfy packaging/T59. This record grants no release authorization.
