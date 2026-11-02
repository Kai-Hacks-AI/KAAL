# Core/C45 PLAN: complete the report assertion boundary

Supplement to approved C44 #842 under accepted C40 #813. Base: accepted Core
collector `a9e86f65323dded0241347f39b37b4c84a8b591b`, containing C43 #841.
This proposal changes only two unshipped planning files. No live test, fixture,
runtime, manifest, package identity, dependency, workflow or installed Engine
changes. It grants no integration, promotion, publication or auto-merge authority.

## Planning defect and correction

C44 enumerated T43, T47 and T91, but missed T96's final assertion in
`test/acquisition.test.mjs`. That Owner-added safe-acquisition case requires the
unmodified installed tarball's verifier to end in the old human result line.
The normalized final JSON report cannot satisfy that assertion. Changing it
during report DO without a reviewed amendment would violate C40's explicit
immutable-test boundary. Keeping two competing final lines cannot resolve it.

This is an omission in Core's amendment PLAN, not evidence of a product defect
in the unchanged verifier. C44's approved patch and approvals are not rewritten.
This supplemental proposal makes the omitted assertion reviewable before DO.

The same report migration has a second consumer: Core's existing permitted
Engineering Acceptance support path, `engineering/acceptance/embed.test.mjs`.
C40 F96/A48 already require that scenario to retain the normalized report.
Its exact parser update is included here for review alongside T96. No workflow,
new recorder, second execution or new required context is proposed.

## Complete supplemental patch

`proposed-tests.patch` is unapplied review material, outside all suites and the
npm file list. It changes only these assertions:

| Consumer | Exact amendment | Retained discriminator |
| --- | --- | --- |
| T96's current-tarball verification | Replace the final human-line prefix assertion with exactly one final `kaal-core-verification {json}` report. Assert `verified`, actual exit, exact candidate name/version/manifest digest, exact installed `{file,name}` case identities, nonempty all-`pass` outcomes and empty causes. | The actual unmodified candidate is installed and its documented `npm explore <current package> -- npm test` command executes. No candidate metadata, manifest, fixture or expected identity is repaired. Hashing uses Foundation. |
| Existing Core Acceptance verifier scenario | Read that same one final normalized report instead of the old intermediate execution record and human line. Assert result/exit/causes and preserve exact candidate and per-case identities against the installed manifest. Print the report once for the existing lane to retain. | Same packed-once candidate, normal installation, actual installed `npm test`, exact manifest digest and complete cases on each native host. No counts-only replacement or alternate verifier. |

Every other T96 assertion stays unchanged: scoped documented acquisition,
refusal to invoke through npx/npm exec, use of the scoped package's own bin,
correct behavior beside another package's bin, the positive impostor controls,
refusal when only the impostor is installed, current-tarball CLI behavior and
successful process exit. The temporary pre-scope fixture remains as accepted;
this PLAN does not claim it is final scoped-package acceptance.

Acceptance's deep-equality tar inventory, its installed operation tests and
all other scenarios stay unchanged. This changes neither the packed files nor
the Case inventory. C40 T98–T106 and runner T80 remain byte-identical. C44's
T43/T47 lifecycle amendments stay separate from report DO, which still needs
no Foundation/Hosting declaration to change Core's output format.

## Execution boundary after independent PLAN approval

Apply this exact supplemental patch together with C44's T91 hunk through a
subsequent reviewed report DO. Observe the intended RED before modifying the
verifier. Produce one normalized report from its existing execution, not a
second recorder. Keep every existing integrity, missing/skip/todo/undeclared,
behavioral failure and consumer-preservation negative.

Update Core's delivered reporting instructions to the implemented interface
and explicitly regenerate its committed manifest; normal build/prepack must
not repair the manifest. Testing owns the model/verifier semantics and
Packaging owns conformance. Use their real accepted interfaces from outside
Core for assessment; add no Testing/Packaging runtime dependency or copied
model algorithm.

Complete source, normal pack, exact inventory, clean installed verification,
negative controls and native Linux/macOS/Windows acceptance on that candidate.
Do not claim full release GREEN while T79 remains RED. Full unfiltered
`test:release` enrollment follows scoped integration; no name-filtered subset
is represented as that final suite.

Packaging F14's inability to follow Core's dynamic dispatcher remains a
separate owner-interface issue. Preserve T80; no dummy npm command or
source/installed discrimination relaxation is authorized here. Registry
dependency availability remains a later publication prerequisite. Mandatory
initialization still needs accepted Foundation/Hosting delivery and lifecycle
authority. This patch grants none.

## Preparation evidence

- The supplemental patch applies cleanly to exact collector `a9e86f6` with
  `git apply --check`. Both reconstructed proposed files pass `node --check`.
  It has not been applied to live tests in this PLAN branch.
- In a separate diagnostic worktree of that collector, applying only approved
  C44's T91 hunk and running it against the unchanged verifier gives clean
  intended RED: one test fails because **zero normalized summary lines were
  observed where exactly one was required**. No implementation change exists.
- An initial fresh offline dependency install was blocked by an uncached
  `undici-types@7.24.6` tarball. The diagnostic instead reused the previously
  installed dependency trees from the identical root lock; `npm ls --all
  --offline` and normal Hosting/Core builds passed. This is bounded local
  diagnosis, not a successful fresh install or final release evidence.
- A disposable copy of the proposed T96 test was also attempted against the
  unchanged candidate. Its normal consumer-install fixture stopped on uncached
  registry metadata for `yaml`, before the report assertion. That attempt is
  blocked/unknown, not intended RED; no fixture or dependency was changed to
  make it pass.
- A repository-wide search for the old report prefixes identifies the
  verifier, delivered reporting prose, historical release PLAN prose, T96,
  T91 and this Core Acceptance support path. Historical prose remains history;
  this amendment concerns the executable consumers only.

Foundation SHA-256 pins:

| Subject | Digest |
| --- | --- |
| Unchanged live `test/acquisition.test.mjs` | `5ce3f9cd44ea8ca4fec8bf9f21778a3b61448e4db256d43cfbaee28e9b819512` |
| Unchanged live `engineering/acceptance/embed.test.mjs` | `301030d351326cf65536eb3999606d44d59da8fa96f161d3c649e018306f3131` |
| Supplemental `proposed-tests.patch` | `2145cee2252870c739d70a2f5c83954cf49d34d1f0555f76e29aa6124f87541d` |

Review must accept these precise changes before report DO applies them. A
different assertion or fixture change returns to PLAN; a GREEN implementation
run cannot approve a test amendment. C44 remains a separately approved PLAN.
