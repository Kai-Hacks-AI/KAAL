# Retro

## Learned

I started with a clause that let Changes already open in the baseline stay free, and I thought of it as part of the rule. It was a rollout worry written into a permanent predicate, and the rule became simpler and more honest once it said only what an admission introduces and nothing about what happened before it. I also learned that I had read the unit wrongly: I took "design only, implement elsewhere" as the careful choice, when the whole point was that the Change, not its steps, is what crosses, so splitting it recreated the very overhead the rule is meant to remove. And I learned how much of the predicate already existed: closure, identity and history were all answered by the evaluator and the Change commands, and the new code is only set arithmetic over them.

## Liked

Building the predicate out of the existing evaluator, so that a refusal can name the stage and the next step the process already knows. Testing it through the command against small hand-written KAAL directories, because every refusal and the one admission were visible as plain exit codes and reasons, with no fixtures to share. I also liked that the host script has so little to do that its test could be written by the same pattern as the history control's.

## Lacked

A statement of what a Change record is that a control can consult. The isolation adjustment had to list `.kaal/changes` and two seal directories as path patterns, which copies the layout into a second place. Nothing told me either that renaming two packages would leave empty stale directories in my checkout that make the install check crash; I only found them by reading the stack trace. And for a while I lacked a settled reading of whether host wiring belonged in this Change, which meant that I stopped and asked about it, and then the answer arrived as part of a different message.

## Longed

To run the admission predicate against the real target before opening a pull request, as a single local command, instead of extracting the baseline by hand and passing two directories. I also long for the Change record to be named once, by the capability that owns Changes, so that the isolation control and the admission control can both ask it rather than carry patterns.
