# Change register of Release management

The numbered Changes of this area, `release-management/C<n>` (Owner, 10 November: the Change's identity is its numbered id; the folder under `.kaal/changes/` is a container for that Change's documents, not its identity). The register is the one place that lists them.

- **Assigned at PLAN.** A Change gets the next number when it is planned. The number is written into the Change Record as `Change: release-management/C<n>`, into the title of every pull request of the Change (`release-management/C<n> <PHASE>: <concern>`, PHASE one of PLAN, DO, ACT) and into this register.
- **A pull request is driven by one Change**; a commit is driven by one piece of any kind (`Driven-by: <scope>/<ID>`). Both forms are proposed in `development-hooks-plan.md`; until its checks exist this register is by hand.
- **In-flight and landed pull requests keep their titles.** The register lists them against their Change; it renames nothing.
- **Earlier Changes of this area** (the pull requests before this register, #1323 to #1347) are not numbered here. Owner direction (Kai, 10 Nov 08:05): "We fall forward, CI / hooks might teach us." They stay unnumbered and are not registered retroactively; a past Change gets a number only if a check later shows it needs one.

| Change | What | Pull requests |
| --- | --- | --- |
| release-management/C1 | Register the Changes of this area, so that titles and commits can cite a numbered Change | this pull request |
| release-management/C2 | bind Merge: a held merge method and a recovery in every verdict (with the earliest-stage line) | #1349 (PLAN), #1352 (failing Cases); the DO is to come |
| release-management/C3 | version Package (F3, G1 to G3): greater than the published, the tag created before publication under the tag ruleset, a version set by a recorded Change | #1348 (PLAN); the engine DO is to come |
| release-management/C4 | The lifecycle assessment: the stages including Development, the names and placement of the folders and rulesets, the tag identity as a GitHub App, the control types | #1353, #1354, #1356 |
| release-management/C5 | Development hooks: one thin entry per Git hook, the commit message form, the pull request title form | #1355 |
| release-management/C7 | track Work: a read-only report of each piece of Work's state per station (about to open, in stock, about to close) for the CTO and the CPO | #1363 (PLAN); the DO is this pull request |
| release-management/C8 | verify Envelope: the pull request body follows the template and the title says which Change and phase, checked by parsing; the check name is read by track Work (C7); C6 is reserved for clear Collector | the PLAN |
| release-management/C9 | Control overview and vocabulary (proposed F22): one overview of every release control with station, class and where it is applied; clean domain language; a verb set per control class, and the existing controls classified | the PLAN |
