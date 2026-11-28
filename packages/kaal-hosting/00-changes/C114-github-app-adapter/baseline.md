# C114 baseline

The baseline is `main`, with hosting/C113 (PR 2592) counted as planned.

- **Dispatcher** (Release): `engineering/release-management/05-src/promotion-raise/` holds `gather.mjs`, `raise.mjs`, `seat.mjs`, `dispatch.mjs`, `decide.mjs` and `app-manifest.json`, whose GitHub reads (`git/matching-refs`, `compare`, `pulls`, `git/ref`) go through a plain `fetch` (hosting/D11 stays OPEN). The App's id and key arrive as `vars.KAAL_DISPATCHER_APP_ID` and `secrets.KAAL_DISPATCHER_KEY` and the token is minted in `.github/workflows/dispatcher-raise.yml` by `actions/create-github-app-token`, with `permission-pull-requests: write`. `app-manifest.json` is `{ metadata: read, pull_requests: write }`, no events, a neutral name `App`.
- The first Dispatcher raise failed at the token mint: `GET /repos/.../installation` answered 404. A 404 (App not installed on the repository) and a rejected key look alike to the workflow.
- **Inspector and Approver** (Review): `kaal/release/inspector-app` exists as a branch; neither App has a manifest, token code or logo on `main`.
- No logo asset exists on `main`. No capability claims manifests, token minting or the Apps' API calls; Hosting's README, `hosts.md` and architecture say nothing about Apps.
