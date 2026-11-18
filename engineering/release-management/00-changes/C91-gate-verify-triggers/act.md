# C91 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Making the check preventive in one place only (`promoting`) kept the Change small and kept `main` safe from a sixth use. The Cases that matter derive from the real sources: the required check is named as the job of the real workflow source, `verify Stages` runs on the real declaration, and only two negatives are made by hand. Running the workflow's own fetch and judge steps on a merge queue branch showed that the merge_group path works before anything was installed.

## Learned

Two facts changed the scope while writing the PLAN. A required check must also report in the merge queue, so the workflow had to learn `merge_group`; and a base that holds no judge fails closed, so requiring the check in `integrating` would block every older collector until it is synchronized. The ten older Cases that pinned the exact list of required checks went stale by design, and amending them in place was cheap only because each states its list in one line. A hand-kept list of controls in the C35 helper had to learn release/CTL20 too: a list kept by hand needs an owner.

## Lacked

A single place that lists the Cases which pin a stage's exact checks, so the amendments are known before the DO. A live observation of `verify Triggers` on a real pull request, on both a pass and a refusal: until the amended workflow is installed by the second WIRE, the merge_group path is exercised only in a scratch clone. A check that a pull request opened with the default GITHUB_TOKEN would start no workflow, which the Dispatcher must avoid by using its App token.

## Longed For

The second WIRE with the amended workflow, one observed green run and one observed refusal on a real pull request into `main`, then the Owner loading `promoting.json` by hand; `integrating` following once the collectors hold the judge.
