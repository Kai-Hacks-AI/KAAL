---
type: Guard/Check
command: node engineering/release-management/05-src/vulnerability-analysis/analyze.mjs
runs: [ci]
---

Known vulnerabilities in the dependencies a Change adds or changes. It reads the result of the Dependency Review step from the environment and ends with 0 for PASS, 1 for FAIL and 2 for UNKNOWN, which never passes. A FAIL names each dependency, version, advisory and severity; reproduce the analysis with the same command and the two KAAL_ANALYZE_ variables set.
