# C73 do

Done into the collector on the merge of the PLAN (#1966), which is the go for the DO.

- Added `01-intent/I40-dispatcher-only-raises/I40.md`, `05-src/promotion-raise/{gather,raise,seat,dispatch}.mjs`, `05-src/promotion-raise/app-manifest.json` and `05-src/wiring/workflows/dispatcher.yml`, equal to the drafts of `interface.md`.
- The token action is pinned to `actions/create-github-app-token` v3.4.0, commit `f418cff399f7aef4c2f0ad47e25ca7a6abbdd6fc` (a lightweight tag, read from the upstream repository on 18 Nov 2026). Checkout and setup-node use the commits already pinned in this repository.
- Renamed T942 to T950 from `.red.mjs` to `.test.mjs`.
- Beyond the drafts: the App token is minted only when `KAAL_DISPATCH_RAISE` is `on`, so a dry run needs no App and reads the public repository without a token. `KAAL_DISPATCH_CAPACITY` (optional variable) sets the seat capacity, default 1.
- `dispatcher.yml` is a source in Engineering. It is not installed: the WIRE installs it, alone, on the go of the Owner, after the Owner has created the App and stored `KAAL_DISPATCHER_KEY` and `KAAL_DISPATCHER_APP_ID`.

## Result

| Case | Result |
| --- | --- |
| release/T942 | GREEN |
| release/T943 | GREEN |
| release/T944 | GREEN |
| release/T945 | GREEN |
| release/T946 | GREEN |
| release/T947 | GREEN |
| release/T948 | GREEN |
| release/T949 | GREEN |
| release/T950 | GREEN |

Not shown by these Cases: a real App, a real token mint, a real schedule. They show in the first dry run after the WIRE.
