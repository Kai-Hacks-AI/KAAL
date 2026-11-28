# release/C196: the Dispatcher App variable and secret follow the KAAL_APP convention

## Reason
Owner convention (28 Nov): the App of a KAAL App is named `KAAL_APP_<NAME>_ID` (a repository Actions variable, not a secret) and `KAAL_APP_<NAME>_KEY` (the secret); the Inspector and the Approver already use it. The Dispatcher workflows still read `vars.KAAL_DISPATCHER_APP_ID` and `secrets.KAAL_DISPATCHER_KEY` (found by Hosting). One convention, one way.

## The contract
1. `dispatcher.yml` and `dispatcher-raise.yml` (sources under `engineering/release-management/05-src/wiring/workflows/`) read the App id from `vars.KAAL_APP_DISPATCHER_ID` and the private key from `secrets.KAAL_APP_DISPATCHER_KEY`, in the same step and the same job as before. Nothing else in the workflows changes: not a permission, a trigger, a job, a pinned action or an order.
2. No name of the old pair remains in the sources, the Cases or the docs of release/C73 and release/C93 that describe the workflow as it is now: they say the new pair. Historic baselines (what did not exist at the time) stay as written.
3. The carried Case release/T946 asserts the new names where it asserted the old ones, and its expectation is otherwise unchanged (the job that reads holds no App; the job that raises mints the token). This amendment is the PLAN for that change of expectation.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1780: both workflow sources use the new pair and none of the old pair, the id comes from a variable and the key from a secret, the App token is minted only in the job that raises, and every action stays pinned.
All red until the DO.

## DO
The two workflow sources, T946 and the C73 and C93 docs. Sources only.

## Not in this Change
No WIRE: the installed `.github/workflows/dispatcher*.yml` change by a WIRE that travels alone on its own go, after the Owner has added the variable `KAAL_APP_DISPATCHER_ID` and the secret `KAAL_APP_DISPATCHER_KEY`; until then the installed workflows keep reading the old pair. No App credential, variable, secret, ruleset or policy is created or changed here.

## Design: split and overlap
Split: none. Overlap: hosting/C114 (names the old pair in its baseline, a history), release/C173 (uses the new convention for the Approver and Inspector).
