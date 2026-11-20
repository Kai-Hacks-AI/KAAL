# C21 baseline

The baseline is the collector `kaal/release/check-pr-envelope` with `main` merged in. `main` holds the Hotfix template specification (release/C11), whose interface file records the CPO decision that Hotfix branches live under `hotfix/*` and says that the delivery path is a later Change. It fixes no base: a defect can sit in production, `main` or the unpromoted work of a collector.

- `envelope.mjs` has no route row for HOTFIX and reports that the route is not judged.
- The command line prints `PASS` whenever there is no finding, then lists what it did not judge, and exits 0.
