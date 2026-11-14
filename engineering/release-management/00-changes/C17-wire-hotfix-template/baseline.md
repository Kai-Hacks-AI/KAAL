# C17 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality. release/C11 is on `main` (#1517) and this Change depends on nothing else.

- `main` holds the PLAN, DO, ACT, SYNC and Promotion templates in `.github/PULL_REQUEST_TEMPLATE/` and no HOTFIX template.
- `main` holds the template draft of the Hotfix in `engineering/release-management/00-changes/C11-hotfix/interface.md`, section "Draft of the template", and A39, which names `.github/PULL_REQUEST_TEMPLATE/hotfix.md` as the deployment target.
- Nothing on `main` shows that an installed copy is the draft.
