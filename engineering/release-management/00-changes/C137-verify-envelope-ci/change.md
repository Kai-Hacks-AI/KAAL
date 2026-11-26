# C137 change

## Reason

The CPO asked for release/CTL11 to go up, prepared for its flag and with what a control needs. The judge is built; the instance that asks it about a real pull request is not.

## Position and inputs, all from files and Git data

The instance judges what the pull request says about itself, so its subject is the title, body, base and head of the pull request (the `pull_request` event payload, taken as data) and the messages of its commits (`git log` between the base and the head, fetched as Git data, no token). The rules are not read from the pull request: the registry of TYPEs comes from the pull request templates of the BASE commit (`readTemplates`), and the judge is the default branch's. A base without templates gives an empty registry and the answer UNKNOWN (the TYPE is unsupported), never PASS. A fact that cannot be read (no event, no log, no templates folder) is UNKNOWN.

## The runner

`05-src/plan-body/run-verify-envelope.mjs`, pure functions plus a command line:

- `factsOf({ event, log })` turns the event payload and the text of `git log --format=%H%x1f%B%x1e <base>..<head>` into the facts of `verifyEnvelope`. Without a log `commits` is absent, which the judge reports as not judged (UNKNOWN).
- `exitCodeOf(answer, flag)` is 1 only when the flag is exactly `on` and the verdict is not PASS. Any other value, empty, `ON` or `true`, exits 0 with the same verdict written (detective).
- `recordOf` and `evidenceLine` write one line `envelope-evidence {...}` per run: `kind`, `pr`, `merge`, `run`, `verdict`, `type`, so the ledger of the control can count real runs the way the ACT judges' ledger does.
- Command line, which is also the by-hand instance: `node run-verify-envelope.mjs --event <file> --templates <folder> [--log <file>]`.

## The workflow source

`05-src/wiring/workflows/verify-envelope.yml`, source only. It installs nothing here. Plain `pull_request` (opened, synchronize, reopened, edited, ready_for_review) on all branches; no `pull_request_target`, no token, no secret, `contents: read`; the default branch is checked out as the judge, the base is checked out as a worktree for its templates, the head is fetched through `refs/pull/<n>/head` as Git data and never run or installed; one job named `verify Envelope`; the flag is `vars.KAAL_RELEASE_VERIFY_ENVELOPE` handed in as `KAAL_FLAG`. This is the same boundary as release/CTL19 `verify Triggers`; it adds no trust boundary, so no new CTO proof is asked.

## What this does not do

It does not make the check required, does not set the flag, does not install the workflow (a WIRE, byte-equal to the source, with the Owner's go), and does not build the pre-push hook instance, which is its own Change. It does not judge whether what the body says is true.

## What the DO leaves on CTL11

`status` moves to `implemented` only when the runner and workflow source are on the collector and their Cases are green; `running` needs the WIRE and observed runs, and `evidence` stays as declared until those exist. A missing proof stays UNKNOWN, it is never read as positive.

## Cases

T1537 (runner: facts, flag table, record) and T1538 (workflow source shape) are parked `.red.mjs` and become `.test.mjs` in the DO.
