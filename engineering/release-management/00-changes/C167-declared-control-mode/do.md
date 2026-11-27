# release/C167 DO

The shared entry helper `engineering/release-management/05-src/lib/entry-flag.mjs` reads the control's declared mode (`stations` of its record) and its flag (the controls instance's `flags.json`), validates them with the controls library (`validateFlags`), hands `toBoundary` of the flag to the adapter and returns the library's exit (`decideOutcome`). The three command lines (`lineage/lib/answer.mjs`, `promotion-source/lib/run.mjs`, `change-isolation/lib/report.mjs`) call it; the seven entries pass their id and name no mode literal.

A job engages the flag by supplying `KAAL_FLAGS`, `KAAL_STATION` and `KAAL_CONTROL_RECORD` (the base's files). No workflow does so yet: every job runs as it did, detective, until its adoption WIRE. No flag entry and no `preventive` declaration is written here.

Cases T1630 to T1634 are the parked Cases of the PLAN, unchanged in expectation.
