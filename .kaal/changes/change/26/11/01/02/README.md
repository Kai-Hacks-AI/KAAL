# Change isolation DO

Capability: Change. Collector: kaal/change-isolation. Destination: main.
Succeeds the approved PLAN #782, merged at f76ebd2.

## Delivered slice

Public `@kaihacksai/kaal-change/isolation`, version `0.0.1-isolation.0`.
The runtime orchestrates owner-pinned inventory views and Graph traversal;
Foundation supplies its only runtime import. Optional Graph/Hosting peers support
consumer verification. No lifecycle, delivery, classification, CHAOS or FAR
implementation is copied from kaal/change.

The supplied model's Change and owner source references and digest are reported.
Model-scoped isolation, repository authority and actual execution remain separate;
authority is always unestablished and obligations remain not assessed.

## Source/dependency closure

- Main baseline: be3a2d09a386967bd5a1cd4a850f389951bc0796.
- Owner PLAN: #782 / approval 5728006632.
- Existing Change source considered: 66a3222d4cd677db25be99ce47f3392d3ac92ea1.
  Reuse bounded-alteration meaning and the Change/Definition type references.
  The Capability Node is narrowed to the inventory actually delivered here;
  its own ownership claim is re-pinned with Foundation.
- C9 #744: reuse alters/scope forms through a plain proposal bound to its Node.
  The unfinished delivery assessor is not a dependency.
- Engineering C11: reuse generic impact/selected-scope and unresolved-evidence
  concepts, not Git/path implementation or fixture authority flags.
- Consume main's Graph, Foundation, Core and Testing public contracts.
  No unpromoted owner module is imported. Graph/Hosting peer names reflect the
  existing main packages; a future rename is a separately governed dependency edit.
- Engineering integration is exactly root workspace registration, registration
  of publisher checks in test:engineering, and npm's derived root lockfile.
  The selected integration scope includes Change and Engineering. The Change
  claim covers only its package tree, not either root workspace file.
- Existing Plan documents are unchanged. Shipped docs stand alone.

## Verification

T41–T47 and T49 were observed RED by assertion against a permissive implementation
with an available export, then GREEN. Missing exports are not counted as RED.
T43 also exercises Graph's cycle handling through an explicitly synthetic owner
projection, without claiming a direct content-hash cycle.

T48 establishes permitted/prohibited/undecidable architecture results.
Core admits the minimal foundation and the source claim resolves exactly.
A TypeScript consumer accepts the existing Graph provider and rejects unrelated
CI transport. The source/runtime Cases use no platform skip.

Twenty publisher mutation challenges are killed by assertion failures against
the unchanged Cases. The runner restores original bytes and refuses a surviving
or merely blocked mutation. See the executable publisher runner in the package.

The full Acceptance lane passes 33/33 tests: seven packages packed once, four
scenarios and four recorded fresh installations. T50 exercises installed public
exports/verification, then rejects code tampering, a self-consistent skipped Case,
a failing Case and an empty Case inventory. Testing's physical containment and
unrecorded-installation findings remain unknown, not passed.

The installed verification manifest records eight required delivered Cases and
the files npm actually packs. A matching manifest is consistency evidence only.
Repository CI and independent Owner review are separate gates.

The complete Engineering lane passes 231/231 tests with no skipped/todo Cases.
The trusted C16 verifier from #777 (40fdf0e32e7170a790a636ca7c88d57a86f868fd)
also reproduces the candidate lockfile twice from the exact collector-base lock
and literal candidate workspace manifests, offline, using Node 24.22.1 and
npm 11.9.0. Candidate and derived SHA-256 both equal
`9ab7a4da6b45caf3dd03fb3742624791b6b39d0129bf749d17ff502f9bbf2a76`.
That verifier is evidence for this integration, not a copied product dependency.

### Clean-runner correction

The initial #791 CI run exposed two preparation assumptions hidden by the local
build/cache: Engineering imported Core before building it, and T50 forced offline
installation despite Graph/Hosting's third-party registry dependencies. Engineering
now builds Core explicitly; T50 uses Testing's cache-preferred installation default,
while every KAAL package still comes from the run's checked tarball manifest.
The runtime, shipped verification inventory and assertions are unchanged.

Guard's prescribed commands now pass: `kaal-guard run --check Engineering` after
removing Core's generated dist/ (231/231), and `kaal-guard run --check Acceptance`
with a newly empty npm cache (33/33, four recorded fresh installations). The C16
two-run lock derivation also passes against the updated exact root manifest;
the candidate/derived lock digest is unchanged. Repository cross-platform CI
remains independent of these local results.

## Validation and integration boundary

Review the normalized owner projection format, boundary disposition, concern
roles, model completeness limits and controlled driver/subject/provider example.
The example provider is independently implemented; a percent configuration can
disagree with the passing double, and the contract check detects it.

This DO does not authenticate repository-wide P1–P3 conversion, execute user
subjects/tests, control CI selection, change rulesets, publish npm packages or
open a promotion pair. The auto-merge checker promotion has priority; this bridge
does not proceed ahead of it.
