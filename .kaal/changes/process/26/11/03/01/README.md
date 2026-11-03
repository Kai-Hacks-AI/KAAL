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

### Tension found by pinning: N8 against the current smoke test

N8 says the installed verification needs only the runtime and the package's
**declared runtime dependencies**. Today the smoke test imports `kaal-core`
(optional, not declared) and ends in *cannot verify* without it. Two things
follow, and neither is decided here:

- A conforming Embedded verification must be able to reach `verified` or
  `failed` on its own for what it can decide (the manifest comparison and the
  contract statements). It needs a SHA-256 for the manifest comparison. A KAAL
  digest comes from Foundation (the one SHA-256), not `node:crypto`, so even
  this small step implies either a declared Foundation dependency or a decision
  that the comparison is out of scope for the installed run.
- Core-admission then becomes an optional extra check (reported separately and
  not required for the result), which keeps Core optional as the Owner wants.

**Foundation's answer (3 Nov, on this PR):** a declared exact-pin runtime
dependency on `@kaihacksai/kaal-foundation` (0.0.1 today), importing only its
public `./sha256` subpath, is the intended route. There is no lighter way that
keeps one KAAL SHA-256. This is a small, shared hard dependency chosen to avoid
duplicating a technical answer, and it leaves Core optional. Packaging's answer
on whether the installed verification may rely on it, with Core-admission as an
optional extra reported apart from the result, is still to come.

## Decisions already taken (no Owner go needed)

- Core stays an optional complement. The smoke test's *cannot verify* wording is
  already clarified (#620, 5ab8df3).

## Entry condition for the DO

The pinned table above is checked once more against kaal/packaging's
Requirements at the then-current revision, and against whatever C5 and C14 have
landed. Filling the checklist does not make promotion or npm publication follow:
each needs enduring consumer value and its own authorization.

## Open questions

1. **N8 against the smoke test** (above): Foundation says yes to the dependency
   for the manifest digest. Open with Packaging: is Core-admission an optional
   extra reported apart from the result?
   Core stays optional either way.
1a. **Sequencing.** C5 and C14 (#873) are moving; the DO starts after C5 so the
   contract it implements is fixed.
2. **#620 first.** The smoke test it adds is the base the embedded verification
   builds on. This PLAN assumes #620 lands first.
3. **Weight.** A definition-only package should not carry a heavier verification
   than its risk justifies. The DO keeps the six documents and the manifest
   minimal, and says so in `limitations`.

## Scope

This record only. Markdown. No Node, Definition, claim, package, workflow or
policy change, and no SYNC, promotion or publication.
