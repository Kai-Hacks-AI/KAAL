# kaal-process 0.0.1 release acceptance (PLAN)

Capability: Process. Target: kaal/process at `0033510`. Record number is
provisional until integration. Draft: the open question below shapes the later
DO, and nothing here is implemented.

Promotion content (#560) and release acceptance are kept apart. #560 carries the
accepted Nodes. This PLAN closes the gap between that package and the generic
installed-package contract of Packaging (packaging/C4, authoritative
`docs/operations.md` on kaal/packaging), so that `kaal-process` 0.0.1 can be
accepted for publication. Publication itself needs the Owner and is not part of
this Change.

## Position

- **Process is usable alone.** The package has no runtime dependency; Core is an
  optional complement, needed only for the Core-admission verification path
  (N8, resolved in direction on #620 and by the Owner's package-independence
  guide). The release must keep that: nothing may add a hard dependency, and
  nothing may copy Core's admission or Foundation's digest.
- **Publisher assurance and consumer evidence stay distinct.** The unshipped
  `test/process.test.mjs` is the publisher's. What ships is the consumer's
  smoke test (#620).
- **Core's npm publication is not a prerequisite** for Process's conceptual
  readiness, and promotion is not used to unblock this.

## Gaps against the generic contract, pinned

Source: `packages/kaal-packaging/docs/requirements.md` on kaal/packaging at
`080db83` (3 Nov), the authoritative Requirements. Wording below is quoted or
closely paraphrased from it, each with the Process-side obligation. Nothing is
taken from the earlier readiness note.

**Already authoritative** (in Requirements at `080db83`, including the Owner
corrections C6 and C7 from the review on #686): F7 to F14, F19, F25, N7 to N9, N11.

**Moving, not relied on:** Packaging's suite (C5) and its verifier (C14, #873).
They may change how conformance is run and reported, but they do not change the
Requirements above. The DO is checked again against whatever has landed.

| Req | What it says (`080db83`) | Obligation for Process |
|---|---|---|
| F7 identity | One name, one exact version, every runtime dependency exact and installable from its registry; no workspace, file or Git dependency. Namespace is the Owner's per-package decision (#622). | Process has no runtime dependency, so the dependency part holds. The name and namespace stay an Owner decision. |
| F8 documents | Ships `docs/intent.md`, `requirements.md`, `architecture.md`, `testing.md`, `limitations.md`, `operations.md`, content the package's own; README links each, Operations included. | Add the six documents, short and true for a definition-only package. Today only a README ships. |
| F9 installed `npm test` | Once installed, `npm test` runs the Embedded verification against the installed copy; no checkout, no Engineering test. | Make installed `npm test` run the verification. Today it is `npm run verify`. |
| F10 result | One line with Testing's result, cause and evidence, in the shared verifier contract's form (testing/C29, #639). Packaging defines no result of its own. | Conform to that line form. |
| F11 manifest | Ships a manifest of every delivered file with its SHA-256 and every declared Embedded Test Case; verification compares installed files with it and runs exactly the declared cases. | Extend `test/nodes.json` (Nodes only) to every delivered file and the declared cases. |
| F12 runtime and platforms | Declares its runtime (`engines.node`); does not restrict hosts; no `os`/`cpu` restriction; portable and declaring none conforms. | Already holds (`engines.node` only). No platform claim is added. |
| F13 traceability | Traces are Testing's model, read through model functions the caller hands in; no dependency on Testing; a package that defines identifiers and ships no model is `unknown`. | Process defines identifiers in its documents, so it either ships a Testing model of its cases or stays `unknown`. |
| F14 declared Test Plan | Source `npm test` follows named scripts; the Embedded verification is one declared suite. | Declare `test:embedded` and `test:publisher`. |
| F25 boundary assurance | Material boundaries, owners and contract ids, plus how the plan exercises them, in the six documents, skill and Testing model. | Name Process's boundaries: Core admission (optional), the Node bytes. |
| N8 self-contained verifier | Installed verification needs only the runtime and the package's own declared runtime dependencies; neither Testing nor Guard at runtime. | **Tension, see below.** |
| N9 behaviour, not presence | Every case decides from the installed package's behaviour or bytes. | Cases check bytes and contract statements, not mere presence. |

### Findings from pinning, with the owners' answers (3 Nov, on this PR)

All of F8 to F14 apply to a definition-only package, in a small form (Packaging:
none is waived for lacking JavaScript). The minimal forms Packaging gave, which
the DO follows: six non-empty `docs/*.md` and a README linking Operations;
`scripts.test` running a verifier against the installed copy; a last line
`<name>-verification {"result","exit","cases","causes"}` with verified 0, failed
1, cannot verify 2; `test/verify.json` with every shipped file's SHA-256 and the
declared Case ids; `engines.node` and no `os` or `cpu`; a Testing `model` if one
ships; and named `test:<suite>` scripts including `test:embedded`.

1. **Core is an optional extra, not part of the result.** Agreed by Packaging: the
   verifier runs the same with or without Core. If Core is present it may add a
   separate `admission` line, which must not feed the result, must not be a Case
   in `test/verify.json`, and must not make the verifier fail or become `unknown`
   when Core is absent. This changes today's smoke test, which ends in *cannot
   verify* without Core and so does not conform to N8 as it stands.
2. **The manifest SHA-256: the two owners differ.** Foundation: a declared exact
   `dependencies` pin on `@kaihacksai/kaal-foundation` (0.0.1), importing only
   `@kaihacksai/kaal-foundation/sha256`, is the intended route, and `node:crypto`
   must not produce a KAAL digest. Packaging: N8 allows it, but a one-line hash
   is not a good enough reason for a hard dependency, and its own verifier uses
   `node:crypto`. The repository rule (AGENTS.md) names manifests as a Foundation
   use. Recommendation, for the CTO and Owner to confirm on this PR: depend on
   Foundation, since the independence guide rules out duplicating a technical
   answer and the dependency is one small package with no transitive tree. It is
   a genuine conflict between two owners' guidance.
   **CTO decision (3 Nov): use Foundation.** AGENTS.md names manifests as
   Foundation's job, and the independence guide forbids a duplicated technical
   answer, which justifies this one small hard dependency. The CPO may still
   challenge it in review. Exact justification: the manifest digest is a KAAL
   digest (AGENTS.md: Foundation is the one SHA-256, used for "Node ids, Seals,
   records and manifests"); the dependency is one exact-pinned package in
   `dependencies` (0.0.1, published, no transitive tree), imported only through
   `@kaihacksai/kaal-foundation/sha256`; and it avoids a second SHA-256.
3. **N9 trap.** Behaviour-not-presence needs a shipped module outside `test/`
   that the verifier exercises; with none, N9 is `unknown` and so is the overall
   result. Recommendation: do not add code only to satisfy N9. Record the
   `unknown` openly in `docs/limitations.md`, unless a real module (for example a
   Definition loader) earns its place for consumers. **Under CPO challenge:** a
   definition-only product must have an attainable, honest verification result
   from its actual delivered contract, without inventing behaviour for a generic
   checker. So `unknown` is not accepted as the expected result. Packaging's
   explicit resolution for definition-only packages is requested on this PR; the
   acceptance expectation is revised once it answers.
4. **F7 interim.** `failed` while a dependency is a local tarball, so a Foundation
   dependency needs its registry resolution (0.0.1 is published).

## Decisions already taken (no Owner go needed)

- Core stays an optional complement. #620 (CPO-approved) clarified the smoke
  test's *cannot verify* wording; the DO then moves Core-admission out of the
  result (finding 1).

## Entry condition for the DO

The pinned table above is checked once more against kaal/packaging's
Requirements at the then-current revision, and against whatever C5 and C14 have
landed. Filling the checklist does not make promotion or npm publication follow:
each needs enduring consumer value and its own authorization.

## Open questions

1. **The manifest digest** (finding 2): decided by the CTO as a Foundation
   dependency; open to CPO challenge in review.
2. **N9** (finding 3): accept the openly recorded `unknown`, or ship a module that
   earns its place?
3. **Sequencing.** C5 and C14 (#873) are moving; the DO starts after C5 so the
   contract it implements is fixed. #620 lands first; it is the base of the
   verification and is CPO-approved.
4. **Weight.** A definition-only package should not carry a heavier verification
   than its risk justifies. The DO keeps the six documents and the manifest
   minimal, and says so in `limitations`.

## Scope

This record only. Markdown. No Node, Definition, claim, package, workflow or
policy change, and no SYNC, promotion or publication.
