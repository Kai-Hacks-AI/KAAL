# Reference: BRITTLE lessons

**Be Right Improving Testing Targets Learned Experience.** A Test Case is brittle when its verdict follows something other than its target:

- a **false RED** rejects a change the target permits, such as an extension its Architecture authorizes;
- a **false GREEN** accepts a real violation of the target.

Either is a defect of the Case, not of its subject.

## Recording a lesson

The Change that corrects a brittle Case records the lesson in its own PLAN, beside the Case's testing. A lesson names:

- **the case**: its identifier and the version that was brittle;
- **its kind**: false RED or false GREEN;
- **the target**: the Intent, Requirement, Architecture or Defect the case traces to;
- **what it froze or missed**: the incidental detail it froze, for a false RED, or the violation it missed, for a false GREEN;
- **the correction**: the new version of the case, or the new case, and what it now asserts.

## Correcting the case

The correction traces to the same target as the brittle case. It is a new version of that case, or a new case, never a silent edit, so no earlier Run of the brittle version stands for it any longer. It applies the design checks in the Skill's section "Designing a case: BRITTLE": the target's authority outside the candidate, exactness only where the target fixes it, strict closed vocabularies, and discriminating negatives with a positive for each authorized extension. A planned test is corrected only through a new PLAN, as a planning defect.

## A lesson and a Defect are kept apart

A lesson is about the case. Where a false GREEN let a real violation of the subject escape, that violation is also a Defect of the subject: a durable prohibited behaviour, traced by a case that tests it. Record the two separately. The lesson's correction improves the case, and the Defect's RED establishes the violation. A later GREEN evidences the correction within its scope and never erases the Defect.

## Who decides

Testing owns the term, the design checks and the shape of a lesson. This is verification: a check that decides the same way every time. Review owns the judgment of whether a change is a legitimate extension, and whether a case is brittle where no check decides it. This is validation, and Review's own guidance may apply BRITTLE. Each capability owns its cases, corrects them, and records its own lessons. Testing keeps no registry of lessons.
