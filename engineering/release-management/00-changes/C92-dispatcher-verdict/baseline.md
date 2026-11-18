# C92 baseline

The baseline is `main` (733d84b9), with no commit of this Change.

- `05-src/promotion-raise/decide.mjs` skips a collector as `not-ready` unless the newest non-SYNC merged pull request is titled `ACT:`; its skips do not name the collector. `seat.mjs` turns every raise after the first into `seat-taken`, so the collectors behind the first one have no verdict. A hand-closed PROMOTION does not stop a re-raise; only the marker of the Dispatcher does.
- `gather.mjs` reads facts from pull requests; it reads no test evidence.
- `dispatcher.yml` is installed and runs as a dry run every ten minutes. `KAAL_DISPATCH_RAISE` is unset.
- The ratchet (`ratchet`, `stateOf`, `verdict` of kaal-change, in the PLAN of its release/C12) is not on `main`.
