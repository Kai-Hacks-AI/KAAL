# Stations and the registry

A station is a point where work passes and controls can judge it. Your setup names its stations and gives the list to the finder; a control may declare only those. A control declares where it is meant to judge with `stations: [<Station>:<mode>]`, for example `stations: [Merging:preventive]`. The mode says what the control does there: `detective` reports a broken rule, and `preventive` stops the work. A ratchet is no mode: it is a temporary strategy of a preventive control, declared on the control (`strategy: ratchet`, see `references/modes.md`). A control may differ in mode from its type at another station. A control with no `stations` line is valid and is registered nowhere.

## The registry

The registry of a station is the list of the controls registered at it. Read it from the **base** of a pull request, never from the candidate: a candidate that could add, move or remove a registration could choose what judges it.

`registryAt(files, station, stations)` in `scripts/lib/registry.mjs` takes the files of a ref (a map of path to bytes, read by the host), a station and the list of your stations, and returns the registered controls (`id`, `title`, `mode`, `status`, `path`) from the files of that ref, not from the working tree. The deprecated command at the old path takes `--repo`, `--base`, `--station` and `--stations <comma separated list of your stations>` and exits 1 when the ref cannot be read. A control with an invalid declaration is not registered: fix it as `references/declaring-controls.md` says.

## When a control should be preventive at a station

Be preventive only where the rule can be decided from what the control can read, and where a wrong block costs less than a wrong pass. Otherwise be detective there and say so. A registration is a claim about where a control is meant to judge. It is not evidence that anything judges: a control is running at a station only on a result observed there (see `references/judging-status.md`).
