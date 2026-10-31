# BRITTLE: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/brittle.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK, and `testing/C42` turns them GREEN and adds them to the suite. They read the documents the package ships, and exercise `kaal-testing/model` through its public interface.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T84: the Testing Node defines BRITTLE, its expansion, false RED and false GREEN as defects of the Case, and learning through the same traces and versions | testing/F72, testing/F74 | Requirements |
| testing/T85: the Skill's BRITTLE section gives the four design checks and points to the reference, which ships | testing/F73 | Requirements |
| testing/T86: the reference gives the lesson record, a correction that traces to the same target as a new version or Case, a false GREEN as a Defect that a later GREEN never erases, and Testing as verification with Review as validation; it cites no Change, pull request or other capability's identifier | testing/F74, testing/F75 | Requirements |
| testing/T87: through the model, a corrected Case version leaves the brittle version's Run no longer current, and a Case that tests a Defect is traced to it | testing/F74, testing/N15 | Architecture |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/brittle.test.mjs`. At `testing/C41`, three are behavioural RED. Each fails on the content it requires, not on a missing import:
- testing/T84: the Node has no `## BRITTLE` section;
- testing/T85: the Skill has no `## Designing a case: BRITTLE` section;
- testing/T86: the reference does not exist in the packed package.

testing/T87 is GREEN at `testing/C41`. It shows that BRITTLE's learning needs nothing beyond the merged model (testing/N15). It guards that as a regression case and is not counted as RED.

**These tests and BRITTLE.** Each document check asserts a set of required statements by their key terms, and never a whole text, its order or its length. The DO may word, extend and reorder each section freely. Each check was run against today's files (RED) and against a minimal draft of the three sections (GREEN). Removing one statement's key terms from the draft, 30 times over, turned its test RED in 29. The other removed only "equality where" and left "exact" in the same sentence, so the statement still stood (equivalent). The lesson record is checked as one block, a paragraph or a list, that names all its parts, so a record cannot be assembled from words scattered across the reference.
