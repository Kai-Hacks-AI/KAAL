# Retro

## Learned

The cutover confirms that the host boundary becomes simple once the Extension owns Git reading and adaptation: GitHub workflows only need to prepare the runtime, build kaal-github and invoke a named control. Change, admission and seal semantics do not need to reappear in .github.

It also reinforced something about the current agent behaviour: the seal-before-Observer sequence has persisted across several Changes without being manually reintroduced. The worker is following KAAL's present process literally. That is useful evidence that changing the process in ROWING should change the agent handoff structurally rather than relying on conversational convention.

## Liked

Bash dies as a control implementation in the same Change that makes the Extension authoritative. The old scripts and their duplicate tests disappear rather than becoming compatibility shims, while the existing GitHub job names and triggers remain stable for branch protection.

The lineage projection-currency control also lands at the correct boundary. It observes kaal/* after merge and on demand, uses the existing KAAL install check, and is deliberately not a PR gate, so a stale projection can be surfaced without preventing its repair.

I also like that .github now describes itself as invocation rather than process implementation. The workflows know how to run the host adapter; KAAL continues to own the meaning of the verdicts.

## Lacked

This Change is the first live CI use of the new Extension controls. Until these jobs run successfully here, equivalence with the retired Bash path is supported by package tests and local invocation rather than prior production CI history.

GitHub-side merge orchestration remains implicit: Owner approval and required CI checks are separate signals today, with GitHub branch protection providing the final merge gate. Making that relationship explicit, if useful, remains future host policy rather than part of this cutover.

And once again, independent review arrived only after Work was sealed. The consistency of that behaviour is now evidence about the current KAAL process itself, not an accidental habit of one Change.

## Longed

For the new lineage workflow to report green on kaal/genesis after this merge and for the Extension-backed controls to become the only live GitHub path.

For ROWING to be next and change the actual process ordering to Work and Review while mutable, convergence, then Work seal and retros. If the agents continue taking KAAL this literally, that process change should move the handoff naturally rather than requiring repeated instruction.

**Observer conclusion:** the sealed Work completes the GitHub cutover cleanly. The workflows invoke kaal-github, the Bash control implementations are removed, the lineage projection signal is non-blocking by design, and no KAAL process semantics move into .github. No blocking finding for #59.
