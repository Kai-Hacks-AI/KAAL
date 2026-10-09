# Retro

## Learned

The code answered questions my reasoning would have got wrong. I expected admission to check that the Change process had been followed; running `admit` on a Change sealed with the bare `seal` showed it checks only that the tree is sealed. That one run changed the whole shape of the separation, because it showed which controls already depend only on the artifact.

My first extraction line was wrong in a way I could not see from the prose. I moved `WORK` and `currentWorkId()` to the Process while keeping `checkChanges()` in Changing, and `checkChanges()` needs both. Round 01 found it by running a probe I had not thought to run. I learned that a responsibility map is only as good as the call graph behind it.

I learned that I argued the Process type from meaning and was overruled by a reading I had underweighted: `core/Agent.md` already says a Skill may be for a "kind of work". The Owner's direction was coherent with the sealed text, and my argument was partly an argument for what I found tidier.

I learned that the Codex trial on #72 shows less than it first looks like. Every part of the lens was supplied in the comment, and neither Skill is installed in this repository's `.kaal`, so Core's discovery was never in the path. I had to check that before I could say what was unproven.

## Liked

Scratch runs against the real scripts were cheap and decisive: three small ones (a lens round in and out of `review/`, a bare-sealed Change through admission, a Process-typed Node through `registerSkill()`) each settled a question that would otherwise have stayed an opinion.

The `compass({identity, markers})` seam was already where the artifact and the order meet, which made the extraction line something to find rather than invent.

The reviewer's round 01 was specific and reproducible: it named the function, the probe and the verdict that would change. Resolving it meant fixing the design, not arguing about it. The Owner's two comments gave direction at the moment I could have gone on polishing the wrong alternative.

## Lacked

I lacked a way to ask what composes a given Node. References run only from later to earlier, so "which Processes cite Intent" is a reading, and the discovery route ended up linear in the installed Skills with nothing to filter on but the Node's lead.

I lacked a dry run for `next-change`. I ran it as a probe at the start and it created an empty directory, then ran it again for real and got `09/02`; I had to remove one directory by hand. It is a small thing, but it is an allocator with a side effect that looks like a query.

I lacked a Way of Working for any D except Intent, so the internal lenses for Requirements, Architecture, Code and Operations have no standard to examine against, and the model could only say the external ones are available.

I lacked a clear point at which the Owner's briefing becomes an Intent. I kept the briefing in `work/01-intent.md` in the Owner's wording, and could not tell whether that is what the Owner established, which is the very question the Codex finding on #72 raises.

## Longed

I long for the discoverability trial to be run before anything is built: the same unprompted question, once with a Process statement installed and once without, so the claim that a Process makes a lens discoverable rests on an observation and not on a design.

I long for a recorded place for a useful targeted-review finding to land in the Change, so that a finding like Codex's on #72 is not left in a PR thread that no retro will read.

I long for the artifact layer's few places where the order's vocabulary leaks in, `work/` as the one recognized named tree above all, to be named as compatibility rules in one place, so a later extraction does not have to rediscover them by probe.
