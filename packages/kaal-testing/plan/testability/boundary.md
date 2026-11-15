# Testability Assessment: the Testing and Review boundary, challenged

The CPO proposed (review on #1541): **Testing serves verification**, establishing objectively whether defined criteria are satisfied. **Review serves validation**, judging whether the criteria, decisions and outcomes are sound and fit for their purpose. The axis is the purpose of the assessment, not automated versus human or objective versus subjective. This note researches that, challenges it, and says what the PLAN changed.

## What the sources say

- **Verification and validation.** SEBoK, citing ISO/IEC 15288, defines verification as confirmation, through objective evidence, that specified requirements are fulfilled, and validation as fulfilment of the requirements for a specific intended use ([System Verification](https://sebokwiki.org/wiki/System_Verification), [System Validation](https://sebokwiki.org/wiki/System_Validation)). It contrasts verification as fault-detecting and supplier-oriented with validation as confidence-building and end-user-oriented, and says validation presupposes that verification has been done. This is the purpose axis of the CPO's model.
- **Verification is not only testing.** The four usual verification methods are inspection, analysis, demonstration and test ([IEEE TechNav](https://technav.ieee.org/topic/system-verification-and-validation/), a secondary source: I did not find the list on the SEBoK pages). IEEE 1012 likewise counts review and inspection among its V&V activities (see `review/review-test-boundary.md`).
- **The oracle.** A test proves something only where an oracle separates correct from incorrect behaviour; where none exists, a human or partial oracle is used ([Barr et al., IEEE TSE 2015](https://dblp.org/rec/journals/tse/BarrHMSY15.html)).

## Challenges to the model

1. **"Testing serves verification" is narrower than verification.** Verification also happens by inspection and analysis. KAAL resolves this with the CPO's own rule: once a criterion is objectively decidable it should be possible to test, even if not by a machine. So decidable verification belongs to Testing, and Review does not keep it. This makes the axis hold, and it needs saying in the Skill ("automated or not").
2. **The purpose axis needs an oracle test to be usable.** "Is this a verification or a validation question?" is itself a judgement. What an agent can apply is the question below it: is there an observable result and an unambiguous oracle? Yes is verification. So the oracle remains the working test, and the purpose is what it serves. Kai's "test is proof, review is judgement" is the same line seen from the method side. Both are kept and neither is a slogan the Skill depends on.
3. **There are two kinds of "no oracle".** An underspecified claim (E3, "sufficiently reliable") could be made decidable by its owner: that is a challenge. A fitness claim (E2, "usefully distinguish") cannot become a criterion, because fitness is what the criteria serve: that is a point at judgement. The handover's order put judgement second and pushback last. The CPO's order is better: challenge underspecification first. The section now orders Verify, Challenge, Point at judgement.
4. **Validation presupposes verification.** So pointing at judgement does not excuse skipping the verifiable part. A claim can be split: its decidable part is tested, and the rest is pointed at.
5. **A Case can verify the wrong thing.** The T3/S4 Case verifies an author's key, not the concept. The CPO's brittle-Case rule applies to it, and to this PLAN's own text-matching Cases (below).
6. **The Skill must stay independent of Review.** Using the words verification and validation does not make Testing rely on another Skill. The section names none.

## What changed in the PLAN

- The section follows the model: Testing serves verification, challenges underspecified claims first, points at judgement, and rejects brittle Cases (F129, F130, F133).
- I had dropped "validation" earlier on the strength of the IEEE reading. Under this model the word is right for the judged side, and the new text does not need it. The ban in T157 is gone.
- **This PLAN's Cases were brittle.** T156 and T157 matched sentences of the proposed Skill text. That verifies incidental wording. They now check structure only: the labelled outcomes in order, the labelled rules, placement, size, the owners, and that no other Skill is named. Whether the Skill makes an agent behave as intended is judged in the trial, and that is said in `testing.md`.
- The trial gained a fourth claim, E4, the T3/S4 situation: a Case whose oracle is an author's key. The key records its doubt, and Architecture's T3 key is not touched or tuned.
