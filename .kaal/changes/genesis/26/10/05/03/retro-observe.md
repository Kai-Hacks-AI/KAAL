# Retro

## Learned

The predicate is smaller than the three design documents around it suggest: about thirty lines of set arithmetic that delegate closure to the process evaluator and identity to the existing Change code, and the code matches the architecture's formula closely. I learned that new is defined by address and identity together, and that this makes a renumbered staged Change and a moved closed Change behave differently on purpose. I also learned that the sealed Work records the two-Changes decision (R8) as a rule, but says nothing about how this Change came to be split or reopened. That history is only visible in retro-work.md, so the Work and the retro describe the same Change at different moments.

## Liked

The requirements are numbered and each refusal in the code maps back to one of them, so I could check the predicate against the text without guessing. The Honest limits section (R10) says plainly that admission proves a Change was completed and sealed, not that it describes the rest of the candidate faithfully. The architecture separates what the predicate does from what the host does, and the code header repeats that boundary. The acceptance test names read as a list of cases: found by content, empty baseline, moved whole, two Changes, each open stage, retro before seal, history altered, unjudged open Changes.

## Lacked

Three things were missing for me. First, the sealed Work contains only design prose. The predicate, tests, README and skill wording that the architecture says this Change carries are not in work/, so I had to read them from the repository and could not tell from the Work alone that they were part of it. Second, I found no record that the tests were run or what they showed, so my reading of "the red check" and "the reopening" in retro-work.md rests on its own telling. Retro-work.md also says the code and tests stayed the same while the Change's boundary moved. I could not confirm that without history, which I was not to consult. Third, the intent says the Change is complete in itself and carries the predicate, tests and documentation, while its Out of scope section and R8 exclude the host realization. Those two statements are consistent, but the Work never says which host parts were removed, so the boundary is stated only by what is absent.

## Longed

To read a Work whose files show the shape of the Change they seal: a short account of what the Change carries, listed by path, beside the design, so that an observer can check the claim against the files without searching. I would also like an example refusal from a real run quoted somewhere, so the evaluator-worded reasons can be seen and not only inferred from the code.
