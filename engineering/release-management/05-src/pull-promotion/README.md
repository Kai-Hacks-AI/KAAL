# Pull Promotion: the command for this repository

`node run.mjs <owner/repo> declaration.json` reads the file state of the declared collectors through the `gh` command line (read-only GET calls of the REST API), runs the Skill's `pull-promotion.mjs` and prints which of them have fulfilled their PDCA, as JSON. The collector is the unit; pull requests are not read.

For each collector the declaration lists, in the declared order, it reads:

- the **delta** against `main` and the commits since the collector diverged from it (the host's three-dot comparison) and the files each commit changed, as the **history**, checked to be a line by ancestry (each commit follows the previous one, the first follows the merge base);
- the **tree** at the head (it holds the PLAN and DO evidence; the delta says whether there is anything to promote);
- the text of the files that match the declaration's ACT pattern;
- the **executions of Test Cases at the exact head**: the logs of the completed CI jobs of that head, where the test runner reports a Case under its scoped id (`scope/T<n>`) with a mark. The newest run of each job counts, and a red job counts against the Case.

A collector the host does not have is reported as not judged. A list the host cut, a history out of ancestry or a record it would not give leaves that collector without its file state: it is reported as not judged and the reason goes to stderr. The command exits 0 when it printed a result and 2 naming what it could not read.

- `read.mjs` maps the host's records to the facts the Script judges.
- `declaration.json` is this repository's declaration, with a **scope** per collector (path patterns bounding the capability it carries: its PLAN, DO, expected Cases and ACT are judged only inside it, so evidence inherited from `main` for another capability never qualifies it) the **Change-history retrospectives** it names under `act.history` (`plan/<change>/00-changes.md` and `00-changes/<change>/act.md`, never counted and never read) and the **concluding collector-level ACT**, a file named `concluding-act.md` inside the collector's scope, exactly one of which qualifies it. It is reviewed like any other file: the collectors in their promotion order (an Owner decision) and the evidence patterns (PLAN, DO, Case files, ACT file and the 4L headings).
- `evidence/` holds the runs on the real repository (pull/T14; the second reads PLAN and DO from the head tree, the third scopes them to each capability, the fourth to the work each owns, the fifth with test-file completeness, the sixth with the concluding ACT told from the Change history) and an excerpt of a real CI log.

Credential: `GH_TOKEN` or `GITHUB_TOKEN`, or an already signed-in `gh`; the command fails naming the credential when there is none.

**Limits.** Cases are found only as files matching the declaration's patterns (the package shape and the engineering `00-changes/<change>/T<n>.test.mjs` shape), and reported only under a scoped id; Cases that CI does not run have no execution and are not judged; Cases written inline in a suite file are not discovered. A Case whose log the host no longer keeps has no execution and is not judged. The result is advisory: it never says "ready", and promotion stays the Owner's decision. It is run by hand; no hook, workflow or scheduled job names it.

## Which qualifier is next

`next` is advisory. With one qualifier it names that one. With several it names the one of strictly highest value density, `value ÷ size`, compared exactly by cross-multiplication, only when every qualifier carries a valid `value` and `size` (positive integers) and the same `unit` (the size unit and counting method, for example `IFPUG FP 4.3`). Otherwise `next.collector` is null, `next.judged` lists the candidates and the Owner chooses. A missing size or unit is never defaulted and ratios of different units are never compared. The Owner decides `value` and records it in the declaration; the CPO advises and reviews the recorded declaration. `size` is a count, which function point analysis can inform; it does not measure value. This is a value-density heuristic, not WSJF, unless the Owner's `value` includes the cost-of-delay components. No value or size is recorded in `declaration.json` yet, so several qualifiers are judged today.
