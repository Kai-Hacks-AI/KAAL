# Hosting 0.0.1: bounded defect correction proposal

Date: 2026-11-02. Base: `23796c9` (the admitted #826 SYNC). Selected owner: Hosting. Proposed corrective Change `hosting/C27`; numbering is provisional until integration. This proposal does not approve itself or authorize integration, promotion, publication or activation.

## Existing contracts and defects

| Defect | Existing contract | Required correction | Frozen regression |
| --- | --- | --- | --- |
| D1: a later pass overwrites an earlier failed duplicate identity | F21–F23, F25; A9–A10 | Reject duplicate identities in generated/installed inventories; retain every execution failure independently of final per-name accounting. Ambiguous prerequisites are cannot verify/2; an actually observed failure is failed/1. | T79 (publisher): duplicate installed declaration; duplicate generated inventory; unique declared name executed twice, first fails then passes; clean four-loop fixture still verifies; failed hook remains failed. |
| D2: fixture cleanup deletes caller-owned fifo/socket paths | F38; A17 | Refuse pre-existing target entries without deleting them. Cleanup owns only entries created by this attempt; preserve SetupFailure versus unavailable-host results. | T80 (delivered): pre-existing fifo and socket files survive exactly; native fixture/setup behavior is exercised where the established fact holds, and unavailability is explicit elsewhere. Include a controlled collaborator fault probe independent of native availability. |
| D3: aside allocation failure leaks unreported staging | F6, F11–F12; A2 | Place allocations inside cleanup accounting. Preserve the original allocation error, remove staging if possible, attach sorted leftovers if removal also fails. Never delete recovery originals. | T81 (delivered): inject second allocation failure, check exact original error, unchanged root, no siblings; inject cleanup denial, require leftover path and host error. |
| D4: multiline platform conditions omit or misattribute affected cases | F29, F40, N6; A18 | Use syntactic containment/control ranges, not nearest preceding title. Challenge every literal case governed by a finding, including both branches and nested registrations, but not adjacent unrelated cases. Preserve review requests and deterministic outcomes. | T82 (publisher): multiline if/else, nested cases and suites, multiple registrations, in-case dilution and early return, adjacent unaffected case, conditional registration, and setup-only negative fixtures. |

## Scope and interfaces

Only Hosting runtime/verifier/manifest implementation, Hosting-owned tests, its existing test declaration, and this evidence record may change. Runtime exports, dependencies, Extension Node identity, operation inputs/results and release version remain unchanged. No Core, Graph, Testing, Engineering, workflow or root-manifest edit belongs here. Consumer and reusable boundary tests continue to ship. Publisher-only verifier adversaries stay publisher-only.

Drive the real `reconcile`, `specialEntries`, `portability`, installed verifier and inventory generator through their existing interfaces. Control filesystem failures at graceful-fs callbacks or host collaborators in isolated child processes; never mock the subject's verdict. Keep native host behavior, deterministic controlled faults, packed/installed acceptance and independent semantic review distinct.

## Test-first evidence and review gates

Commit executable regressions before implementation; record assertion RED, then GREEN against the unchanged tests, and discriminating negative challenges. Missing imports, syntax/setup failures or denied symlink creation are not behavioral RED. Run existing targeted regressions and normal source, real prepack, packed inventory and fresh installed verification wherever available. Required Linux/macOS/Windows CI is independent evidence; Windows cannot establish native Linux FIFO/socket behavior.

The F5 sibling-footprint wording is a separate semantic PLAN, not a silent weakening in this DO. Generic boundary/BASS design and Packaging version/docs/model discrepancies remain outside this correction. Existing release blockers remain open. Independent Owner review of the exact candidate is required before integration.
