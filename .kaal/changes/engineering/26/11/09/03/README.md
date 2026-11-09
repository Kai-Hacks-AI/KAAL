# Engineering: the packed manifest records each package's version (testing/F117)

Capability: Engineering. Target: kaal/foundation. Record number is provisional until integration. Requested by Testing for its pin-behind rule (PLAN #1286): Testing compares a nested held version with the packed one and fails closed without it.

## Content (3 paths, no `.github`, no ledger entry)

- `engineering/delivery/pack.mjs`: each manifest entry becomes `{ tarball, sha256, integrity, version }`, the version being the one `npm pack --json` reports for the tarball just packed.
- `engineering/delivery/pack.test.mjs`: the clean-run Case asserts the recorded version (RED before the change: `undefined`, expected `1.0.0`).
- This record.

## Check

`node --test engineering/delivery/pack.test.mjs`: 3 of 3 pass after the change, 1 failed before.

## Act

No consumer of the new field is in this Change. No promotion or publication.
