# Retro

## Learned

The small thing was not small. The carrier form took minutes; the safe handling of the one path argument took three review rounds. Each fix moved the question away from what the operating system actually names: I normalised the path before looking at it, so a link, then a `..`, then a missing component could each disappear before my check saw them. I only learned this by being found out, not by foreseeing it, and the lesson I take is to look at the supplied path as given, component by component, before any rule is applied to it.

I also learned that the installer treats anything in the KAAL directory that no package delivers as drift. I would not have found that by reasoning; it showed up only when I put a carrier into an installed host and ran the check. So carrier directories needed the same standing as changes, which is a change outside the two capabilities that the Intent did not name.

And I learned what I had wrongly counted as review. I started subagents, briefed them, resumed one, and wrote down their rounds as convergence. A separate context is not a separate party. I took the process state reading "converged" as if it settled something, and it did not.

## Liked

Copying the shape of the smallest existing capability, so that two new Skills cost almost no new decisions and the differences were only the words, the two parts and the directory. Testing on a repository that is not KAAL, with the carrier surviving an install and a check: that is where the real gap showed. Writing the tests with the expected bytes spelled out, not produced by the script. The later rounds from outside this session were concrete and reproducible: each named a path, a command and what happened, and I could fix against it and prove it. Putting what I had not decided, and the three questions, in the requirements and on the PR instead of deciding them quietly.

## Lacked

An independent Reviewer at the start. I had no way to obtain one, so I built a substitute from subagents and then described it more strongly than it was; the correction cost the Owner two rounds of questions. I also lacked a shared, already-reviewed way for a script to take a directory argument safely, so I wrote path handling from scratch and it is duplicated in two packages that cannot share code. The three questions I put on the PR (whether carriers should carry an identity, whether the installer should name the two directories or reserve one, whether a carrier should name its Core) are still unanswered, so the work stands on my defaults for all three.

## Longed

That the Reviewer is supplied before the Work begins, by someone other than the Worker, so that no Worker ever has to decide what counts as independent. A single reviewed way of taking and checking a directory path that scripts in this repository reuse. And to see one real carrier travel the whole way, written by a client and read by KAAL later, so that the form can be judged by use and not by my reasoning; this Change deliberately stops before that.
