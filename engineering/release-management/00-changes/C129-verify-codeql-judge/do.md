# C129 do

What the DO built, against the decisions of `change.md`.

## Built

- `05-src/codeql-gate/lib/analysis.mjs` and `lib/alerts.mjs`: the pure layers (decision 8). `analysisFindings`, `waitForAnalyses`; `alertFindings` and the two threshold tables. They import nothing.
- `lib/read.mjs`: the only reader. It pages the code-scanning analyses of the sha and ref and the open alerts of the ref, with `fetchJson` as an argument. `lib/command.mjs`: what the two commands share, the environment in and a findings file or nothing out.
- `judge-codeql-analysis.mjs` (CTL34) and `judge-codeql-findings.mjs` (CTL35), each `--out <findings.json>`. The inputs are the environment variables of decision 2; the thresholds are read by the findings command only. The findings command is UNKNOWN when an expected analysis is not there, so it never reads an alert set it cannot trust.
- `04-controls/CTL34-verify-codeql-analysis/CTL34.md` and `CTL35-verify-codeql-findings/CTL35.md`, preventive, `status: designed`, `has` release/I68 and I69, no ratchet. Their `evidence` lists only what exists, the fixture Cases (T1395 to T1401); the real run and the provoked failure are added when they are observed.
- Cases T1395 to T1401, in this folder with `fixtures.mjs`.

## Verdict step

The commands write no verdict. The job runs, for each, `node packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs --mode preventive --findings <file>` (on `main` since controls #2325). Observed here on `main`'s script: an empty list is PASS (exit 0), a list with a name is FAIL (exit 1), and a file that does not exist is UNKNOWN (exit 2, `unreadable-input`), which is what a command's exit 2 leaves behind.

## Not done here

- **The inherited-finding experiment (decision 7).** The commands read the open alerts of the merge ref, so an alert already open on the base is a finding for every change. Whether it blocks an unrelated change has to be observed on a real CodeQL alert: a disposable base branch that holds an alert, a disposable pull request that does not touch it, and the findings command run on that pull request's merge ref. It needs a deliberately vulnerable file pushed to a disposable branch and a CodeQL run on it, which creates real code-scanning alerts in the repository. It is a separate step on its own disposable branches (the alerts are dismissed as test data after), and I have not run it. The observed result goes back to the CPO and the Owner for the enforcement decision. Nothing is activated by it.
- No workflow job (engineering's, with `CODEQL_EXPECTED` and the thresholds `high_or_higher` and `errors` declared in its source), no WIRE, no ruleset change.
