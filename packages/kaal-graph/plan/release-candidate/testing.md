# Graph release candidate: Testing

This PLAN adds no test. The planned test is graph/T13 in `test/plan/release.test.mjs`, unchanged, which `graph/C6` turns GREEN. graph/F11's other items are evidence recorded by `graph/C6` with the repository's lanes, not new Graph cases.

| Check | Checks | Evidence |
| --- | --- | --- |
| graph/T8–graph/T12, graph/T14, graph/T15 | graph/F10 item 2 | `node --test test/plan/release.test.mjs` on the candidate commit |
| graph/T13 | graph/F11 | packed-and-installed run in a clean directory |
| Negative installation fixtures | graph/F11 | exit codes 2 and 1 per Testing/F50, naming the cause |
| Packaging generic and Graph-specific conformance | graph/F11 | one run each against the same tarball digest |
| Linux, macOS, Windows on Node 24 | graph/F11 | CI job links |
| Publisher cases in the comprehensive lane | graph/F12 | separate evidence line under Graph as owner |
| Promotion diff inventory | graph/F10 item 5 | path list against graph/A7 |

## RED evidence

`node --test packages/skills/kaal-graph/test/plan/release.test.mjs` on `kaal/graph` at `67ccca4`: 7 of 8 fail and graph/T14 passes. That is the state this route ends: graph/T13 is RED because there is no `test/verify.mjs`, no `docs/` and no scoped name until `graph/C5` lands, and the evidence of graph/F11 does not yet exist.
