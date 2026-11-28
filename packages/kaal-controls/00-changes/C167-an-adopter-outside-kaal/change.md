# C167 change

## PLAN

1. Record the intent I35, the Requirement F230 and the Cases T1732 and T1733 (plain `.test.mjs`, never renamed), with the helper `consumer.mjs` that installs the shipped files into a temporary directory outside the repository, as an installed package would be.
2. T1732 is the consumer: its own stations (`Merging`, `Shipping`), four control records, a baseline file, a flag file; `findControls` and `registryAt` with its stations; `parseFlags`, `flagSource`, `validateFlags` and `decideOutcome` for its flags; `runControl` in detective, preventive and ratchet mode; and a check that nothing returned names a station that is not its own. It reaches the package only through the shipped files.
3. T1733 is a static guard: every relative import of a shipped script resolves to a shipped file.
4. Evidence on this tree (`main`, where the stations of C161 are not yet adopter input): T1732 is RED, because a valid declaration of the consumer is not listed (the fixed KAAL station list refuses its stations). T1733 is GREEN already, and stays as a guard against a future import of a shim or a Case. Both ran GREEN against the tree of the C161 collector merged with `main` (the sync PR #2998), with nothing else changed. Two mutations on that tree were each caught: a shipped library file importing a shim turns T1733 RED, and a KAAL station name in a recovery text turns T1732 RED.
5. No script, Skill word, workflow or record changes in the PLAN.

## DO

Not authorized by this PLAN, and there is no product change in it by design: the Cases turn GREEN when C161 is on `main`. The DO is only the repair of whatever the consumer shows beyond C161 (none showed on the C161 tree). If it shows nothing, the DO is the sync with `main` and the Cases green in the lane, with evidence in the pull request. The Change is promoted after C161, because its Case is RED before it.

## Public interface

The consumer imports `lib/find-controls.mjs`, `lib/registry.mjs`, `flags.mjs` and `adapter.mjs` by their shipped paths. It does not import a shim, and the package declares no `exports` map, so the shipped paths are the interface. A later Change may name them; this one does not.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Copy or the real install.** Copying the shipped files (`files` less the `!` entries) into `node_modules/@kaihacksai/kaal-controls`, because it needs no registry and no network and uses exactly what the publish would. `npm pack` into the consumer is the same set and slower.
2. **Ratchet library.** The ratchet step uses `runControl` in mode `ratchet` today. When C163 lands, its DO amends T1732 to run the ratchet through the library, and this fixture then covers the new library from outside as well.
3. **Where the consumer lives.** In the package's own requirement folder, as plain Cases, so the Workspaces lane runs it (C165), on a pull request and in the merge group.
4. **Not the trial.** The independent adoption trial (#2933) is by someone outside who does not see this fixture. The fixture exists so the trial finds the harder things, not the leaks.

## Not here

No WIRE, flag, station, required check, ruleset, migration of a KAAL control, npm publish or change of `private`.
