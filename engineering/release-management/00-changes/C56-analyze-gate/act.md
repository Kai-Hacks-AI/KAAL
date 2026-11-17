# C56 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The gate is one more required check on the promoting ruleset (`analyze Vulnerabilities (Promoting)`), declared in `stages.json` as an `also` of Promoting and judged by the same `verify Stages` judge, so the preventive control adds no new mechanism. The detective check stays detective: release/CTL2 still only reports, and release/CTL5 is the separate, preventive control that wires it into a blocking gate. The workflow fails on severity low in the runtime scope in both jobs, with no exemptions, and the Integrating job stays warn-only.

## Learned

Reaching main makes release/CTL5 Implemented and nothing more. It protects nothing until the ruleset is loaded and the workflow is installed (two Owner decisions) and a real run has shown the failure and analysis-unavailable cases. The judge on main decides what a candidate may require, which is why the precursor C59 had to be promoted first; the first attempt (#1844) failed `verify Stages (Promoting)` for exactly that reason.

## Lacked

A status line for release/CTL5. The finder on main refuses `status` until controls/C12 lands, so the control cannot yet say Implemented, Running or Tested about itself.

## Longed For

One place that says, per control, how far it has come (Designed, Implemented, Running, Tested) and what the next step is, so a promotion does not read as protection.

## Follow-ups

- Promote C56, then add the `status` line to CTL5 in a Development PR once the controls/C12 finder is on main.
- Wire and install the ruleset and the workflow, each on the Owner's decision; the CTL2 WIRE stays out.
- Show behavioural equivalence with Dependency Review (failure and analysis-unavailable) before it is retired, then ask for the authorization.
