# C166 change

## PLAN

1. Record the intent I34, the Requirements F228 and F229, and the Cases T1730 and T1731 (plain `.test.mjs`, never renamed).
   - T1730 derives the four facts of each control of the package from its own files and applies `assessRecord` (CTL3) to the claims. It is RED on `main` for a real reason: `implemented:lags` for each of CTL1 to CTL5, which are recorded `designed` while their checks exist.
   - T1731 requires `scripts/lib/judge-self.mjs` and its behaviour: the package agrees with its proof, a lagging record and an overclaiming record are each named, a missing revision or no controls throws, and the file imports no platform module. It is RED because the file is absent.
   - Both were run GREEN against a throwaway copy that is not committed: the function below (about 20 lines) and the five records raised to `implemented`. With them the whole package suite is 129 Cases GREEN (127 plus the two). Without them the suite is 127 GREEN and these two RED.
2. No script, record, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector `kaal/controls/own-controls`:

1. `scripts/lib/judge-self.mjs`: `judgeSelf({ files, revision })` as F229 says. It imports `./find-controls.mjs` and `../verify-record.mjs` only.
2. Raise `status` of CTL1 to CTL5 from `designed` to `implemented`: their checks exist as files of the Skill, and they are not claimed `running` or `tested`.
3. T1730 and T1731 GREEN; the whole package suite GREEN. Mutations, each caught by a Case: judgeSelf reading a file; a lagging record accepted; an overclaiming record accepted; `running` derived as true; an empty revision accepted.
4. ACT: a retro entry in the collector.

## What the proof of a fact is

`defined`: a valid declaration. `implemented`: the check exists in the Skill's scripts at `scripts/<name>.mjs` for a control in `CTL<n>-<name>`. `running`: false for every control of the package, because none is registered at a station and no run of the adapter is observed. `tested`: a Case of the package names the control itself in its `tests` list; none does yet, so `tested` is not claimed. The two later facts become claimable only by their own Changes, with the proof in them.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Where the mapping from control to check lives.** In the folder name (`CTL<n>-<name>` gives `scripts/<name>.mjs`), because the package's controls already follow it. Rejected: a new field in the declaration, which would change every adopter's schema for the package's own sake.
2. **Why `judgeSelf` and not a general runner.** The common mechanism and the ratchet library are C163. This Change is the first thing that mechanism would run; it adds no runner of its own and is adapted to the mechanism when C163 lands.
3. **Running it.** `judgeSelf` is a function. Running it on each pull request as a control is a WIRE for the Owner's go, and so is Guard registration.
4. **Order.** The DO does not depend on C161, C162 or C163, but touches `14-operations/controls`, where C163 adds CTL6. The DO is synced with main first if C163 is on main by then.

## Not here

No WIRE, flag, station, required check, ruleset, npm publish or change of `private`. `running` and `tested` claims for the five controls are later Changes.
