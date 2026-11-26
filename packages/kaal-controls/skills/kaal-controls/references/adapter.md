# The adapter

A control is a pure check plus a declaration. Everything every control needs is done once, by one thin function between the check and the world, so that no control does it by itself.

## What it does

`runControl` does five things and no more:

1. **Mode.** It applies the mode the caller resolved (detective, preventive or ratchet) to the findings. Which flag or ruleset chose the mode is the adopter's. The adopter may also hand the flag in `boundary.flag` as `{name, value}`: only the exact value `on` applies the mode, any other value (even unset, `null`) runs the control switched off as `mode: off`, `applied: false`, never blocked and still executed and recorded, and a flag that is missing or malformed is unknown (`applied: null`, the mode runs as asked). The adapter never reads the environment, and the log line and the record carry the flag.
2. **The ratchet filter.** In ratchet mode it applies the allowance, with the base's baseline and never the change's own.
3. **Fail closed.** A check that throws, or returns something that is not a list of unique names, is unknown. Unknown never passes and no allowance filters it. A check that confirmed some findings before it could not judge the rest keeps them on the error it throws, and the answer carries them beside the unknown.
4. **One log line.** Control, mode, verdict, number of findings, run, revision. No date.
5. **One record of the run.** Control, kind of run, run, revision, verdict, and `by: adapter`. A run that cannot say its run and revision leaves no record.

A concern joins the adapter only when every control needs it and it can be said in one sentence. The checks stay pure. The adapter reads no file and calls no service.

## Four independent facts

Defined, implemented, running and tested are four independent facts, not stages of maturity. Each has its own proof for the specific control and revision, and none implies another.

`compareClaims` compares each declared claim with its own fact and answers `<fact>:overclaims` where the claim is true and the fact false, and `<fact>:lags` where the claim is false and the fact true, so drift is found in both directions. A fact that is null or missing is unknown: never a finding and never proof of absence. It never edits a claim.

## What the adapter shows

The adapter shows execution only. `executed` answers true or null, never false. A committed record is a claim, not proof of its own authenticity, so it counts only when it is valid and complete (this control, a real run, a run, this revision, verdict `PASS`, `FAIL` or `REPORT`, by the adapter) and the adopter has independently established that this control, run and revision exist. The adopter verifies the run itself, not that a workflow exists. Running describes that the control executed and judged, not what it found, so a pass, a fail and a report all count and a verdict `UNKNOWN` does not. `judgeRunning` in `scripts/judge-running.mjs` turns the records of one control into `{running, applied, modes, runs}`: running is true or null, never false, and the mode and whether the flag applied the control are told beside it, so a switched-off run never reads as applied. The other three facts are proved by their own checks.
