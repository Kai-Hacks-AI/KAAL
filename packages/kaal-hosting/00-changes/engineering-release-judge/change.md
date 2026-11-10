# Hosting's tests stop re-judging Engineering's Release judge (hosting/D21)

## Intent

Tests live in one place and run against their targets. Engineering judges release readiness and acceptance once, in its Package control, for every package that leaves main. Hosting's tests assert Hosting's own contract and do not import a file of KAAL's engineering directory.

## Authority

Driven by hosting/D21 (`06-defects/D21-engineering-release-judge-duplicated.md`). The Case corrections below are authorized by the accepted PLAN `plan.md` in this folder (#1338, CPO-approved at its exact head). The Owner's ruling (Kai, 2026-11-09) applies: Case immutability stops silent change; a decided Defect or Change may change or retire Cases openly.

## What changes

- `release-record.test.mjs`: the import of `engineering/release/release.mjs` goes. hosting/T83 (Release readiness of the real package) is retired; its exact-version clause was already carried by hosting/T174. hosting/T84, hosting/T85 and hosting/T86 keep every assertion on Hosting's own record (result, exit status, causes, cases) and lose only the call to `verification()`; their titles lose the words "the unchanged Release judge". Case identities are kept.
- `dependency-successors.test.mjs`: the import goes. hosting/T174 keeps the exact runtime versions of hosting/F15, typescript 5.9.3 among them, and loses the readiness and registry clauses.
- `04-test/package-check/testing.md` (and the manifest generated from it): hosting/F15's allocation names hosting/T174 in place of hosting/T83, and the allocation of hosting/F21 to hosting/F25 no longer says the records are judged with the existing release contract.
- `--test-skip-pattern="^hosting/T(83|133)[ :]"` is left as it is. The T83 part now matches nothing.

## What is lost

The early signal. Until now a Hosting change that would make the package fail Engineering's readiness rules (a dependency not on the registry, a malformed record) failed in Hosting's own pull request. After this Change it is found by Engineering's Package control when a release is prepared, and not before. Hosting still asserts its own result and evidence record and its exact dependency versions. The registry lookup of dependencies, and the judgment of a record against the declared inventory, are no longer exercised by Hosting's tests.

This is a known gap, not hidden. Release management's answer (proposed in the testing-controls PLAN #1339, `00-changes/testing-controls-plan.md`, "Where the release judge runs on a package change"): the judge runs once, in Release management, as a Regression Case of test Integration and test Candidate, against every package the candidate touches, on its packed bytes. Readiness runs from the first step; installed verification joins once the Owner decides G12 (optional peers) and is reported as not judged, never passed, until then. Release management owns it and Hosting adds nothing to its own suite. Until #1339 lands and its DO is built, Hosting's pull requests have no early signal for this.

## Not changed

Hosting's verifier, its record, and every Requirement. No promotion to main is part of this Change.
