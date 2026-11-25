# C124 do

What the DO built, against the decisions of `change.md`.

## Built

- `05-src/workflow-names/lib/names.mjs` (pure, imports nothing): `workflowNamesFindings` gives `<file>:missing-name`, `<file>:generic-name` and `<file>:duplicate-name`, sorted (decision 2). A workflow named `KAAL` is generic, not a duplicate, so today's five stay five findings.
- `lib/read.mjs`, the only reader: the top-level `name:` of each file of `<head>/.github/workflows`, read as plain text, quotes and trailing comments removed. A value that is empty or a block scalar is not parsable and is UNKNOWN.
- `judge-workflow-names.mjs --head <folder> --out <findings.json>`: writes the findings and no verdict, exit 0 with findings, exit 2 and no file when it cannot tell (decision 7).
- `04-controls/CTL36-verify-workflow-names/CTL36.md` and `baseline.json`: preventive, `status: designed`, `has` release/I70, `strategy: ratchet` with `baseline-source`, `owner` and `exit`, no deadline and no `:ratchet` station (decision 5). The baseline is the five `generic-name` findings of today (decision 4). The fields are the ones controls C23 fixed; the finder on main accepts them.
- Cases T1402 to T1406 and `fixtures.mjs`. The ratchet Cases run `judge-mode --mode ratchet` and test our adoption, not controls' mechanics.

## Verdict step

The job runs the command on the head, then `node packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs --mode ratchet --findings <findings.json> --baseline <baseline of the head> --previous <baseline.json read from the base>`. The accepted baseline comes from the pull request's base, never from the candidate. After an accepted run the `next` of the answer is the baseline a person stores in the pull request that renames the workflow.

## Not done here

- No workflow job (engineering's source, C29), no WIRE, no ruleset change, no flag, no workflow rename. The five names stay as they are until their own Changes.
- The real runs and the provoked failure the record asks for are not observed yet; they come with the installed job.
