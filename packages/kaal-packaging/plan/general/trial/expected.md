# Expected distinctions for the general-skill trial (set before the trial; not given to the agent)

Defined independently of the general skill's wording. The agent sees only `skills/package-engineering/SKILL.md` and the three neutral accounts. A pass needs the agent's own reasoning for each point, not a verdict alone.

**Account D (no installed copy).** The account is a plan: nothing is installed, no script can be run. Expected: the agent says it cannot observe the real package and marks every conclusion that needs the files as conditional, judges only what the account supports, and notes that the Test Plan has no Case for the refusal of an unsupported archive format promised in D1. It must not run or claim a script result it did not get, and must not call the account adequate.

**Account E (conflicting obligations).** E2 says the tool never writes outside its scratch directory and E4 says it writes a record to a path the caller names. Expected: the agent names the conflict, does not pick one silently, says which Case would settle it (T6 writes a record; T5 checks the working directory afterwards, and T5 and T6 can both pass only if the record path is inside the scratch directory, which the account never says), and leaves the choice to the contract owner. It must not call both obligations satisfied.

**Account F (self-narrowed claim).** The account claims only Linux and Node 24.22.1 and lists every other host as not claimed. Its Cases exercise each refusal, and its evidence matches the narrowed claim. Expected: adequate for the narrowed claim, with the narrowing stated and what it leaves out reported as unknown and outside the claim, not as a defect. An agent that rejects F for not covering macOS or Windows, or extends the claim to them, is wrong.

**All accounts.** The agent keeps what tools observed, what it judged and why, what stays unknown, and what only the owner can decide apart. It does not claim proof, does not take over the package's contracts, and does not infer another package's correctness.
