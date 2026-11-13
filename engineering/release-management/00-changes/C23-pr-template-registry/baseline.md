# C23 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality.

- `main` holds the PLAN, DO, ACT, SYNC and Promotion templates in `.github/PULL_REQUEST_TEMPLATE/`, and the old default `.github/pull_request_template.md`.
- Only SYNC has a text of its own, `03-architecture/A34-sync-template/sync-template.md`, and release/T121 shows that the installed `sync.md` equals it.
- The DEFAULT text (A41) and the HOTFIX draft (C11 `interface.md`) are on `main`, not installed.
- There is no folder `05-src/pr-templates/`, no manifest and no install mechanism.
