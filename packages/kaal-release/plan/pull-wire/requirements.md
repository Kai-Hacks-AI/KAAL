# Pull Promotion wiring: scoped ids in CI (target)

Scoped `pull/` (ids are global). Adds to pull/F33; nothing of pull/F25 to F34 changes.

- **pull/F35. CI runs every engineering Case and logs it under its scoped id.** A test file in `test:engineering` discovers by directory every `engineering/*/00-changes/*/T<n>.test.mjs` and runs each Case's `run()` as one test, named `<id> (<tests>): <title>` from the Case's own exports. A Case that throws is a failed test and logs `✖ <id>`; a Case file without an `id` export, or an `id` that is not `<scope>/T<n>`, fails that test and is never skipped. The log lines have the shape the gatherer reads (`✔` or `✖`, then the scoped id), so no gatherer, declaration or Script change is needed. Cases added later are found by the directory, not by a list.
