# Test run re-entry guard: Intent

This is `testing/C55` (number provisional), a PLAN Change. It ships no code. It answers a failure Hosting met in its layout DO (Owner ruling A, 5 Nov): `npm test` ran the verifier with `node -e`, Node's test runner passed the inherited `--eval` flag to every case process it spawned, and each case re-ran the whole verifier, so the processes fanned out without end. Hosting fixes its own script. Tests are npm-specific for now, so Testing owns the guard; the Owner sees Hosting as the cleaner owner later, because npm and Node are infrastructure.

- **testing/I28**: A test run never re-enters itself. A run that finds it is already running ends unknown and says so; it never runs again inside itself, however its parent started it.
