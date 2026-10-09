# Retro

## Learned

The central observation is that the six review rounds were valuable, but expensive. They exposed real architectural weaknesses before implementation, particularly around integrity, evidence verification and bounded navigation.

Independent review and refusal testing materially strengthened the architecture. Future Changes should exercise these boundaries earlier, reducing review cycles without weakening governance.

## Liked

- The independent review process challenged assumptions with reproducible refusal cases rather than accepting plausible prose. Six rounds converged, with F1–F10 resolved at architecture level.
- The architecture retained its boundaries: Core owns Node/Edge identity and admission; Sealing is independent; Learnings are ordinary Nodes; BRAIN does not invent a second identity system.
- Owner decisions corrected early overconstraints: human-readable filenames and movable folders, evidence from sealed KAAL artifacts rather than only closed Changes, and no migration from historical KAAL-genesis.
- Bounded navigation became demonstrable: stable IDs survive clipping, pagination continues through neighbours and evidence, and impossible output budgets refuse rather than silently exceed the promise.
- The result remained an architecture Change. Scratch prototypes provided evidence without being mistaken for an admitted Skill.

## Lacked

Six review rounds are substantial. Several failures were preventable by testing refusal paths, execution outside the source repository, long names, output limits and continuation earlier. Initial proposals also made premature choices about filename identity and evidence kinds. These are lessons for future Work, not grounds to reopen this converged result.

## Longed

- Test the public installed boundary and negative cases early, including missing, corrupt, moved and oversized inputs.
- Keep machine-checkable mechanics deterministic while preserving Markdown prose for human and Agent understanding.
- Treat bounded context as a functional navigation contract, not just a card-count limit.
- Maintain explicit distinctions among architectural agreement, prototype evidence, admitted capability and runtime authority.
- For realization, explore CEIL (Cue, Evidence, Insight, Learning) against the provisional Situation/Evidence vocabulary before the first Learning Nodes are established; do not retrofit CEIL into this converged Change.
- Prioritize minimum viable 0.0.1 behavior: a fresh Agent can find relevant knowledge and perform governed Work without the Owner reconstructing instructions.
