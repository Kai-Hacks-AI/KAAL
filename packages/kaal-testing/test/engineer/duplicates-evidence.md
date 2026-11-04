# testing/C51 DO: implementation and hotfix assessment

## Scope and evidence

C50 PLAN #757 is approved and merged. Base: `kaal/testing` at `dc9bec4ca58b6527c9aae136f86fb5a7b01094cb`. C51 adds `lib/duplicates.mjs`, its package export, source-suite selection, current documentation, export/file inventories, two implementation checks, a packed-installation scenario and a repeatable mutation runner. Every changed path is under Testing. T104–T109, their fixtures and their helpers are unchanged. The existing exact package inventory is extended by the one new delivered module, as in C47; no existing member or assertion is removed.

Linux / Node v24.22.1:

- T104–T109: 6 passed, no skip.
- `npm test -w kaal-testing`: 189 passed, no failure or skip.
- `npm run test:acceptance`: 34 passed, no failure or skip; six packages packed once, five scenarios and five fresh installations. The new scenario uses `install()` and the public export of those packed bytes, including failed and unknown observations, new required executions, separate subject/bytes/platform/Node, malformed evidence and unchanged outcomes.
- The harness reports physical host containment and absence of unrecorded installations as unknown. These limitations are retained, never counted as passing assurance.
- `node packages/skills/kaal-testing/test/engineer/duplicates-mutations.mjs`: 34 assertion kills; machine-readable receipt is `duplicates-evidence.json`. Both exports are available during the independent inert-behaviour challenge: T104–T108 fail by assertion. T109 stays GREEN for today's valid layout and fails when a child-local loader injects a duplicate script. No source test or package manifest is edited by the runner.
- File-path and Node schedule mutations survive the six planned Cases alone. Additional implementation Cases kill them. This gap and its correction are disclosed rather than changing the approved Cases.

The pure API does not suppress executions or alter results. A valid schedule supplies one run and every requested read; caller-side binding preserves the original failed/unknown observation. Invalid requests plan nothing and report findings. No retained state crosses calls. Separately required assurance executions require separate calls even when their tuple is identical. Engineering must preserve that boundary, complete evidence, provenance and failures in its future integration; these tests do not establish a live lane adapter.

Existing CI remains the authority for Linux/macOS/Windows packed acceptance and the full required matrix. No workflow, timeout, check, test applicability or lane selection changes in C51. Exact-head remote results belong to this PR's checks; local Linux is not a claim of three-host GREEN.

## Recommendation: normal Testing collector integration

**Expected current CI saving from C51 alone: 0 seconds.** There is no live Engineering lane consumer of `duplicates` or `schedule`. The new API and checks introduce no optimization into a running lane; reduced execution time must be demonstrated by a separately reviewed Engineering integration.

The exact historical production defect was repeated Guard delivered-suite execution in `engineering/guard/acceptance/package.test.mjs`, through T98, T101 and T109 and their shared consumers. Guard corrected it in #754, propagated only that correction via `kaal/hotfix` in #761, and promoted it in #763, already on main (`be3a2d0`). #763 records individual Guard-step measurements: Windows 24m28s → 9m00s; macOS 5m18s → 2m01s; Linux 2m51s → 1m11s. Those savings belong to C136, not C51. They are not an estimate of further savings from this API.

The approved `engineering/github/branching.md#hotfix` route admits an urgency-driven correction to an existing capability when its collector holds unfinished work. It uses a fresh main-based `kaal/hotfix`, one isolated correction, required CI and independent review, then squash promotion and main-to-owner synchronization by merge commit. C51 does not demonstrate an urgent remaining production defect or change a live execution path, so the route is not justified. No hotfix collector or promotion is proposed.

## Dependencies, assurance and route

- C50 (#757) provides the approved contracts and immutable Cases and is merged.
- C38 (#718) remains open. A27 names it for the eventual publisher/consumer test-script layout. T109 can and does validate the present layout without it; C51 does not import, implement or bypass C38. Its installed `npm test` verifier and final release layout are not claimed as validated here. When C38 integrates, preserve C51's two source-suite files once in `test:publisher`, exclude them from the installed-only script and regenerate/check the governed manifest. That integration needs its own checks.
- The new module imports nothing and adds no dependency. Existing package runtime dependencies remain `c8@12.0.0` and `kaal-hosting@0.0.1`; development dependencies remain Core, Engineer Skill and Graph. The package remains the collector's existing unscoped 0.0.1 identity. A scoped rename, installed-verifier/release readiness, npm publication and dependency promotions are separate work.
- Engineering owns lane acquisition, scheduling, nested-run capture, outcome fan-out and provenance. Its future Change depends on C51 and requires its own review and measured before/after evidence. No Engineering file changes here.
- **Land C51:** working branch → `kaal/testing`, by **squash**, after independent Owner review and required CI. No self-approval.
- **Future ordinary promotion:** separately authorized Testing readiness and synchronization; synchronization lands by **merge commit**, then `kaal/testing` → `main` by **squash**, respecting freshness and the promotion queue. No promotion or publication is automatic.

The current Testing collector contains other work, including timing/redesign and release preparation. Promoting it now would carry more than C51. This DO PR changes Testing paths only relative to its collector; it opens no PR into main and moves no main ref. It does not claim that an eventual whole-collector promotion is C51-only. If a future actual hotfix is proposed, prove its complete diff against main and admit only the required correction and dependencies through the main-based hotfix collector, never by promoting this unfinished collector.
