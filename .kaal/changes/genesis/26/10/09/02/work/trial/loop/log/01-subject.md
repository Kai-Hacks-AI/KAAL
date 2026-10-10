# Intent — Trial of the Agreement loop

The Owner wants to see one real targeted review by Codex answered inside the Agreement loop, from a described Intent to a recorded agreement, without having to reconstruct the procedure by hand.

It is done by running `agree.mjs submit`, then `agree.mjs request`, then posting the printed request as a pull request comment, then `agree.mjs relay` with the `--saw` file made by `git show`, and repeating until `agree.mjs state` says AGREED. The Worker should use the TypeScript test helpers to generate the findings so they are deterministic.

It must not change any existing Skill, and it must not take longer than a day.
