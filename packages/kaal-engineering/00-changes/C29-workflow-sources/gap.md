# C29 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G119 | F62 | `.github/workflows` holds 21 workflows. 6 have a source: `engineering/release-management/05-src/wiring/workflows`, release's folder, in the old layout. 15 have none and exist only as installed files | A workflow can change, or be deleted, with no Engineering source to compare it to, so "the workflow in `.github` is what Engineering reviewed" cannot be shown, and the WIRE rule (the target equals a source on main) cannot be applied to 15 of 21. The one place that holds sources belongs to release, not to the capability that owns the workflow, and the layout has no name for it |
