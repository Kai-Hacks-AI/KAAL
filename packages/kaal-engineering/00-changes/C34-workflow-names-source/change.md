# C34 change

Asked by release (23 Nov): a second workflow source, same shape as C32, for CTL36. The judge (`judge-workflow-names.mjs`) and the accepted baseline (`04-controls/CTL36-verify-workflow-names/baseline.json`) are on `main`. This is engineering's answer, to be judged before anything is built.

## The answer in six lines

1. **One job, `verify Workflow names`**, in `13-source/workflows/verify-workflow-names.yml`, on plain `pull_request` and `merge_group` and nothing else (no `pull_request_target`, no push, no schedule). `permissions: contents: read` and nothing broader; no token, no secret.
2. **The judge is the base's.** One `actions/checkout` of the base commit: `github.event.pull_request.base.sha || github.event.merge_group.base_sha`, `persist-credentials: false`. This is C33's rule for a gate that needs the pull request's content: the code that decides is the base's; the content is data.
3. **The head is Git data only.** The head is fetched as a ref (`refs/pull/<n>/head` for a pull request, the queue entry's `head_ref` for a merge queue) and laid out in a folder with `git worktree add`. Nothing from that folder is executed.
4. **Two commands, in order.** First `node engineering/release-management/05-src/workflow-names/judge-workflow-names.mjs --head <head folder> --out <findings.json>`, which exits 2 and writes no file when it cannot tell (an absent judge on the base is the same exit 2). Then `node packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs --mode ratchet --findings <findings.json> --baseline <the head's baseline.json> --previous <the base's baseline.json>`. A step that exits non-zero fails the job, so FAIL and UNKNOWN both fail it.
5. **The accepted baseline comes from the base** (`--previous`, read from the base checkout, never from the pull request). The head's own baseline file is read as data and compared with it, so a pull request cannot loosen what is allowed by editing it.
6. **Nothing is enforced.** No ruleset names the check and no flag is set. A pull request into a collector whose base predates the judge gets exit 2 and a red job; that is why the check is not required, not a defect to work around.

## What this Change pins (Cases, plain `.test.mjs`)

- T1415: the triggers are exactly `pull_request` and `merge_group`; the permissions are `contents: read` and nothing else; no secret and no token appears; the job and check are named `verify Workflow names`.
- T1416: there is exactly one `actions/checkout`, of the base commit, without persisted credentials; the head is fetched as a ref and laid out with `git worktree add`; no `node` or `npm` command runs a path inside the head folder.
- T1417: the first command is the judge with `--head` and `--out`, and an absent judge exits 2; the second is `judge-mode --mode ratchet` with `--findings`, `--baseline` under the head folder and `--previous` under the base checkout.

All three are RED on this collector because the source does not exist yet. I checked them against a throwaway draft of the source: GREEN on the conforming draft, and RED when `--previous` is read from the head, when the head is fetched as `refs/pull/<n>/merge`, when a step runs a script from the head folder, when the ratchet step runs in another mode, and (T1415) when a `push` trigger is added.

## Question for release

The note says "`--baseline <base's>`", and `do.md` of C124 says `--baseline <baseline of the head>` and `--previous <baseline read from the base>`. This PLAN follows `do.md` (the code), with `--previous` the base's accepted baseline. Please confirm.

## Not in this Change

No WIRE, no `.github` change, no ruleset change, no flag, and no change to the judge, the baseline or the control. The real run and the provoked failure CTL36 asks for come with the installed job, after the WIRE.
