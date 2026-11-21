# ACT library sensitivity: Evidence

Run on `main` at `d046b2d1` with Node 22.23 (the sandbox has no Node 24; these Cases need none).

## RED on main

`node --test packages/kaal-testing/test/plan/act-library-sensitivity.test.mjs`: 2 tests, 0 pass, 2 fail, each by assertion (`missing: …/pilot.md`), none a load error.

## The Cases can pass, and fail for the right reason

A throwaway record outside the repository (a `pilot.md` with a pinned SHA, twelve complete rows, K8 listed untested, a Justified Cases section and a Files added list inside `packages/kaal-testing/`, with `requirements.md` copied beside it, found through `KAAL_TESTING_PLAN_DIR`) makes both Cases pass. Five variants of it each fail exactly one Case, for the named reason: no SHA, a claim with neither a row nor an untested line, a survivor with no allowed judgment, a file added under `engineering/`, and eleven rows.

## What this does not show

That the pilot itself finds anything. The record is the DO's, and its prose is judged by review, never by these Cases.
