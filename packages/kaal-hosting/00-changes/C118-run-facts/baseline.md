# C118 baseline

The baseline is `main`.

- Hosting reads files and Git revisions: `read`, `list`, `readFile`, `digest` (SHA-256 of bytes), `revision` and `readRevision` (the files of a commit, and the command `kaal-hosting-revision`, which prints per-file digests). Nothing gives the identity of a set of files, nothing reads the event of a GitHub run, and nothing states the content of a working copy and its provenance side by side.
- A caller that needs a revision of a run takes it from `GITHUB_SHA`. On `push` and on `merge_group` that is the commit the event names; on `pull_request` it is the test merge commit GitHub creates, and on `pull_request_target` the last commit of the base. The head the pull request names is only in the event (`pull_request.head.sha`). Either way a commit id names Git's idea of a revision, not the files that were examined.
- Release repaired its three records one by one: the head comes from `--head` or `KAAL_HEAD_SHA`, pinned by release/T1603, T1607 and T1608. Each caller still decides where its revision comes from.
- Testing's C84 (#2881, in its collector) makes evidence name the content it examined as an opaque identity (any non-empty string, no Git concept) and checks the record against what the consumer says it examined. It cannot know which content that was; the consumer says. Nothing yet gives the consumer an identity of content to say.
