# C129 do

What the DO built, against the decisions of `change.md`.

## Built

- `05-src/codeql-gate/lib/analysis.mjs` and `lib/alerts.mjs`: the pure layers (decision 8). `analysisFindings`, `waitForAnalyses`; `alertFindings` and the two threshold tables. They import nothing.
- `lib/read.mjs`: the only reader. It pages the code-scanning analyses of the sha and ref and the open alerts of the ref, with `fetchJson` as an argument. `lib/command.mjs`: what the two commands share, the environment in and a findings file or nothing out.
- `judge-codeql-analysis.mjs` (CTL34) and `judge-codeql-findings.mjs` (CTL35), each `--out <findings.json>`. The inputs are the environment variables of decision 2; the thresholds are read by the findings command only. The findings command is UNKNOWN when an expected analysis is not there, so it never reads an alert set it cannot trust.
- `04-controls/CTL34-verify-codeql-analysis/CTL34.md` and `CTL35-verify-codeql-findings/CTL35.md`, preventive, `status: designed`, `has` release/I68 and I69, no ratchet. Their `evidence` says what each control needs before it may claim `tested`: the fixture Cases (T1395 to T1401), two real runs and one provoked failure. The real runs and the provoked failure were observed by the experiment below.
- Cases T1395 to T1401, in this folder with `fixtures.mjs`.

## Verdict step

The commands write no verdict. The job runs, for each, `node packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs --mode preventive --findings <file>` (on `main` since controls #2325). Observed here on `main`'s script: an empty list is PASS (exit 0), a list with a name is FAIL (exit 1), and a file that does not exist is UNKNOWN (exit 2, `unreadable-input`), which is what a command's exit 2 leaves behind.

## Found by the experiment

The real API names the commit of an analysis `commit_sha`; the reader and the first fixtures used `sha`, so on a real pull request the analysis judge never found its analysis and waited out its budget (UNKNOWN, never a pass). The reader and the fixtures now use `commit_sha`.

## Inherited-finding experiment (decision 7)

The open question was whether an alert already open on the base blocks an unrelated change. It has been run, on disposable branches outside the collector namespace (`claude/exp-codeql-base`, `claude/exp-codeql-unrelated`, `claude/exp-codeql-introduces`) and the disposable pull requests #2369 and #2372, with a throwaway workflow and deliberately vulnerable files. The pull requests are never merged, and the test alerts are dismissed or removed with their branches. The result is recorded in the experiment comment on #2357.

Observed, on real CodeQL alerts:

- The analysis of a pull request is filed under the merge sha (`GITHUB_SHA`), not the head sha, and the API names it `commit_sha`.
- The merge ref of a pull request lists only the alerts that pull request introduces. An alert open only on the base does not show on the merge ref of an unrelated pull request.
- An unrelated pull request: the findings command wrote an empty list, verdict PASS.
- A pull request that introduces an alert: the findings command named it, verdict FAIL.

So the findings are PR-scoped. Nothing in the implementation changed because of this result, and the experiment is not repeated. Alerts that stay open on the base branch are not judged by CTL35. Whether to cover them with a separate base-branch check stays an Owner decision.

## Not done here

- No workflow job (engineering's, with `CODEQL_EXPECTED` and the thresholds `high_or_higher` and `errors` declared in its source), no WIRE, no ruleset change. Nothing is activated.
- No base-branch coverage (see above).
