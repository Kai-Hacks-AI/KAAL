# C118 baseline

The baseline is `main`.

- Hosting reads a Git revision by name (`revision`, `readRevision`, the command `kaal-hosting-revision`): the commit a ref names, and the files of a commit. Nothing reads the event of a GitHub run, and nothing says what a run judged.
- A caller that needs the revision of a run takes it from `GITHUB_SHA`. On `push` and on `merge_group` that is the judged commit; on `pull_request` it is the test merge commit GitHub creates, and on `pull_request_target` it is the last commit of the base. The head that was judged is only in the event (`pull_request.head.sha`).
- Release repaired its three records one by one: the head comes from `--head` or `KAAL_HEAD_SHA`, pinned by release/T1603, T1607 and T1608. Each caller still decides where the head comes from.
- Testing's C84 (#2881, in its collector) will make a record that names the trigger, another id or a short id evidence of nothing. It cannot know what was judged: it compares names.
