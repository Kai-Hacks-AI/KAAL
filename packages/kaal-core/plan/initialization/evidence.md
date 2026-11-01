# core/C40 preparation evidence

Baseline: main `9a9e89699aed7969281dcd1017882fd0bc4e3edc`, the state containing Core promotion #734. Local runtime: Node 24.22.1, npm 11.9.0, Linux. Preparation is a PLAN and publisher test Change only; runtime, payload, manifest, dependencies, workflows and installed state are unchanged.

## Executed

- `npm ci --offline --ignore-scripts --no-audit --no-fund`: passed, using the baseline lockfile and existing package cache. This is a source dependency install, not registry-release acceptance.
- `npm run build -w kaal-hosting -w kaal-core`: passed.
- `node packages/kaal-core/scripts/manifest.mjs --check`: passed before and after preparation. The committed manifest remained unchanged.
- `node --check packages/kaal-core/test/plan/initialization.test.mjs`: passed.
- `node --test packages/kaal-core/test/plan/initialization.test.mjs`: **9 executed, 3 GREEN, 6 RED**, no skips, todos or cancellations. Each RED reached a behavioral/artifact assertion, not an import/build/environment failure.
- `node --test --test-name-pattern='core/T(78|79) ' packages/kaal-core/test/plan/release.test.mjs`: T78 GREEN (dependencies are not private), T79 RED (Core still has its unscoped name). T78 does not establish registry resolution.
- `npm test -w kaal-core`: passed. Existing publisher groups: 172, 9, 8 and 5 passing cases; the separate boundary suite: 5 passing; consumer verification: **11 declared / 11 executed / verified**. The new C40 PLAN file is deliberately not enrolled in the normal suites before its DO. A comprehensive-source GREEN therefore does not claim C40 is implemented.
- `git diff --check`: passed.
- The target Change Isolation checker accepts all seven changed paths. The trusted Branching checker judges this as an ordinary Change into kaal/core, landing by squash; its method checker accepts squash. The latter is a local method judgment, not a claim that GitHub auto-merge is armed.
- New contract identifiers are defined once and local Markdown links resolve.

## New case outcomes

| Case | Observed result and first discriminator |
| --- | --- |
| T98 | RED: Core's Agent Skill is absent |
| T99 | RED: delivered AGENTS navigation does not identify the installed scoped Core package/Skill |
| T100 | RED: explicit init's catalogue contains no admitted Core Capability (and no mandatory infrastructure initialization is claimed) |
| T101 | RED: init accepts the bare Engine as complete with exit 0 |
| T102 | GREEN: a present external Skill is not catalogued; explicit registration admits it |
| T103 | GREEN: a rejected Skill leaves the Engine unchanged and is not admitted |
| T104 | GREEN: external read-only CLI operations preserve target and controller |
| T105 | RED: no full test:release suite is declared |
| T106 | RED: the final line is the old human-readable result, not the proposed normalized report |

## Limits and next evidence

T107–T111 are acceptance designs, not executed tests. Dependency-transport/failure fixtures await owner interface agreement; Testing model/conformance interfaces must be pinned before their DO. No reference implementation, complete C40 GREEN, adversarial mutation score, fresh installed C40 candidate, three-host C40 assurance, registry release or product validation is claimed.

Existing #786 CI evidence and Foundation registry acceptance are pinned in architecture.md and remain separate from this local preparation. The subsequent DO must execute all approved cases, amend older immutable assertions through reviewed PLAN changes where explicitly listed, and demonstrate their discriminators before claiming release acceptance. Passing source tests cannot replace independent package integrity, installed-consumer behavior, configuration and boundary/platform findings.

Branching/Change Isolation and remote CI judge the proposed PR at its actual head. The required merge method is squash. A review-only draft is unarmed; the current Branching gate requires correctly configured auto-merge before integration, which is a later integration decision rather than a reason to enable it during preparation.
