# C7 change

## PLAN

1. Add I3, F10 to F12, N4 and A5 to A7 with their Cases T8 to T15, the scenario key (A7), and C7 with its own Cases T16 to T18, one per gap, under `packages/kaal-controls/`.
2. Observe the expected RED against `main` (`evidence.md`).
3. State what is retained, changed and deferred (`retention.md`), and the route to `main` and the evidence before it (`promotion.md`).
4. The PLAN adds no Skill, no recorded trial, no package shell and no Node, changes no other capability and cites no document that is not on `main`.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Author the candidate Skill `skills/kaal-controls/SKILL.md` (A6), concise, from the retained semantics of `retention.md`, and add the minimal package shell (`package.json`, `LICENSE`, `README.md`, `ownership.kaal.json`) without adding the package to `workspaces`.
2. Run the trial: an agent that is given only the Skill answers the scenarios of the key, and its answers are recorded unedited in `trial/answers.json`. If an answer differs from the key, that is a finding about the Skill or the key, and is reported, not corrected silently.
3. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green, and wire them where the other capabilities' Cases run.

## ACT

1. A 4L retrospective of the Change (Liked, Learned, Lacked, Longed For), from the viewpoint of the agent that carried it, delivered to `main`.

## Dependencies

Testing owns verification, validation, findings and Case design, and the common relationship model is Graph's. The Skill cites Testing and defines neither. Deployment into agent discovery locations, publication to npmjs and the decision to promote to `main` are separate, explicit decisions.
