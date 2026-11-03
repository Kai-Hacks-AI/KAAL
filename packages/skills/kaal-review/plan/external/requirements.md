# Review External acceptance: Requirements

Each requirement names the #978 requirement it serves. Review owns its own declaration and its own subject role in the trial; it does not own the External bar.

| ID | Requirement | Serves |
| --- | --- | --- |
| review/E0 | The Review package has one declaration for outside consumers, `skills/kaal-review/references/standalone.md`, linked from `SKILL.md`. It is the only place those statements are made; the README and the Nodes point to it and do not restate it. | R1, R4 |
| review/E1 | The declaration states that the Skill and its references stand alone, and lists what it needs: nothing but a reader. Optional commands are listed as optional with their requirement (Node 24 or later). Where `SKILL.md` or a reference mentions a KAAL Engine or Nodes, the declaration says they are optional and where their text is. | R4, R8 |
| review/E2 | The declaration states the intended effects in the R5 vocabulary: advice and a procedure followed in plain text; two optional commands that read the files they are given and print; no write to the target repository by the Skill or its scripts themselves (an authorized agent may still post the review result to the target, under the target's authority). The record is text the invoker may publish under the invoker's authority. It states that Review grants no authority and that the target's owner or context governs every effect. | R5 |
| review/E3 | `check-record` and `collect` import only Node built-ins and files inside the Skill, read only the files named on the command line, and write nothing but standard output and the exit status. The declaration is true of them. | R4, R5 |
| review/E4 | Every dependency the declaration lists is readable as text from the same place as the Skill, at the same version. | R8 |
| review/E5 | A citation or trial names a commit of `kaal/review` or `main`. The declaration says that the text is versioned by that commit and that the record schema is `kaal-review/1`; Review defines no other version scheme. | R6 |
| review/E6 | The acceptance run for Review follows #978 section 6 and the claims under test are Review's own: that an Agent following the Skill reviews work in any repository; that it leaves a record that validates against the schema; that it leaves the human what to observe; that it grants no authority. | R7 |
| review/E7 | A Finding from the trial that Review confirms with a test becomes a Defect in Review's plan with a RED Test Case. An unconfirmed Finding is answered with reasoning. The trial result is input to the Owner's decision and never a gate. | R7 |
| review/N3 | The change keeps `SKILL.md` under 100 lines and keeps the package free of capability and role names. | existing N1, N2 |
