# C24 baseline

The baseline is `main` after the promotion of pull/C6 (#1583). The templates `plan`, `do`, `act`, `sync` and `promotion` under `.github/PULL_REQUEST_TEMPLATE/`, the default `.github/pull_request_template.md` and the fallback text of release/A41 carry no cue. The envelope judge reports "the body has text before the first chapter" for any text there.

Reader test, before the change: two fresh agents were given only a link, PROMOTION #1583 and PLAN #1579, and asked how the Change reaches use, how the solution works and what changes from current to target, citing repository files. Both reached the Change files (`packages/kaal-release/plan/pull-wire/`, `package.json`, `ci.yml`) through the changed-file list and the comments, not through the body, which both called thin. That works only while the Change's files are part of the diff.
