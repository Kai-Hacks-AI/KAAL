---
id: project/P1
title: bring control status to main
delivers: [release/C62, controls/C12]
---
# project/P1 bring control status to main

Worked example of a cross-capability Project. Order matters: `release/C62` (PLAN #1872, collector `kaal/release/control-status`) brings the control-status finder content to `main` first; then `controls/C12` (collector `kaal/controls/control-status`) promotes with a pure SYNC. The merge dependency itself lives as a Dependency row on `controls/C12`, not here.
