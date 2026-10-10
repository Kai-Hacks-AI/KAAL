# Retro

## Learned

That my first model was bigger than the Intent needed, three times over. I proposed a read-only `trace`, then a sibling capability with minted identities and reconciliation, and each time the Owner's answer was to take something away. What survived is small: a sighting per attempt and a stored carrier per client and hash. I also learned how easily I fuse a storage key with a meaning. The Reviewer showed with the existing Request writer that two writes of the same texts give two paths and one hash, so equal bytes are not evidence of one communication, and my first requirements had said they were. And I learned that a guard is only as good as the inputs its test tried: my link refusal passed every test I wrote with a plain absolute Record path and failed for a trailing slash, because I sliced a normalised path at an offset taken from an unnormalised argument. Last, that the address of a Change really is not its identity: moving it from 08/04 to 09/04 left the Work identity byte for byte the same.

## Liked

Reusing what was there. Pulling `check`'s reading of `reach.md` into one `readAttempt` meant the sighting reader and `check-record` stand on the same strict form, and the existing 28 acceptance tests stayed green without being touched. Running the real Enercon carriers through the new commands gave the four points the Owner asked for a concrete shape. I liked the independent Reviewer reproducing each finding with the shipped script rather than reasoning about it, which is why the link and the check-scope defects were unarguable, and I liked recording my response per round in the evidence file so the next round could be judged against it.

## Lacked

A signal that a Reviewer round had landed. Rounds 03, 04 and 05 were pushed to my branch and the only thing that reached me was another red `contain-change`, which I had learned to read as the expected failure of an open Change, so I answered it with silence while three rounds waited and the base moved under me until the Owner called the PR stale. That is my failure to check the head against what I knew, and I lacked a habit or a notice that would have made me look. I also lacked a path-spelling case in my own tests, and a place in the Work to say where the limitation text lives, which is why round 02 had to ask me to align R8 with what I had actually written.

## Longed

A reader across the kept sightings: "which collections saw this carrier" is still a manual look at the sightings, and `trace` was withdrawn as the solution but not as a convenience once the model exists. I would also like the model run against a second real collection through a different adapter, and a real Record kept outside any Engine, so that continuity assertions and repeat sightings are exercised by something other than my own fixtures.
