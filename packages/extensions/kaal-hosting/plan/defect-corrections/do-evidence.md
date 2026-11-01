# Hosting defect correction: review candidate evidence

Date: 2026-11-02. Admitted collector base `23796c979eaae412b366a10d2dd7cef50155e0d4`; #826 is preserved. Owner direction authorizes correction preparation. This record is not independent Owner approval, an integrated Change, a publication decision or acceptance of the separate F5 semantic amendment.

## Test-first record

The correction proposal is local commit `1064767`. Executable regressions were frozen in local commit `86408da` before implementation. API-uploaded commits may have different commit metadata; compare the exact frozen file bytes below, not local commit existence on GitHub. Remote equivalent commit identities are recorded in the PR.

| Frozen file under the Hosting package | Foundation SHA-256 |
| --- | --- |
| test/embed/allocation.test.mjs | dc36f0df94cde01407a1483235171a849de77c68f3cd2e69ee75115721559760 |
| test/embed/fixture-ownership.test.mjs | d82c2c6fbb090cd7fa3b752610f536f6453a01dc37ff93b20719cf2324d16ad4 |
| test/publisher/defects.test.mjs | 1e9c75972ac9729bda7a0ead51c50dbacf251e7ba1dcba14be232980c1af0734 |

Before implementation: 8 failed assertions and 1 passed native-unavailable preservation test, no skips. D1 independently demonstrates duplicate declaration accepted, a printed failure overwritten by pass, duplicate passing execution accepted, and duplicate inventory generated. D2's controlled-host assertion observes the caller-owned fifo disappear. D3 observes a leaked staging directory. D4 observes the unrelated preceding case challenged instead of the three controlled registrations. No import, syntax or setup failure is counted as RED. A Windows path-normalization correction to the controlled test double was made before freezing tests.

After implementation, the identical frozen tests: **9 passed, 0 failed, 0 skipped, 0 todo**. Native facts on this Windows host report special entries unavailable. That branch checks preservation and unavailability only; the separate controlled filesystem/command/socket collaborators exercise the real unchanged fixture module's setup path. Native Linux/macOS evidence must come from supported-host CI, never from these doubles.

## Implementation dispositions

- D1: generated inventories and installed declarations reject duplicate identities. Execution failures are accumulated independently, repeated executions are ambiguous, and a failed per-name outcome cannot become pass. Actual failure remains failed/1; ambiguous prerequisites/execution without observed failure remain cannot verify/2. Positive four-loop verification and existing failing-hook behavior remain tested.
- D2: refuse existing fifo/socket entries before setup, and never unlink a target after its creation failed. Cleanup of successful attempt-owned creation is retained; SetupFailure and unavailable-host reporting stay distinct. No concurrency guarantee against uncooperative writers is added.
- D3: the aside-allocation failure path cleans its already-created staging directory, or reports its exact path and final cleanup error in leftovers, preserving the original allocation failure object. No displaced originals exist at this point. Existing rollback and UNRESTORED paths are unchanged.
- D4: affected-case attribution uses structural containment and controlled branch ranges rather than the nearest preceding title. Both branches, multiple/nested registrations and in-case dilution/early return are tested; adjacent tests and setup-only findings are not challenged. Review requests remain open. Existing literal-title/static-coverage limitations remain; no generic parser framework or new dependency is introduced.

## Existing and negative regressions

The existing boundary/portability/verifier suites: **21/21 passed**, including failing before/beforeEach/afterEach/after hooks and teardown failures in the generator and installed verifier. Existing recovery/kind-transition/expectation selection: **9/9 passed**.

`test/publisher/defect-mutations.mjs` applies five designated behavioral regressions separately and restores exact bytes in finally: accept duplicate inventory, erase an observed failure, delete a caller fixture entry, lose staging cleanup, and omit controlled cases. **5/5 assertion-killed**. Syntax/import failures do not count. Existing usage mutation challenges remain in the declared publisher command. Frozen tests are unchanged by the implementation or mutation runs.

Both delivered operation regressions ship in test/embed/ and run in normal prepack and installed verification. Verifier and controlled attribution adversaries stay publisher-only. The existing boundary exports, command, consumer tests and two Agent Skills continue to ship. Package dependencies, public operations, Extension contribution and version are unchanged. Root metadata, workflows, Core and other owners are untouched.

## Local environment limits and required fresh evidence

Node 24.20.0 on Windows. Build passed. Full normal source npm test was attempted but is **not GREEN**: this machine denies symlink creation and fixture npm installs report EALLOWSCRIPTS. Real `npm pack` with prepack was attempted and **failed closed** on the same environmental prerequisites; no normal local tarball or fresh installed acceptance is claimed. No test was skipped or weakened to obtain a tarball, and no ignore-scripts pack is presented as a release candidate.

Required supported-host CI must establish fresh source, real prepack, packed inventory and installed verification against the exact remote head. Local targeted passes are not a substitute. Record native fixture preservation diagnostics on Linux/macOS, current Guard and governance checks, and independently reviewed judgments separately. No final release artifact digest or provenance is claimed here.

## Existing release obligations remain open

The F5 sibling-authority wording is proposed in a separate semantic PLAN. Its review is not folded into this corrective DO. Current Packaging collector contract discrepancies (exact runtime versions, authoritative Operations document, Testing model and manifest/result interoperability) remain recorded; this Change does not waive them or bundle the separate shared boundary/BASS design. Foundation and Guard registry audit discoveries are not declared violations of an unfinished shared contract.

Remaining owned compatibility preparations and governed merge-commit SYNCs, focused main-relative promotion scope/admission, independent final package/boundary/portability/Packaging acceptance, reproducible release artifact/provenance, registry-only acceptance and separate npm publication authorization remain necessary. Draft/unarmed review candidates do not authorize any of those actions.
