# release/C155: the plain pull_request workflow of Change Isolation has a name of its own

## Reason
WIRE #2671 (the detective installation of release/C153 check 1) failed `verify Workflow names`. The source `05-src/wiring/workflows/change-isolation-plain.yml` carries the workflow name `KAAL`, which release/CTL36 calls `generic-name`. The ratchet allows the five known findings and no new one, so the installed copy would add a sixth. My preparation of that WIRE said no new finding was expected; it was wrong, because the ratchet counts per file.

A WIRE is a byte-equal copy of its source on `main`, so the file cannot be fixed in the WIRE. The name changes in the source first.

## The change
The workflow-level `name:` of the source becomes `Change Isolation on pull_request`. Nothing else changes: the trigger, the permissions, the steps, and the job name `Change Isolation (plain pull_request)`, which is the check context and stays distinct from the required `Change Isolation`. No check name moves.

## Case
- T1575: over a scratch folder that holds the repository's `.github/workflows` and the source as `.github/workflows/change-isolation-plain.yml`, the entry of CTL36 reports no finding for that file: its name is present, is not `KAAL`, and no other workflow has it. It also checks that the job name is unchanged. Red on `main` today (`generic-name`), parked as `T1575.red.mjs`.

## DO
Edit the one `name:` line of the source. The DO renames the Case to `T1575.test.mjs` unchanged. T1571 stays green.

## After it
ACT (retro), PROMOTION, then the WIRE is raised again from the tip of `main`; #2671 is left for the Owner to close. The WIRE keeps the same Source, Target and Verification.

## Not in this Change
No WIRE, ruleset change, required check or flag. The five known baseline findings are not touched. The other workflow names stay as they are.
