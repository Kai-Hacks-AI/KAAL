# BRITTLE: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A23** [testing/F72–testing/F75, testing/N15]: BRITTLE ships in Testing's two existing documents and one new reference, and in no code:
  - `payload/Testing.md`, the `Testing` Node, states what BRITTLE means in one section, `## BRITTLE`: the term, false RED and false GREEN, and that a lesson improves the next Case through the same traces and versions. The Node's meaning is authoritative.
  - `skills/kaal-testing/SKILL.md` gains a section, `## Designing a case: BRITTLE`, beside TEST A FINDING. It gives testing/F73's four checks as steps and points to the reference.
  - `skills/kaal-testing/references/brittle.md` gives the lesson record of testing/F74, how a correction is versioned and traced, false GREEN as a Defect, and the ownership of testing/F75. It names no other capability's identifiers and cites no Change or pull request.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the term, the design checks, the lesson's shape, and these documents |
| Review | the validation of legitimate extensions and of brittleness no check decides; its guidance may consume BRITTLE |
| Each capability | its Cases, their correction, and its recorded lessons, such as Hosting's on #664 |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C41` PLAN, this Change | Testing | none |
| `testing/C42` DO: the Node's section, the Skill's section, the reference, testing/T84–testing/T87 GREEN and in the suite | Testing | `testing/C41` |
| Hosting's lesson links this PLAN as the general concern | Hosting | `testing/C41` |
| Review's validation guidance consumes BRITTLE | Review | `testing/C42` |
