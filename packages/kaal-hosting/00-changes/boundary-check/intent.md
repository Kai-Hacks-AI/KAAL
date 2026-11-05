# Boundary Check Per Package: Intent

This is `hosting/C100`, a PLAN Change. It states what Hosting 0.0.1 must provide so that every package has a Boundary Check that can be aimed at any file or folder, returns a list of findings, and leaves what to do with each finding to a recorded decision. It ships no code. `hosting/C101`, `hosting/C102` and `hosting/C103` deliver it and turn the planned tests GREEN. It authorizes no DO, sync, promotion or publication: those stay with the Owner.

On 4 Nov 2026 the Owner ruled, for Hosting 0.0.1, that promotion is a hard gate and that these Changes are part of it:

- There is no boundary skill in Hosting. Hosting keeps a hosting skill. Not every package has its own skill on boundary checks.
- Every package has two Test Plans: a Package Check and a Boundary Check.
- The Boundary Check can be aimed at any file or folder, recursively. That shows whether a given target can be re-architected.
- Its result is a finding list. What to do with the findings is a decision, made afterwards.
- Platform logic belongs only in Hosting's implementation and in Hosting's tests. Platform logic in the code or tests of Guard, Core, Testing or any other capability is a valid finding. It is not a Hosting blocker. It becomes a Defect only by Kai's order: proved by a Test Case, then placed by Architecture against the target and owned there.
- The same line of code is not reported more than once.
- No parser in 0.0.1: the text scanner is good enough, and its failure direction is over-reporting.
- The promotion gate is B: every finding gets a recorded decision, with the technical judgment by the CTO and the product impact by the CPO.

The first run of today's tool over Foundation, Guard, Core, Testing and Graph (`hosting/boundary-findings-decision-list.md` in the project files) is the evidence: 345 findings, 173 distinct lines in 12 patterns once one finding per line is applied, and one production coupling (Guard's command resolution).

- **hosting/I15.** Anyone can aim Hosting's Boundary Check at any file or folder and get, with no framework and no dependency on the inspected code, one finding for each source line that holds platform logic, with the place, the rules and classes it hit, and the question a decider must answer. The check reports and never decides. A decision on each finding is recorded by its owner, outside Hosting. Hosting's own Boundary Check is not applicable, because Hosting is the boundary, and that is declared, not silent.
