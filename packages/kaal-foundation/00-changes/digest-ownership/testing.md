# Planned cases (not yet written, not enrolled)

| Test | Targets | Checks | RED today because |
| --- | --- | --- | --- |
| foundation/T52 | foundation/F28 | README and skill state that Foundation supplies the digest of given bytes only and that identity meaning belongs to the consumer, and name no consumer | neither document states it |
| foundation/T53 | foundation/F29 | the package exports and commands read no file or directory to build an identity: `package.json` exports are `./sha256` and `./package.json` (plus `./capability` after C16), and no `lib/` module walks a directory | holds today; guards against drift, so it is written GREEN with a negative fixture that must fail |

The DO writes these and the document edits together, after Foundation 0.0.2 is promoted. This PLAN edits no
shipped document and writes no test, so the 0.0.2 candidate and its manifest are unchanged.
