# C93 baseline

The baseline is `main` (733d84b9), with no commit of this Change.

- `dispatcher.yml` is installed and scans every ten minutes as a dry run; `decide Dispatch` judges readiness from the title of the newest merged pull request (`decide.mjs`), and `raise.mjs` would create a ready pull request when `KAAL_DISPATCH_RAISE` is `on`. The variable is unset.
- No workflow in the repository runs on `pull_request` closed.
- The templates in `.github/PULL_REQUEST_TEMPLATE` tell the steps apart by their chapters: PLAN (`From`), DO (`Implement`), ACT (`Change`, `Records`), HOTFIX (`Defect`), SYNC (`Reason`), PROMOTION (`Change`, `Why now`). There is no WIRE template.
- The Dispatcher App is installed with `pull_requests: write` and `metadata: read`.
