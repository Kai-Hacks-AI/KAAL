# C47 do

The DO of the merged PLAN (#3018), approved by the CPO. The one file changed is `engineering/github/branching-audit.sh`; `lineage.ts`, its verdicts, the workflow and the rulesets are untouched, so there is no WIRE.

- **A deleted branch** exits before any call ("API calls: 0").
- **A landing push** reads the pull requests of each commit the push landed (`commits/<sha>/pulls`, 100 a page) and the latest merge records of its ref (`activity?...&ref=<ref>&activity_type=pr_merge`, one page): two calls for a one-commit push.
- **A collector creation** reads its creation record and then the default branch's activity, newest first, until a page reaches back before the creation (`stateAt` needs one earlier change): two calls in the usual case.
- **The daily run and the dispatch** read everything to the last page, as before, and also run Lifecycle. A push to `main` no longer runs Lifecycle.
- **Every run prints `API calls: n`.** A paginated read adds its further pages once read, so the number is the requests made.

## Multiple landings and incomplete results cannot escape judgment

The CPO held the first DO for this. The behaviour is now pinned by Cases (the second PLAN amendment), not by manual runs:

- **Several landings in one push (T1758):** each commit is judged on the commit before it, so the one without a pull request fails by name.
- **A list that may be incomplete (T1759):** a full page (100) of pull requests for a commit, a push of more than 20 commits, and a `before` outside the history each widen to the full read, and the audit never passes on the thin read.
- **A full page of merge records (T1760):** it widens unless it holds the record of every commit of the push. The first DO widened only when none of the pushed commits was on it, so a partial cover left records unexamined; now a record missing from a full page widens, and a full page that holds them all keeps the narrow read.
- **An error from GitHub (T1761):** "cannot judge", exit 2, no pass printed, for a landing, a push to the default branch and a collector creation.

A widened push is judged exactly as the audit judged every push before this Change. The unaccounted-merge check on a push covers the commits of that push; the daily run keeps the full comparison.

## Cases

T1751 to T1761 are GREEN. T1757, T1751, T1753, T1754, T1758 and T1760 were RED, and T1752, T1755, T1756, T1759 and T1761 stayed GREEN. No Case expectation is changed here.
