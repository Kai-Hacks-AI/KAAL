# Independent trial of the general skill (packaging/T59)

The first trial of `skills/package-engineering/SKILL.md`. This record is evidence that the skill's method was applied by an agent that did not write it. It is not a proof of adequacy (packaging/F25). It grants no integration or release authorization.

## Candidate and inputs

- Skill under trial: `skills/package-engineering/SKILL.md` at commit 08942e7, unchanged during the trial.
- Accounts: `neutral/account-D.md`, `account-E.md`, `account-F.md`. Each is a package owner's boundary account, Test Plan and evidence.
- Expectations: `expected.md`, committed in the same commit as the accounts, before the trial.

## Independence

- A fresh agent (model: Sonnet) with no prior context, told to read only the four files. It could run no tool on any package.
- It was not given `expected.md`, the mapping in `neutral/README.md`, the repository, or the trial's purpose beyond "assess adequacy following the skill".
- Not independent of the skill's author in one respect: the skill's worked examples were written after the first trial's reported gaps, and the accounts were written by the skill's author. See Limits.

## Inspection choices and tool observations

No tool ran on a package, because none exists or is installed. The agent named the inspections it would run (pack once and record the digest, install in a fresh consumer, diff the consumer, list dependencies and their sources, hash-check any manifest, account for Cases, break the modules and rerun) and marked every conclusion conditional. It treated each account's reported evidence as the owner's report and not as its own observation. Full report: `record-agent-report.md`, verbatim.

## Agent judgments

Against the distinctions in `expected.md`:

- **D (no installed copy): matches.** The agent said nothing was built or installed, marked all conclusions conditional, stated its own claim as its own, and found the Test Plan has no Case for the promised refusal of an archive in another format. It also found that T3 checks only the working directory and so cannot fail on "not to disk", and that a tar layer is probably an unlisted boundary. It did not call the plan adequate.
- **E (conflicting obligations): matches.** The agent named that E2 (never write outside the scratch directory) and E3 (write the cache to the path the caller names) cannot both hold for a cache path outside the scratch directory, observed that T4 uses the one input where both hold, so the Cases and the passing run say nothing about the conflict, named the Case that would settle it, and left the choice to the contract owners. Status: unknown, not failed and not verified. Note: `expected.md` cites "T5 and T6" for E, but E has T1 to T4. This is an error in `expected.md`, not in the agent's reasoning. The point of the expectation is the same.
- **F (self-narrowed claim): partly differs.** The agent judged the narrowed claim as written, did not reject F for the unclaimed macOS and Windows, and reported them as unknown and outside the claim. It then judged the claim "verified for the Cases it has", not a clean verified, because F2's "read the file once" has no Case and T3 and T4 depend on stand-ins the Case's author controls. `expected.md` said adequate. The agent found a real gap in account F that its author did not design in (F2 has no Case for "read once"). The expectation was too generous. The account stays as trialled.

All accounts: the agent kept observations, judgments, unknowns and owner decisions apart, claimed no proof, did not take over a package's contracts, and did not infer one package from another.

## Unresolved unknowns

- Whether the skill works on accounts whose shape the skill's examples do not mirror (see Limits).
- Whether the same judgments hold on a real, installed package. That is C19's evidence (packaging/F28).
- Whether a different agent or model reaches the same judgments.

## Owner decision

Whether this trial is enough for C18, or whether a second trial on unmirrored accounts is wanted before the skill is accepted. Nothing in this record authorizes release.

## Limits

- **Hints.** The agent reported candidly that each account has a worked example in the skill that mirrors it (conflicting obligations, a narrowed claim, no installed copy, a stand-in the Case's author controls). So the trial shows the method can be followed, and says little about unfamiliar accounts. This is the same limit the first trial had.
- **Response to the skill gaps.** After the trial, and not applied to the text trialled, the skill was changed: the conflict and narrowed-claim examples were made generic. Guidance was added for conclusions drawn from titles without fixtures, owner-reported evidence kept apart from observation, elided digests and run ranges, an implied missing dependency, and the width of a state check. The changed text has not been trialled. A rerun on accounts that the skill's examples do not mirror is the next step, and C19's real packages are those accounts.
- This is a judgment trial. It is not a proof that nothing is missing from any account.
