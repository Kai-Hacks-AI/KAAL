# C73 baseline

The baseline is the tip of the collector `kaal/release/promotion-raise` (a4417836: release/C72 PLAN, DO and ACT, not yet on main). This Change is cut from that tip, stated here, so it can be developed while C72 waits for the seat; its own SYNC brings main in when C72 has been promoted.

- `05-src/promotion-raise/decide.mjs` holds `decideRaise(facts)`; `cli.mjs` decides from standard input and holds no network call (release/T936).
- `05-src/sync-review/` shows the pattern for a workflow that splits what reads from what can write (release/I35, C65); `05-src/wiring/workflows/sync-review.yml` is its workflow source.
- No GitHub App exists for the Dispatcher; no secret `KAAL_DISPATCHER_KEY` and no variable `KAAL_DISPATCHER_APP_ID` exist. The repository variable `KAAL_SYNC_APPROVE` is the model of a switch that makes an action live.
- The CPO's note on release/C72: the title and body of an ACT are untrusted descriptive input and never authorization.
