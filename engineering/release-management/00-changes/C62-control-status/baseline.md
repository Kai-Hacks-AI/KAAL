# C62 baseline

The baseline is the collector `kaal/release/status-on-main` at `main` 16c54de, with no commit of its own. Work that is not on main is not delivered functionality.

- `packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs` refuses a control whose frontmatter holds anything but id, title, description, type and has, so a `status` line is a refused field.
- The release controls CTL1, CTL2, CTL5, CTL7, CTL8 and CTL9 declare no status.
- An earlier collector of this Change, `kaal/release/control-status`, was branched at `main` c90b9fb. A SYNC of `main` into it could not be both pure and green (six conflicts in CTL7, CTL8, CTL9 and their Cases, and CTL5 reaching it without a status), so the Owner chose to rebuild it from `main`: this collector carries the PLAN as it was approved there, amended only for the new base (CTL5 is on `main` now, the SYNC note is gone).
