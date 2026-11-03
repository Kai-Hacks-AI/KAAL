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

## Gaps against the generic contract

The gap list comes from the readiness table on #560 (30 Oct). The wording of
each requirement is Packaging's and is **to be confirmed against its text** before
the DO; this record names the Process-side obligation only.

| Gap | Obligation for Process |
|---|---|
| F8 documents | The package ships the set of documents Packaging requires (intent, requirements, architecture, testing, operations, limitations), each short and true for a definition-only package. |
| F9 installed `npm test` | `npm test` in the installed copy runs the embedded verification against that copy, with no source checkout. Today it is `npm run verify`. |
| F10 result line | The embedded verification ends on one result line in Packaging's form: `verified`, `failed` or `cannot verify`, with the exit codes it defines. *cannot verify* without Core is the honest result and not a failure of Process. |
| F11 full manifest | `test/verify.json` lists every delivered file with its SHA-256 and the delivered cases. Today `test/nodes.json` covers the Nodes only. |
| F12 platforms | The platforms the verification claims, stated, and proved where claimed (Windows applicability follows Testing's work). |
| F13 coverage | The cases are modelled in Testing's model so the claim of what is covered can be checked, passed in by the caller, as Packaging takes no dependency on Testing. |
| F14 declared suites | The suites the package declares are named and match what runs. |

## Decisions already taken (no Owner go needed)

- Core stays an optional complement. The smoke test's *cannot verify* wording is
  already clarified (#620, 5ab8df3).

## Open questions

1. **Sequencing.** Packaging's suite (C5) and its verifier (C14, #873) are still
   moving. The DO should start after C5 so the contract it implements is fixed.
2. **#620 first.** The smoke test it adds is the base the embedded verification
   builds on. This PLAN assumes #620 lands first.
3. **Weight.** A definition-only package should not carry a heavier verification
   than its risk justifies. The DO keeps the six documents and the manifest
   minimal, and says so in `limitations`.

## Scope

This record only. Markdown. No Node, Definition, claim, package, workflow or
policy change, and no SYNC, promotion or publication.
