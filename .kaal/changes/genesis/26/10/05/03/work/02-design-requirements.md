# Admission into the lineage: requirements

Vocabulary: the **baseline** is the KAAL directory as already admitted; the **candidate** is the KAAL directory proposed for admission. Admission is a judgement over exactly that pair.

## R1. What a complete, admissible Change is

A Change is admissible exactly when it is closed: the one process evaluator reports `CHANGE CLOSED` with no problems, which already means sealed Work, `retro-work.md`, `retro-observe.md` and a valid Change seal over all of it. Admission adds no completeness rule of its own and consumes that verdict. Both retrospectives are therefore required for admission because they are required for closure; requiring fewer or more is a change to the process evaluator, not to admission.

## R2. Which Change an admission admits

The Change an admission admits is found from content alone: the closed Change in the candidate whose identity is not closed in the baseline. No title, label, number, name or any other declaration says which Change is meant.

## R3. One Change per admission

Exactly one new Change is admitted at a time. Zero is refused (R5); more than one is refused, so that the correspondence between an admission, a Change and its retrospectives is one to one and mechanical.

## R4. An incomplete or unsealed Change is refused

Any Change in the candidate that is neither in the baseline nor closed makes the candidate inadmissible, and the refusal names the Change, its stage and what the evaluator says is next. A Change open in the baseline is judged as before, which keeps a Change already in flight finishing under its own rules; this clause admits nothing once no open Change remains in the baseline, so it needs no list and no end date.

## R5. A candidate with no new Change is refused

Everything that joins the lineage is a Change to KAAL and has its record. There is no Change-less class of admission, and no list of exempt paths.

## R6. Evidence precedes the crossing

The Change seal is part of the candidate. Nothing the admission relies on can be written after acceptance, and once admitted, the Change is held by the existing control that keeps closed Changes closed and by seal checking. Sealing is not weakened or reordered: Work is sealed before the retrospectives, the Change after both.

## R7. Many steps without staging in the lineage

Implementation of a Change may take any number of steps. They happen on a line of work that is not the lineage, where nothing is judged as admitted and the Change is simply open. Only the finished candidate crosses, as one admission. Any state a step leaves behind is not the lineage's concern.

## R8. A boundary that must not mix with a Change record

Protected machinery boundaries must keep travelling alone, and a Change is also the record of changes to that machinery (R5). The two requirements are reconciled by treating the Change record, which is sealed text under `changes/` that no machinery reads, as the one thing that may accompany an isolated boundary. This is the single place where the design touches an existing control, and it is held as an open question rather than a decision.

## R9. Deterministic, and no host concepts

The verdict is computed by KAAL machinery from two KAAL directories, using the existing evaluator and sealing identity and re-implementing neither. The concepts of whatever hosts the lineage are not KAAL ontology and appear nowhere in Core, in a Node or in Work. A host's job is to produce the two directories, run the check and enforce the verdict.

## R10. Honest limits

Admission proves that a Change was completed, sealed and carried by the candidate. It does not prove that the Change describes the rest of the candidate faithfully; that remains the work of review and of the observer's retrospective.
