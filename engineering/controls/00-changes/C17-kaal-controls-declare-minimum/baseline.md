# C17 baseline

The baseline is `main` at `4479d00`. The finder lists ten valid controls, all of release: CTL1 detective running, CTL2 detective implemented, CTL5 preventive implemented, CTL7 detective implemented, CTL8 preventive implemented, CTL9 corrective implemented, CTL10 preventive implemented, CTL11 detective designed, CTL19 detective designed, CTL20 preventive designed. None declares `evidence`.

- The brief spoke of CTL1 to CTL21. Only these ten are registered on `main`. `controls/CTL1` (check Controls, controls/C13) waits in its collector, release/CTL21 (verify Hotfix, release/C94) is a PLAN in flight, and the other ids are retired or were never registered. Each of those declares its own line in its own Change when it lands; this Change does not reach into them.
- Ten Cases of release (T540, T600, T730, T750, T751, T752, T860, T880, T1116, T1129) compare each control file with its draft; six strip the `status` line and four (T860, T880, T1116, T1129) compare the whole file. Adding an `evidence` line makes all ten RED until each also strips that line. That is a regression the DO repairs by one replace each, named in `change.md`, not an accepted RED.
- Kai (19 Nov 2026): each control defines how it is tested; the letter marker belongs to kaal-testing's Test Plan, Suite and Case concept; freshness of Running is on demand through the Skill and script.
