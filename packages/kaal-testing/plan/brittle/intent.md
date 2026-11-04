# BRITTLE: Intent

This is `testing/C41`, a PLAN Change. It ships no code. `testing/C42` turns its planned tests GREEN.

**What the Owner set.** On #664 (comment 6541453440), the Owner named **BRITTLE**, **B**e **R**ight **I**mproving **T**esting **T**argets **L**earned **E**xperience, and asked Testing to establish it in its own PLAN, separate from Hosting's Change:
- Test Cases challenge their intended targets without freezing incidental implementation details.
- Testing learns from a false RED, a legitimate architectural extension rejected, and from a false GREEN, a real contract violation missed.
- This PLAN defines how such lessons improve Test Case design and trace to the relevant Intent, Requirement, Architecture or Defect.
- Testing remains verification and Review remains validation. Review may consume BRITTLE in its validation guidance, but Testing owns the testing concept.
- Hosting keeps its own bounded correction and records its observed lesson. Hosting does not own the general term.

**The originating example.** In `hosting/C15` (#664), hosting/T21 and hosting/T24 froze the exact `exports` and `files` lists instead of challenging their target, hosting/F15's "interface unchanged":
- They rejected a legitimate extension, the `./boundary` entry that hosting/A13 authorizes. This was a false RED.
- They stayed GREEN on an export pointing at an absent file. This was a false GREEN.
- A misspelled status in the contract would also have made a required entry optional.

hosting/T41 corrects all three. It reads the target from an authority outside the candidate, hosting/A15, strictly, with a discriminating negative for each violation and a positive for the authorized extension. Hosting records this in its own `plan/interface/testing.md`.

**What exists.**
- Testing's guidance traces each Case to one subject (TEST A FINDING) and feeds evidence into the next PLAN ("Inform Next Generation").
- Its model versions each Case (testing/F24) and states what it tests (testing/F25), and an older Run never stands for a changed Case (testing/F40).
- Its findings already keep verification and validation apart.
- Nothing yet says what makes a Case brittle, how to design one that is not, or what to do with a lesson once a brittle Case is found.

- **testing/I19**: A Test Case is Right when its verdict follows its target and nothing else. Testing names the two ways a case goes wrong, false RED and false GREEN, gives the design checks that prevent them, and makes each lesson improve the next Case through the same traces and versions Testing already has.
