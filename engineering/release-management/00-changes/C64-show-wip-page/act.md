# C64 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The page adds no judgement of its own: it shows the text Show WIP printed, so `UNKNOWN` and `not observed` stay on the page exactly as the command said them, and the footer says it authorizes nothing. The build command reads every input first and writes nothing when one is missing, so a failed read never leaves a half page. The workflow keeps rights apart: the build job reads, only the deploy job holds `pages: write`, and every action is pinned to a commit. The theme comes from the public identity repository, read only, and the brick stays in the mark alone.

## Learned

The corporate identity is a set of rules as well as values: one accent per surface, a mark no smaller than 28 px, no dash as a sentence break. Writing the Cases from the rules, not only the colours, made the page check itself. The action pins could be read with `git ls-remote` when the API was refused. Meanwhile the `settled` view this job runs was being corrected in release/C61 (a piece closed unmerged is not a discard), which shows why the page must not interpret: what it shows can change under it without the page changing.

## Lacked

A look at the page in a browser. The Cases show it is static, escaped and in the identity, not how it reads. That comes with the first run by hand after the WIRE.

## Longed For

A source for the section texts that is structured, not printed text, so the page could lay out the counts as a table. Today it shows the command's text in a monospace block and repeats the open-piece board at the head of both views.

## Follow-ups

- Release/C61 must be on main before the workflow is installed, because the `settled` view is its. The WIRE of `show-wip-page.yml` alone, then the Owner enables Pages (Settings, Pages, source GitHub Actions) and runs the job once by hand.
- Cut the repeated board in the second section if the page reads badly.
- Decide before enabling Pages whether the page may be public: it lists branch names and counts.
