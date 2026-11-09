# Packaging 0.0.1 completion — Testing

The methodology, model, evaluation, applicability and evidence semantics are Testing's. Use its existing three loops and BRITTLE guidance. These are ordinary Packaging-owned Test Plans. No Testing implementation, generic boundary runner or consumer-specific cases are added.

## Declared planned-test boundaries

All paths below are repository-relative. A directory covers every descendant. These closures are declared, not inferred. Existing earlier boundaries remain effective except the precise amendments in completion.md.

| Concern | Owner | Planned tests, fixtures, expectations, configuration, helpers and dependencies |
| --- | --- | --- |
| Boundary and BASS guidance | Packaging | packages/kaal-packaging/plan/release-0.0.1/; packages/kaal-packaging/test/publisher/release-guidance.test.mjs; packages/kaal-packaging/test/publisher/manifest.mjs; packages/kaal-packaging/test/verify.json; packages/kaal-packaging/README.md; packages/kaal-packaging/docs/; packages/kaal-packaging/skills/kaal-packaging/ |
| Installed verifier and exact reporting | Packaging | packages/kaal-packaging/plan/release-0.0.1/; packages/kaal-packaging/test/publisher/verifier.test.mjs; packages/kaal-packaging/test/publisher/fixtures/verifier/; packages/kaal-packaging/test/verify.mjs; packages/kaal-packaging/test/run.mjs; packages/kaal-packaging/test/publisher/manifest.mjs; packages/kaal-packaging/test/verify.json; packages/kaal-packaging/test/embed/; packages/kaal-packaging/package.json |
| Conformance interoperability | Packaging | packages/kaal-packaging/plan/release-0.0.1/; packages/kaal-packaging/test/publisher/interoperability.test.mjs; packages/kaal-packaging/test/publisher/fixtures/interoperability/; packages/kaal-packaging/test/embed/package.test.mjs; packages/kaal-packaging/lib/conformance.mjs; packages/kaal-packaging/lib/conformance.d.ts; packages/kaal-packaging/lib/npm/realization.mjs; packages/kaal-packaging/lib/builtins.json |
| Scoped packed consumer and release | Packaging | packages/kaal-packaging/plan/release-0.0.1/; packages/kaal-packaging/test/publisher/release.test.mjs; packages/kaal-packaging/test/acceptance/; packages/kaal-packaging/test/publisher/capability.test.mjs; packages/kaal-packaging/test/publisher/manifest.mjs; packages/kaal-packaging/test/run.mjs; packages/kaal-packaging/test/verify.mjs; packages/kaal-packaging/test/verify.json; packages/kaal-packaging/test/embed/; packages/kaal-packaging/package.json; packages/kaal-packaging/docs/; packages/kaal-packaging/README.md; packages/kaal-packaging/skills/kaal-packaging/ |

External dependency inputs for these boundaries: the exact accepted Hosting and Foundation artifacts and their public contracts, the real Testing model/verifiers modules and their accepted contracts, the Node/npm toolchain, the caller's once-packed artifact manifest, and Engineering's release/acceptance harness. Pin revisions, artifact digests and tool versions in each evidence record before execution. Any dependency replacement changes the recorded conditions and requires fresh evidence. Declare new fixtures/helpers in a PLAN amendment before they give a planned Case meaning.

A declaration is not an attested unchanged verdict. Use Testing's interpret only when the actual trust authority supplies the attestation; do not self-attest.

## Planned Cases

T37–T50 are reserved by C10; start here at T51. These targets use existing F/N/A contracts unless F25 is named. Publisher cases do not enter the shipped model merely because they exercise an installed copy.

| Case | Target | Positive and discriminating negatives |
| --- | --- | --- |
| T51 | F25 | An agent using Packaging's Skill substantively judges whether the material incoming/outgoing boundary account is complete, its owners/contracts and ordinary package-owned Plans/Cases are adequate, and its evidence supports the claims. It records reasoning and uncertainty separately from script observations. Pair an adequate account with one whose headings, links and passing scripts appear complete but which omits a material outgoing obligation or fails to exercise its refusal behavior; require the agent to identify the semantic gap and explain its consequence. Unsupported evidence remains unresolved, never proven by structural presence. Each package retains its boundaries, contracts, test content and product judgments; Owner authorization is separate. |
| T52 | F17 | A recorded independent agent trial uses the shipped Packaging Skill without an Engine to inspect a Packaging boundary account, select relevant checks, interpret their observations, and make a reasoned semantic conformance assessment of completeness, ordinary Test Plan/Case adequacy, supporting evidence and uncertainty. Exercise T51's adequate account, material omission and unsupported claim; command invocation or document discovery alone does not satisfy the trial. The agent must explain what the scripts establish, what it judges, what stays unknown and what needs Owner authorization, without taking ownership of another package's content or claiming deterministic proof of semantic completeness. |
| T53 | F11 | Intact installation verifies its files. Changed, removed or added installed file, malformed/missing manifest, invalid/escaping/duplicate file entry: cannot verify/2, diagnostic and no false GREEN. The manifest is consistency, not provenance. |
| T54 | F10 | Exact declared executions accepted; missing, duplicate, substituted, undeclared, skipped, todo or malformed Case evidence cannot verify. A declared failure on an intact installation is failed/1. Include failing test-file/startup with no trustworthy Case outcome; do not collapse unknown to failed. |
| T55 | F10 | Exactly one valid summary with actual package identity, location, Node and Hosting-supplied host facts, installation digest and required diagnosis. Judge through Testing's real observe/judge, not copied predicates. Missing dependency is unknown, while established consumer mutation fails. |
| T56 | N9 | A behavior-testing verifier passes the generic behavior check and a presence-only verifier fails it. A broken dependency or verifier startup must not be misrepresented as proof that product assertions exercised their target. Record any actual defect before extending the probe. |
| T57 | F13 | Real check/tested accepts the shipped model; missing functions leave unknown. Malformed/dangling model fails. The final self-conformance path must refuse stand-in substitution and record the Testing module identity. |
| T58 | F7 | Scoped name/version/public metadata, exact accepted scoped runtime dependencies, preserved exports and CLI/Skill identities. Reject private/unscoped/incorrect metadata and stale self-imports. Registry pin/resolution negatives from T15/T32 remain. |
| T59 | F15 | Source npm test executes all declared applicable suites, installed npm test only Embedded verification. Preserve T28's distinction. Normal lifecycle pack runs as declared; a pack with scripts disabled cannot serve as acceptance. |
| T60 | F11 | Actual tarball inventory equals the approved shipped delivery, exact paths/digests/Cases. Reject an extra source/publisher file or missing deliverable. Check actual packed bytes; no post-pack manifest repair or pack-list-only claim. |
| T61 | N7 | Fresh external consumer installs the exact once-packed candidate and accepted dependencies, invokes API/CLI/installed npm test without checkout access, then compares consumer content and cleanup. Missing dependency, refused input and altered installed bytes yield the promised results. |
| T62 | F15 | Self-conform on that same candidate with real Testing functions; report generic findings beside specific verification. Local tarball deps remain interim failed F7. Separate registry-resolved acceptance requires every applicable generic finding verified. |
| T63 | F12 | Linux/macOS/Windows execute the actual installed verifier and the same declared Cases on the same candidate bytes. Use Testing parity and Hosting challenge evidence; existing generic CI job names or duplicates-only acceptance do not establish this. Missing host or unresolved challenge remains unknown. |
| T64 | F7 | Existing release engine records normally packed tested artifact; publication uses its exact bytes; fresh registry tarball SHA-256 and integrity match, registry-only installation verifies. A registry/record/artifact mismatch never accepts. Publication requires separate Owner authorization. |

## Independent agent validation for T51/T52

C13's trial must be performed by an agent independent of the guidance author, using the delivered Skill and its discoverable supporting tools. This PLAN requires the trial; no trial is claimed by this amendment. Keep the examples Packaging-owned and exercise the existing measure/conform and consumer-verification boundaries. Do not introduce consumer-specific tests or another runner/framework.

Use three declared scenarios: (1) an account whose material obligations, ordinary Plans/Cases and evidence support an adequate assessment; (2) a structurally similar account with a material incoming/outgoing obligation omitted or its refusal behavior untested; (3) a claim whose supporting evidence cannot establish the stated candidate, condition or obligation. Define the scenario inputs and expected semantic distinctions independently of the candidate Skill before the trial, and retain them within the declared boundary. An agent that accepts every account because documents exist or scripts pass does not satisfy T51/T52; neither does one that detects a gap without explaining its obligation and evidential basis.

Record the Skill/candidate version, supplied material, agent identity and independence, inspection choices and tool observations, the agent's substantive conformance judgments with reasons, unresolved unknowns and the resulting limits. Independently review whether the trial demonstrates the intended semantic distinctions. This evaluates the Skill's ability to support judgment within the trial's scope; it does not turn that judgment into deterministic proof or itself grant integration/release authorization.

## Run/evidence record

For every run retain source SHA and dependency revisions/digests; Node/npm; candidate name/version, tarball SHA-256 and integrity; exact packed inventory and manifest reconciliation; Testing model and actual module identity; declared and observed Cases; command, exit and raw summary; consumer before/after comparison and scratch cleanup; generic findings beside product observations; separately identified script observations and agent conformance judgments with reasons and uncertainty; independent review and unresolved validation items; and separate Owner integration/release authorization where granted.

Architecture, capability acceptance and implementation evidence remain separately runnable. Observe meaningful RED before implementation, GREEN within coverage, and refactor without weakening a planned boundary. File/import/tooling blockers are not behavioral RED.

Cross-platform evidence must cover the whole installed verifier on Linux/macOS/Windows, not merely an API smoke or the existing repository Acceptance job. Engineering owns orchestration; Hosting owns OS facts and portability challenges. No host branching is added to Packaging.

## Baseline inspection evidence

- Pinned collector manifest checked without rewriting: current.
- Normal npm 11.21.0 pack: 24 files, 23 hashes matched; 31 Cases; no missing or extra member.
- Real Testing check/tested at 9f112e6: no model findings, 31 Cases and 35 traced targets.
- Diagnostic unchanged-verifier fixtures: clean passed; payload digest mismatch, duplicate Case and undeclared Case also incorrectly reported verified/0. These are focused algorithm probes, not installed Packaging acceptance.
- The runtime default npm 11.9.0 is below Packaging's declared 11.18.0 minimum. An initial suite run under it is not release evidence. The subsequent run uses cached npm 11.21.0; record its actual outcome separately.
- No scoped artifact, fresh registry-only installation, independent verifier harness run or three-host acceptance is claimed by this PLAN.
