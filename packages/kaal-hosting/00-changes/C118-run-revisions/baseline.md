# C118 baseline

The baseline is `main`.

- Hosting reads a Git revision by name (`revision`, `readRevision`, the command `kaal-hosting-revision`): the commit a ref names, and the files of a commit. Nothing reads the event of a GitHub run, and nothing states the revisions of a run side by side.
- A caller that needs a revision of a run takes it from `GITHUB_SHA`. On `push` and on `merge_group` that is the commit the event names; on `pull_request` it is the test merge commit GitHub creates, and on `pull_request_target` the last commit of the base. The head the pull request names is only in the event (`pull_request.head.sha`).
- Release repaired its three records one by one: the head comes from `--head` or `KAAL_HEAD_SHA`, pinned by release/T1603, T1607 and T1608. Each caller still decides where its revision comes from.
- Testing's C84 (#2881, in its collector) makes a record that names the trigger, another id or a short id evidence of nothing. It takes `judged` and `trigger` as input and cannot know what was examined: it compares names.
