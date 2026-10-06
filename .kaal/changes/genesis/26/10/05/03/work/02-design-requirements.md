# Admission into the lineage: requirements

Vocabulary: the **baseline** is the KAAL directory as already admitted; the **candidate** is the KAAL directory proposed for admission. Admission is a judgement over exactly that pair.

## R1. What a complete, admissible Change is

A Change is admissible exactly when it is closed: the one process evaluator reports `CHANGE CLOSED` with no problems, which already means sealed Work, `retro-work.md`, `retro-observe.md` and a valid Change seal over all of it. Admission adds no completeness rule of its own and consumes that verdict. Both retrospectives are therefore required for admission because they are required for closure; requiring fewer or more is a change to the process evaluator, not to admission.

## R2. Which Change an admission admits

The Change an admission admits is found from content alone: the closed Change in the candidate whose identity is not closed in the baseline. No title, label, number, name or any other declaration says which Change is meant.

## R3. Exactly one new Change per admission

A Change is **new** when the baseline holds neither a Change at its address nor a closed Change of its identity. Every admission introduces exactly one new Change. None is refused (R5), and more than one is refused, so that the correspondence between an admission, a Change and its retrospectives is one to one and mechanical.

## R4. An incomplete or unsealed new Change is refused

The new Change must evaluate `CHANGE CLOSED` with its required seals valid. If it does not, the admission is refused and names the Change, its stage and what the evaluator says is next. There is no exception for any Change and no list of them: the predicate judges what an admission introduces, and a collection that accumulated before the lineage rule applies is outside it. How a Change already in flight finishes is a matter of when the control comes into force, not a clause of the rule.

## R5. A candidate with no new Change is refused

Everything that joins the lineage is a Change to KAAL and has its record. There is no Change-less class of admission, and no list of exempt paths. (Decided by Kai on review.) Automated dependency updates may need separate treatment; that is left aside and must not weaken this rule.

## R6. Evidence precedes the crossing

The Change seal is part of the candidate. Nothing the admission relies on can be written after acceptance, and once admitted, the Change is held by the existing control that keeps closed Changes closed and by seal checking. Sealing is not weakened or reordered: Work is sealed before the retrospectives, the Change after both.

## R7. Many steps without staging in the lineage

Implementation of a Change may take any number of steps. They happen on a line of work that is not the lineage, where nothing is judged as admitted and the Change is simply open. Only the finished candidate crosses, as one admission. Any state a step leaves behind is not the lineage's concern.

## R8. Two Changes, in sequence

Defining the admission semantics and realizing them in the support engine that hosts the lineage are different Changes, each with its own allocation, evidence, retrospectives and seal, in that order. This Change is the first: the KAAL-native predicate, its tests and the guidance. The support engine's Change follows, and consumes a rule that already exists; it does not define the rule by changing itself. A protected boundary keeps travelling alone, and the only thing that may accompany it is the sealed record of the Change that mutates it. A KAAL semantic Change and a support-engine mutation are never collapsed into one Change. (Decided by Kai on review.)

## R9. Deterministic, and no host concepts

The verdict is computed by KAAL machinery from two KAAL directories, using the existing evaluator and sealing identity and re-implementing neither. The concepts of whatever hosts the lineage are not KAAL ontology and appear nowhere in Core, in a Node or in Work. A host's job is to produce the two directories, run the check and enforce the verdict.

## R10. Honest limits

Admission proves that a Change was completed, sealed and carried by the candidate. It does not prove that the Change describes the rest of the candidate faithfully; that remains the work of review and of the observer's retrospective.
