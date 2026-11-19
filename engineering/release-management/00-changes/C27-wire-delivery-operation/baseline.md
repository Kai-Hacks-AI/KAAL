# C27 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality.

- `main` has the PR types PLAN, DO, ACT, SYNC, PROMOTION and HOTFIX, each with a template in `.github/PULL_REQUEST_TEMPLATE/`. There is none for an install.
- Installs happen as DOs (the HOTFIX and envelope-cue templates, the C18 workflows). A Case that compares the installed file with its source (T181, T204) stays Change-local RED until the install, so the collector cannot finish CHECK before the install, and the install cannot be proven before the collector is promoted.
