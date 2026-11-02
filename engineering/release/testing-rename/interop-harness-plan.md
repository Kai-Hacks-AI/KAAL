# Interoperability acceptance for the scoped Testing package: PLAN (reuse first)

Date: 2026-11-02. Engineering PLAN for independent Owner review, amended after the Owner's
review of the first version. It answers Testing's contract in #858 (step 4 of C36) and builds
on the closure in #857. It adds no harness, test, workflow or runtime byte, and no executable
GREEN is claimed.

The first version proposed a built-ins-only tarball reader, a process wrapper, an inventory
verifier and a matrix model. That risked a competing package-verification framework in
Engineering. This version inventories what exists, names the few trust boundaries that need an
independent observation, and proposes new machinery only where a gap is evidenced.

## Ownership

| Concern | Owner |
| --- | --- |
| Package quality and conformance | Packaging |
| Verification methodology and result semantics (`verified`, `failed`, `unknown`) | Testing |
| Coordinating and executing cross-capability acceptance | Engineering |
| Each consumer's acquisition behavior and tests | The consumer |

Engineering adds no verifier, no result vocabulary and no matrix model. Independence means the
judge is not the package under judgment for specific boundaries; it does not mean reimplementing
the mechanisms around them.

## Existing mechanisms, and what each already gives

| Mechanism | Owner | What it already covers for this need |
| --- | --- | --- |
| Acceptance lane (`engineering/lanes/acceptance.mjs`, `engineering/delivery/pack.mjs`) | Engineering | Packs every workspace exactly once, hands one manifest (path, SHA-256, integrity) to the scenarios; afterwards fails the run if a tarball changed. The lane runs as separate Linux, Windows and macOS jobs in CI, and a missing job blocks. Pack tests include a tarball changed during the run. |
| Testing's acceptance (`kaal-testing/acceptance`: `discover`, `install`, `accept`) | Testing | Each scenario installs the packed tarballs into a fresh host from packed bytes only. Verifies the installed bytes equal the packed bytes, that each host holds the packed tarball and not a registry copy, and that nothing unpacked was installed; unknowns are reported, never passed. Its tests cover bytes other than the packed ones, an unpacked package and a non-packed source. |
| Consumers' acceptance scenarios | Each consumer | Engineering (`embed`, `execution`), Change, Graph and Engineer Skill already install their dependencies through `install([...])` in their own scenarios and own the acquisition path. After the rename each updates its own selector (closure #857, section C). |
| Release engine (`engineering/release/release.mjs`, `release.yml`) | Engineering | Packs once, retains the tested tarball, binds a record to its digest and integrity, runs installed verification in a clean consumer, and later accepts the registry's bytes. |
| Packaging `conform(dir)` and `measure(artifact)` | Packaging | Decides the generic KAAL Package contract against the installed package, runs the installed `npm test`, and reports in Testing's three results. `measure` describes the artifact from the artifact itself (digest, file list). It lives on `kaal/packaging` and reaches `main` with its promotion (#686). |
| The package's own consumer verification (`test/verify.mjs`) | Testing | The package's specific contract, run by Packaging's `conform`; it is Testing's claim, not Engineering's to judge. |

## Where independence is genuinely required

Only these boundaries:

1. **Candidate identity and digest.** The lane's digests are computed by Testing's own `sha256`, imported from the package under test. For Testing's own tarball that is self-judgment. The tarball digest must be recomputed with a function not supplied by Testing and compared with the manifest and with the release record's digest.
2. **Real module resolution in a consumer.** That every public subpath of the scoped export map, and `package.json`, resolves from a clean consumer to a file inside that consumer's `node_modules`, observed in that consumer's own module system. The existing pattern is `import.meta.resolve` inside the host (as in `engineering/acceptance/execution.test.mjs`).
3. **Old name absent.** The unscoped `kaal-testing` specifier does not resolve and the old name is not in the installed tree.
4. **Candidate is the release candidate.** The tarball under test is the one the release engine retains, so the evidence and the published artifact are the same bytes.

Everything else is reused: packing once and the manifest (lane), installation from packed bytes
and the byte and source checks (Testing), the platform matrix (three CI jobs), `unknown` semantics
(Testing and the lane), generic package quality (Packaging `conform`), and each consumer's
acquisition behavior (the consumer's scenario).

## Evidenced gaps and the narrow addition

| Gap | Evidence | Addition |
| --- | --- | --- |
| Not every export subpath is imported by a consumer | Closure #857, section B: consumers import `acceptance`, `attribution`, `contracts`, `coverage`, `duplicates`, `inventory`, `report`, `verifiers`; `model`, `boundary`, `timing` and `redesign` are not imported outside Testing | One Engineering acceptance scenario, in Testing's existing scenario format, that reads the installed `package.json` export map and resolves every key by its scoped specifier in a fresh host (boundary 2) |
| Old name absence is not asserted anywhere | No acceptance scenario checks it | The same scenario asserts the old specifier does not resolve (boundary 3) |
| Digest of the tarball is judged by Testing's own function | `pack.mjs` imports `sha256` from `kaal-testing/acceptance` | The same scenario recomputes the tarball's SHA-256 with `node:crypto` and compares it with the manifest and, at release, the record (boundary 1) |
| The lane packs its own tarball, the release engine packs another | Cross-host byte identity is not claimed (route.md) | To be decided in the DO with the Owner, in this order of preference: run the same scenario against the release artifact by handing Testing's `accept` the retained tarball in its manifest; or record the lane and release digests side by side and state they are different artifacts. No new packer. |

No tar reader, no process wrapper, no generic verifier and no new result type is proposed. If the
DO inventory finds a gap this table missed, it is added here with evidence before any code.

## Negatives (must fail, reusing the existing injected pattern)

Reused where they already exist and re-observed against the scoped package: altered tarball bytes;
an unpacked package installed; a registry or file copy in place of the packed tarball; a tarball
changed during the run. Added in the one scenario: a missing export subpath; a scoped specifier
that resolves outside the consumer; the old name present; a digest that does not equal the record.
Each is a mutation of a good run. A negative that reports `unknown` is a failure of the negative.

## Matrix

The consumers are Engineering, Change, Graph and Engineer Skill; the platforms are Linux, macOS
and Windows. The DO first inventories, per consumer, whether an existing acceptance scenario
installs the scoped package. A consumer with no such scenario is reported to its owner as a gap
in its own tests, not covered by an Engineering framework. A cell that cannot run is `unknown`
and the release is not accepted on it.

## Delivery

One new acceptance scenario file under `engineering/acceptance/`, with its own tests and Change
Record, touching no Testing, Packaging, Change, Graph or Engineer Skill path and no `.github`
file. Reuse of Packaging `conform` waits for its promotion; until then the existing installed
verification in the release engine applies.

## Sequence

1. This PLAN accepted; Testing confirms or amends #858.
2. DO: the scenario and its negatives, after the DO's reuse inventory per consumer.
3. Run against the real packed candidate after the rename transaction (#854 Route A, a Testing
   entry) and the accepted scoped Hosting version.
4. Result for the Owner. Registry-only acceptance after publication stays with the release
   engine's `registry` step.

## Open points

- Which of the two ways to tie the evidence to the release artifact the Owner prefers.
- Whether the Owner agrees that boundaries 1 to 4 are the full list needing independent observation.
- The accepted scoped Hosting version (Hosting thread).

No synchronization, promotion or publication is authorized by this PLAN.
