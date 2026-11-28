# C47 do

The DO of the merged PLAN (#3018), approved by the CPO. The one file changed is `engineering/github/branching-audit.sh`; `lineage.ts`, its verdicts, the workflow and the rulesets are untouched, so there is no WIRE.

- **A deleted branch** exits before any call ("API calls: 0").
- **A landing push** reads the pull requests of each commit the push landed (`commits/<sha>/pulls`, 100 a page) and the latest merge records of its ref (`activity?...&ref=<ref>&activity_type=pr_merge`, one page): two calls for a one-commit push.
- **A collector creation** reads its creation record and then the default branch's activity, newest first, until a page reaches back before the creation (`stateAt` needs one earlier change): two calls in the usual case.
- **The daily run and the dispatch** read everything to the last page, as before, and also run Lifecycle. A push to `main` no longer runs Lifecycle.
- **Every run prints `API calls: n`.** A paginated read adds its further pages once read, so the number is the requests made.

## What the CPO asked the DO to show: multiple landings and incomplete results cannot escape judgment

Run by hand against a local repository and a stand-in for `gh` (the Cases T1750 to T1756 do not pin these, see the ACT):

| Situation | What the audit did |
| --- | --- |
| A push that lands three commits, the middle one with no pull request | judges each commit on the commit before it: three Landing verdicts, the middle one fails ("GitHub associates no pull request"), exit 1, four calls |
| A commit with 100 pull requests (a full page) | "widened", then reads everything as before, exit 1 on the verdict |
| The latest 100 merge records of the ref hold none of this push | "widened", then reads everything |
| More than 20 commits in the push, or a `before` that is not in the history of `after` (a forced push) | "widened" |
| GitHub answers with an error | "cannot judge", exit 2, one call |

A widened push is judged exactly as the audit judged every push before this Change. The unaccounted-merge check on a push covers the commits of that push; the daily run keeps the full comparison.

## Cases

T1750 to T1756 are GREEN: T1750, T1751, T1753 and T1754 were RED, and T1752, T1755 and T1756 stayed GREEN. **T1753 passes by the order of the parameters**: its last assertion looks for `per_page=100` with no `ref=` after it, so every activity URL here puts `per_page` before `ref`. The assertion means "no unfiltered activity read" and a URL with `ref=` before `per_page` would trip it by mistake. That is a defect of the Case, to be corrected by a PLAN amendment, and no Case expectation is changed here.
