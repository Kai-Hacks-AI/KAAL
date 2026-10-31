# Testing

## What ships

- `test/consumer/sha256.test.mjs` checks the installed `sha256`:
  - the FIPS 180-4 known answers: the empty message, `abc`, and the 448-bit and 896-bit messages;
  - messages of 55, 56, 63, 64 and 65 bytes, at SHA-256's padding boundaries;
  - a view, which counts only its own bytes and is left unmodified;
  - the refusals, each a `TypeError`.
- `test/verify.mjs` runs them and prints one result on its last line, with its exit code:
  - `verified` (0), when at least one test ran and none failed;
  - `failed` (1), when a test failed;
  - `cannot verify` (2), when no test ran or the test files are missing.

## What does not ship

The publisher's tests under `test/plan/` are not delivered and never run in an installation. They compare every length up to 1024 bytes and seeded inputs up to 1 MiB against the host's SHA-256, hash every Node KAAL ships, and check the package itself before release.
