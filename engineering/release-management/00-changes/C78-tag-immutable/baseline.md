# C78 baseline

The baseline is the collector `kaal/release/stages-extra-rule` at its tip, which holds release/C70 (judge, `stages.json` with `rules`, Cases T900 to T903), on `main` c8291db.

- `05-src/wiring/rulesets/publishing.json` holds one rule, `update`, on `refs/tags/trial-*@*`, with no bypass actor; the stage holds `rule: update`.
- The judge reports Publishing through the Promoting job and compares the source only to `publishing.rule`; it reads no control and no Intent for it.
- Nothing states that a published tag cannot be moved as the answer to a control.
