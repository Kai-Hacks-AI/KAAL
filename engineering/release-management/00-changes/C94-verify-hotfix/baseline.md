# C94 baseline

The baseline is `main` at 189662e.

- The Defect chapter of a Hotfix is checked for content and for the shape of the reference by the envelope judge (release/F17, release/CTL11), not followed to a record.
- Defects are recorded per capability in `<home>/06-defects/D<n>-*.md`, with a JSON record whose `tests` list names the reproducing Cases (for example `packages/kaal-hosting/06-defects/D10-multiline-conditional-selector.md`).
- No control reads a Hotfix against those records. Hotfix pull requests go into a `hotfix/<name>` base from a head not under `hotfix/` (release/C67).
- release/C31 (`kaal/hotfix/defect-only-diff`, PLAN #1691 merged into the collector, DO #1712 open) holds a judge module and two Cases that never reached `main`. It names no control: no id, no classification, no registration.
- release/CTL1 to CTL20 are the controls of the release capability; CTL19 and CTL20 are the pattern for a detective control with a workflow source.
