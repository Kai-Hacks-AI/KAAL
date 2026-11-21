# C121 change

## DO

1. Add the sources `promotion-source-relay.yml` and `promotion-source.yml` under `05-src/wiring/workflows/`, after the pattern of change-isolation-review-relay.yml and change-isolation-review.yml.
2. Add Case T1323 (release/I64): neither source uses pull_request_target; the relay triggers on pull_request only, holds no permission, has no checkout and uploads only the number; the handler triggers on workflow_run of the relay, sets the check in progress before it reads or checks out anything, checks out only the default branch, never the head, validates the number, reads the facts from the API, runs Promotion-Source, always completes the check and fails it unless the judgment passed.

## Accept list

The `.github` file and the engineering Cases that read it are untouched, so they stay green. The WIRE amends them when it installs the sources.
