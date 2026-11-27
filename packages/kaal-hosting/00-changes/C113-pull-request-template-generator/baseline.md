# C113 baseline

The baseline is `main`.

- Seven templates stand under `.github/PULL_REQUEST_TEMPLATE/` (`plan`, `do`, `act`, `sync`, `promotion`, `hotfix`, `wire`) and a fallback `.github/pull_request_template.md`. They are hand written. Five have a source under `engineering/release-management/05-src/wiring/templates/`; `plan` and `do` have none.
- Release's `readTemplates` derives the type to chapters registry from the templates (`KAAL-PR-template` line). Release's API body builder knows the chapters on its own.
- Hosting reads open pull requests (hosting/C99 slice) and renders nothing. No capability claims a generator.
- Engineering's C37 plans one data file, `pull-request-types.json`, holding the seven types, their chapters and how each is recognised. It asks Hosting to own the generator and does not authorize it.
