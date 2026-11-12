# C1 change

## PLAN

1. Add I1, F1 to F3, N1 and A1 to A3 with their Cases T1 to T8, the scenario key (A3), and C1 with its own Cases T9 to T11, one per gap, under `packages/kaal-classify/`.
2. Observe the expected RED against `main` (`evidence.md`).
3. Propose the contract, the placement and the examples (`proposal.md`), and apply the rules to #1404 and its decomposition (`application-1404.md`).
4. The PLAN adds no Skill, no recorded trial and no package shell, changes no other capability and no pull request, and cites no document that is not on `main`.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Author the candidate Skill `skills/kaal-classify/SKILL.md` (A2) and the minimal package shell, without adding the package to `workspaces`.
2. Run the trial: an agent given only the Skill answers the ten statements of the key, and its answers are recorded unedited in `trial/answers.json`. A difference from the key is a finding about the Skill or the key and is reported, not corrected silently.
3. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green, and run them with the package's own test script, as `kaal-controls` does.

## ACT

1. A 4L retrospective of the Change (Liked, Learned, Lacked, Longed For), from the viewpoint of the agent that carried it, delivered to the collector before it is promoted.

## Dependencies

Testing owns Case design and verification, Graph owns the relationship vocabulary and Controls owns what a claim about a control may say. The Skill cites them. Applying the Skill to C4 is for the Change Isolation Change and needs its own decision. Deployment into agent discovery locations, publication and promotion to `main` are separate, explicit decisions.
