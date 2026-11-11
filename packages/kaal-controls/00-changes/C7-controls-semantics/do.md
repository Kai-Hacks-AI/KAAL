# C7 do

What the DO delivered, and what was observed.

## Delivered

- The candidate Skill `skills/kaal-controls/SKILL.md` (A6): 598 words, the four types, how they cooperate and stay independent, what a claim may say. It cites Testing.
- The package shell: `package.json` (private, not in `workspaces`, so it cannot be published), `LICENSE`, `README.md`.
- The runner `test/cases.test.mjs`, so `npm test` in the package runs every Case.
- The Cases renamed from `T<n>.red.mjs` to `T<n>.test.mjs`, unchanged.
- The recorded trial `trial/answers.json`, from `trial/prompt.txt` as `trial/protocol.md` states.

## Observed

- One fresh agent was given only the prompt (the Skill and the eight situations, without the key). It used no tool. Its reply was recorded unedited. All eight answers equal the key: S1 directive, S2 preventive, S3 detective, S4 corrective, S5 detective and preventive, S6 directive and detective with the claim unsupported, S7 preventive with the claim unsupported, S8 preventive with the claim unsupported.
- All 11 Cases (T8 to T18) are green in the package (`npm test`: 11 pass, 0 fail). They were red on `main` (`evidence.md`).
- One run shows what one agent did once. It does not show that every agent distinguishes the types, and it shows the Skill matches the key, not that the key is right.

## Not done, and why

- `ownership.kaal.json` is not added. An ownership claim names the Node of the capability or Skill that owns the path, and this slice has no Node (N4). It waits for the Change that adds one.
- The Cases are not listed in Engineering's CI, which names its test files in the root `package.json`. The package is outside `workspaces`, and changing the root is outside this Change.
- The Skill is deployed nowhere, nothing is published and nothing is promoted.
