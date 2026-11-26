# C138 baseline

The baseline is `main`. The sources in `05-src/wiring/templates/` are `act.md`, `hotfix.md`, `promotion.md`, `sync.md` and `wire.md`. Only `wire.md` equals its installed copy under `.github/PULL_REQUEST_TEMPLATE/`; the other four sources are newer than the installed ones (the ACT source has three chapters with `HOW TO WORK`, the installed one two). `plan.md` and `do.md` are installed under `.github/PULL_REQUEST_TEMPLATE/` and have no source in engineering. None of the seven files holds a `KAAL-PR-template` declaration, and `.github/pull_request_template.md` (the fallback) does not declare DEFAULT.

`readTemplates` (A40) takes `{path, text}` files and returns a registry TYPE to chapters, findings and decisions. A typed template must sit under `PULL_REQUEST_TEMPLATE/`, declare once, and open with the chapter `Change`.
