# C102 baseline

The baseline is `main` (1168212), with no commit of this Change.

- The Inspector exists only as a design: `packages/kaal-controls/00-changes/C14-control-enforcement-unit/design.md` (judge step with no secret, sign step with the only secret, one check per registered control, a ruleset that pins the check to the App) and the first slice, which declares `stations` and the registry. No judge, sign step or workflow template is on `main` yet.
- No App manifest, permission list or workflow for the Inspector exists. The Dispatcher App was created by the Owner from its own reviewed need (release/C73, with the CPO's least-privilege correction): `pull_requests: write` and `metadata: read` only.
- Required checks in `integrating.json` and `promoting.json` come from the integration of GitHub Actions (15368). No required check is pinned to an App.
- The legacy sync review (release/CTL7 to CTL9) still runs on `pull_request_target`; the deadline to leave that trigger is 2 Dec 2026 (release/I50, release/CTL20).
- The log contract that every control will report its runs in (what it judged, caught and let through) is being planned by controls and is not on `main`.
