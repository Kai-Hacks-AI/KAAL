# C14 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls/enforcement-unit`, each by its own pull request, squashed. The collector is branched from the collector of C12 because the Cases need its finder.
2. ACT goes into the collector. The collector is promoted to `main` as one promotion, squashed, only after C12 is on `main`, after a sync with `main` and the CPO's approval at its exact head.

This PLAN authorizes no workflow, no ruleset change, no App, no secret and no publication. The package is published to npmjs only with Kai's go.

## Steps that are Kai's, and when each is due

| Step | Due when | What |
| --- | --- | --- |
| 1 | the promotion of C14 is on `main` | Create the GitHub App "KAAL Quality Control" from `enforcement/app-manifest.json` on the organization or account. |
| 2 | the App exists | Store its private key as the secret named in `engineering/controls/stations.json`; hand over the App ID, which is not a secret, so a small Development PR sets it. |
| 3 | release's registration of CTL8, its ruleset change (C66) and `verify Stages` reading the registry (C70) are on `main` | Install the workflow and the integrating ruleset through a WIRE, run beside the existing rulesets as usual. |

Nothing in this PLAN is due from Kai before the DO is promoted.

## Smallest coherent promotion

The finder, three scripts, two templates, one reference, the pointer lines, KAAL's map, and the files of the Change.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Structural | Cases T920 to T928 green | verified by Cases |
| Operational | a signed check by the App on a real pull request | an observed run, for `running` only, after the steps above |
| Validated | the CPO reads the workflow and the manifest and judges that no candidate can reach the key | judgment, not a Case |
