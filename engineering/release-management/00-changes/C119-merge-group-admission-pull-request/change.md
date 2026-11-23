# C119 change

## DO

1. Add the source `05-src/wiring/workflows/merge-group-admission.yml`: the installed workflow with its trigger changed to `pull_request` (same types) and its comment saying why that is safe.
2. Add Case T1322 (release/I50): the source has no `pull_request_target` by the reader of release/CTL19, triggers only on `pull_request`, holds no permission (`{}` on the file and on the job), has no checkout, no action, no secret and no event data, and keeps the job name `Change Isolation (review)`.

## Accept list

The `.github` file and the engineering Cases that read it are untouched, so they stay green. The WIRE amends engineering/T139 when it installs the source.
