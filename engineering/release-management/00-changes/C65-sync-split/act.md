# C65 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Kai's framing made the design: the old safety was a directive control, a promise that the scripts never run the candidate, and the split makes it preventive because the token boundary holds even if the code changes. Testing the idea against the real scanner before building it (the draft pull request #1887) turned an argument into a result: CodeQL flags a write job that fetches the candidate, also by commit name, and does not flag the split. Building the whole DO as a trial before the PLAN showed exactly which five Cases move and which do not, so the PLAN could say so.

## Learned

The scanner reads the privilege of the job, not the text of the fetch: rewriting the fetch to name a commit changed nothing, taking the token away did. The split costs one thing, the fresh re-judgment inside approve. Comparing two commit names (the head and the base's tip) gives the same protection, because the head fixes its parents and tree and the base's tip is the only input that changes under a SYNC. A pass whose base moved must still reach a person, since a push to the base does not start a new run of the SYNC; `review` now reads it as FAIL with the reason `base-moved`. A verdict that crosses a job boundary is data and has to be read as data: strict commit names, only the fields used, and text cut to plain characters before it can reach a comment.

## Lacked

The real scanner on the real file. The Cases state the shape CodeQL objected to; only CodeQL on the installed copy shows it agrees, and the source lives under `engineering/`, where CodeQL does not look. The local CodeQL CLI could not be downloaded here, so the experiment ran through a draft pull request. A way to remove the experiment branch `claude/exp-codeql-split` and the stale `kaal/release/sync-approval` myself.

## Longed For

A run of the CodeQL actions queries over a workflow source in `engineering/` without a throwaway pull request. The first live approval of a pure SYNC through the new shape.

## Left for the Owner

The WIRE that replaces #1885, shown clean by CodeQL on its own check run; then "Allow GitHub Actions to create and approve pull requests", `KAAL_SYNC_REVIEWER` if CODEOWNERS names only the author, and `KAAL_SYNC_APPROVE=on` after dry runs. The branches `claude/exp-codeql-split` and `kaal/release/sync-approval` can be deleted.
