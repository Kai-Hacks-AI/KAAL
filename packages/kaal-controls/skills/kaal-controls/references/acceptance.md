# Accepting a failure

## Why

A control that fails must keep saying so. Hiding a known failure to let work through makes every later report less trustworthy. Delivery may still need to go on for one failure that someone has knowingly accepted.

## What

- A finding is an observation, not a record. When it is valid it becomes a Test Case (the property that fails) and a Defect (the gap). Those two are what persist.
- A control's report cites the failing Test Cases.
- An accepted failing control stays FAIL in the report and is flagged ACCEPTED, only when every Test Case it fails is covered.
- An acceptance names the control, the failing Test Case, the Defect, an owner and a reason. It covers exactly that control and that Test Case.
- A separate verdict permits delivery only when every control passes or is an accepted FAIL. Acceptance never makes a PASS.
- An acceptance lives while its Defect is open. Fixing the Defect voids it. A voided acceptance covers nothing and stays visible so it can be cleaned up.

## What not

- A new or different failure is not covered: another Test Case, another control, a partly covered failure and a failure with no cited Test Case all block.
- A later failure of the same Test Case after the Defect was fixed is a regression. It needs a new decision with its own Defect.
- An UNKNOWN result is never accepted.
- An acceptance that matches no failure does not block, and it is listed as unused.

## Where

`scripts/accept.mjs` exports `judgeAcceptance({results, acceptances})`. Each result is `{control, status, failing}` and each acceptance `{control, testCase, defect, owner, reason, voided?}`. It answers `{verdict, report, unused, reasons}` and changes nothing. Where acceptances are kept, who may add or void one, and how the verdict reaches delivery are yours to decide.
