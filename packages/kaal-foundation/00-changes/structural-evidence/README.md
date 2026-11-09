# Foundation: the Boundary Test record says structural evidence, not lexical

Capability: Foundation. Target: `kaal/foundation`. Record number provisional until integration. Follows Engineering's #1308 (the Boundary Engine's code detectors read syntax trees, not text patterns; a file type with no parser makes the result unknown). Intent: foundation/I14.

- `04-test/boundary-check/boundary-check.md`, "What it does not establish": the `crypto` test is now described as structural evidence (a call in the syntax tree; a comment or string does not match; a multiline call is one call), and the record says an unparsed or unparsable file is unreadable, so the result is unknown.
- The definition's tests and parameters are unchanged. `verify.json` is regenerated because the shipped record changed.

No promotion, version bump, SYNC, ledger entry, release dispatch or npm publication.
