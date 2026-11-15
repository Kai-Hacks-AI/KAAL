# No Duplicate Runs: Intent

This is `testing/C50`, a PLAN Change. It ships no code. `testing/C51` turns its planned tests GREEN.

**What is missing.** Nothing in Testing notices when one execution runs the same Case twice. Guard's acceptance file `engineering/guard/acceptance/package.test.mjs` re-ran Guard's whole delivered suite three times inside its own Cases: guard/T101 twice, then guard/T98 and guard/T109. That is on top of the run the lane already made. On Windows the Guard step took about 24 minutes. Guard's C136 (#754) removes the re-runs in that one file: on Linux it went from 357 s to 108 s. Each other suite could repeat the mistake, and nothing would say so.

Kai asked that kaal-testing optimise so that, in a given execution, no duplicates are run. Timing (`testing/C46`) challenges where a run's time goes. A duplicate is a narrower and certain waste: the same evidence produced twice.

**What exists.** A run stands for its own subject and conditions (testing/F15). Parity compares one candidate's runs across platforms (testing/F56). A run on another platform, another Node or another candidate is other evidence, never a duplicate.

- **testing/I23**: In one execution, each Case runs at most once against one subject under one set of conditions. Testing finds what an execution ran more than once, and names who re-ran it and the time it cost. It also plans an execution so that each distinct case file runs once and every requester reads that one run. A duplicate is evidence for the case owner. It never decides a result, and running a failed Case again is a duplicate, never a new result. Testing runs nothing to judge it.
