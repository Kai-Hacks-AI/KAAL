# C15 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The rule ended up small and fail-closed: PASS needs a Core Registration scope claimed once and held by an admitted Capability, and every other situation is FAIL or UNKNOWN. UNKNOWN never passes, so the check is safe to run before anyone has landed a Registration.
- Splitting the code by what it may touch worked: the verdict function reads nothing, `evidence.mjs` reads only the files it is handed, and only `check.mjs` touches Git. The trusted-main boundary is one argument, not a convention.
- Reusing Core's own `evaluate`, `validate` and `assemble` (read from the workspace source, as `attribute.mjs` does) meant no new registry and no new Core field, and it kept working with Core unpublished and `.kaal/` undeployed.

## Learned

- My first reading of "capability identifier" was wrong: I derived a segment from a lowercased Node name. Core's identifier is the registered scope, and Core derives nothing from spelling. The CPO found it from the PLAN's own evidence; the lesson is to read the Registration requirements (core/F47-F49) before choosing an identifier, not after.
- The assessment contradicted the PLAN once the PLAN changed. A document that records an earlier conclusion needs a status section that says what is superseded, or the reviewer reads two answers.
- A node:test file is not a Case. Cases in this repository are `T<n>.test.mjs` files that export `id`, `tests`, `title` and `run`, and the engineering Case runner loads them. I wrote the first version as ordinary tests and found out only when `npm run test:engineering` flagged them; shared bodies in `cases.mjs` with one thin file per Case fixed it.
- The first Branching run on a new PR fails before auto-merge registers, and a disable and re-enable produces the run that counts. It cost two red runs that were not real failures.
- `check.mjs` reads files as UTF-8 text through Hosting's `execute`, which decodes output. That is fine for Nodes, which are UTF-8 Markdown, but a byte-exact reader would need a binary-safe path.

## Lacked

- Any Registration on main. Against `origin/main` the check reports 0 registered scopes and 4 admitted Capability Nodes, so every `kaal/<x>/<y>` collector is UNKNOWN and nothing demonstrates a PASS on real data. The Cases prove PASS only on fixtures.
- A declared owner for each Skill. Release, Review and Graph are Skills, so their collectors cannot pass until it is clear which Capability owns them.
- A decision on `engineering`, `architecture` and `retro`: they are non-Node namespaces and stay migration findings.

## Longed For

- Capability owners landing their own Registration, so the check can be run on real evidence and the migration findings shrink. The first one should be a Change by its owner on an already-passing collector.
- The Owner changing or retiring flat and legacy branches (`kaal/learning` and the rest), since no branch except `main` is permanent.
- A later, separate decision on whether and where to enforce the check. Nothing here wires a ruleset, workflow or hook.
