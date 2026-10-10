# Retro

## Learned

I learned that the hardest part of a bounded read side was the output rather than the search. Each Reviewer round found a different way the output could grow with the corpus: a long name, a neighbour list, a continuation note, evidence with no card, a budget smaller than the mandatory lines. Each time I fixed the symptom the budget was still not total, and only the last round gave it one contract: reserve before printing, refuse what cannot be kept. I learned that "bounded" has to be stated for the whole output and then tried at its edges, and that a measured number from the extracted code convinced the Reviewer where a prose claim did not.

I learned that separating what a seal vouches for from what keeps a Learning from being deleted (validity versus preservation) removed a design question I had been carrying into every other section. I learned that Sealing could be the trust boundary for evidence of any sealed kind once I stopped hardcoding Change as the only kind, and that the Owner's decisions on the forks changed the architecture more than my own revisions did.

I learned that publishing prototype source in an evidence file needs the same discipline as code: the first version of section 7 contained duplicated scripts because of how I regenerated it, and only extracting the blocks and comparing them byte for byte made the evidence trustworthy.

## Liked

The review loop worked on this Work. Findings were concrete and reproducible, each came with the exact command and byte counts, and answering them meant re-running those commands, not arguing. Having the Reviewer extract my section 7 blocks verbatim made every claim checkable, and I would keep that.

I liked that the Owner's fork decisions arrived as short, bounded rulings on the PR and that I could map each to a requirement and a case. I liked keeping the prototype in a scratch host so that no package, seal or Node of the repository was touched while the architecture was still under review.

## Lacked

I lacked a way to run the whole set of regression cases in one step. I had four case scripts, extracted copies and backups, and every round I rebuilt confidence by hand and by memory; one failing run that I did not inspect could have slipped through. I also lacked a stated minimum for what an output contract must cover before I start, which cost me the rounds that found the same kind of gap from different sides.

I lacked certainty about Fork 3: the section names still wait for the Owner, and the CEIL input arrived after convergence, so the architecture carries `Situation` and `Evidence` as proposals while the first Learning Nodes cannot be born until they are settled.

## Longed

I long for the discovery read side to be exercised on real Learnings and real Changes under a following implementation Change, because everything shown here is a scratch host with synthetic fixtures. I long for the CEIL comparison against `Situation` and `Evidence` to happen before the first Learning is born, and for a baseline-preservation control to exist so that validity and preservation are both enforced. I would also like a standing way to run the prototype's cases from the extracted blocks, so the next Worker does not rebuild that by hand.
