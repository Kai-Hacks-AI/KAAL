# Change package verification and traceability corrections

Capability: Change. Collector: kaal/change-isolation. Destination: main by a
separate promotion. Base: 01b5528848bb3b59c031bbfcc03f6a88ad7feff2 (#815).

## Request and bounded delivery

The Owner requested a review of the delivered Change slice against the accepted
Packaging and release bar, then asked us to work the findings. The review found
that source npm test omitted publisher checks, the delivered inventory supplied
no Testing model, and a JSON null inventory crashed rather than reporting its
documented cannot-verify result. Registry-only qualification remains blocked by
unpublished required providers; Hosting's scoped identity is being integrated on
its owning collector. The correction does not publish or activate a release gate.

Establish the previously promoted and deleted focused collector at current main,
then propose one bounded correction through a working PR. Keep the package at
0.0.1 before its first publication. New contracts are I24, F50–F52, A24 and
T58–T61; the separate kaal/change collector was checked at
66a3222d4cd677db25be99ce47f3392d3ac92ea1 for identifier collisions.

- Follow Foundation's named test:all convention. Source runs all declared source
  suites, currently Embedded and publisher; the contextual test:package-only
  probe continues to require caller-packed inputs separately. Installed use runs
  Embedded only. Hosting owns all runner host operations and process starts.
  Ambiguous layouts refuse verification; missing Hosting still reports a final
  cannot-verify record. The runner is included in the shipped hash inventory.
- Add explicit authored Case tests-to-Target data using Testing's existing model
  contract. The inventory generator copies those relationships, rather than
  inferring them from annotations or inventing a coverage registry. The delivered
  model contains exactly the nine delivered Cases. Testing and Packaging retain
  model and conformance semantics; Testing is not a runtime dependency.
- Validate the parsed inventory object before accessing its fields. Null and
  other malformed evidence report cannot verify/2 with a cause and no Cases run.

The isolation evaluator, public declarations, actual delivered Case assertions,
required Case inventory and provider identities/versions are unchanged. Root
manifests, lockfile, Engineering integration and workflows are unchanged.

## RED and GREEN

The unchanged regression assertions for T58, T60 and T61 first failed against
the available implementation: a controlled publisher assertion was ignored,
JSON null caused TypeError/exit 1 without a record, and the model was absent.
These were assertion failures, not missing modules counted as RED. T59 preserves
the existing installed result behavior for exits 0, 1 and 2. The corrections make
all four Cases pass, including ambiguous source/installed layout challenges.

Final local verification, Node 24.22.1 and npm 11.9.0:

- Source npm test: nine Embedded and ten publisher tests pass.
- Full Guard Engineering: 241/241 pass, no skips or todos.
- Full Guard Acceptance: 38/38 pass; seven packages packed once, seven scenarios,
  eight installations in eight hosts. Existing physical-containment and absence-
  of-unrecorded-installations findings remain unknown.
- T56 consumes that same immutable artifact set. With an empty cache and fresh
  consumer, request only the Change tarball with omit=dev. npm resolves checked
  local-tarball overrides for required providers. No Core, Testing or Engineer
  Skill dev package is installed; all nine Cases verify through the existing
  Release summary judge. This probe remains outside Testing's acceptance ledger.
- The installed package's 27 files exactly match the corresponding source bytes.
- Installed npm test with a null inventory, or without Hosting, reports the final
  cannot-verify/2 record with a cause and no Cases run.

No fresh evaluator mutation run is claimed: its code and the delivered assertions
are unchanged. The new entry, failure and trace-data behavior has the independent
regressions and conformance challenges above.

## Packaging and Testing benchmark

Use the actual owner implementations from Packaging collector
1c743dbd496d652c8343d2a4c0cb8a9a4950b755 and Testing collector
79524490a219b9f622052047d891f2bd30e631b6, without copying them into the product.
Pass Testing's public check and tested functions into Packaging's conformance
API. This is an explicit local benchmark; these collector contracts are not an
activated main release gate.

- F8–F12 and N7–N9 verify against the installed candidate.
- F13 now verifies: nine delivered Cases test ten of 45 defined identifiers.
  Omitting a Case or pointing at an undefined target makes F13 fail. This is test
  traceability, not a claim that all identifiers are tested or repository evidence
  is authoritative.
- Source F14 verifies against the named test:all entry and observed source run.
- F7 fails because the controlled consumer's dependencies resolve from file
  overrides. That is the transport limitation, not evidence of registry
  qualification. The complete generic conformance result is therefore failed,
  never presented as an overall verified package.

package-evidence.json records the artifacts, hashes, actual conformance findings
and negative observations. The Change tarball SHA-256 is
881fe853b4915db488f53b0634d61838bdb7425fc6d92c8794d144f2a2b534fe.
Local evidence is not a tested CI release artifact or publisher provenance.

## Remaining release dependency

Release the required provider versions under their Owner-approved identities,
then reconcile the actual production imports/dependencies through a separate
reviewed integration. Current main still uses kaal-hosting and kaal-graph;
Hosting's owning collector declares @kaihacksai/kaal-hosting. A speculative
rename here would not be installable against main. Registry-backed installation,
the existing Release process and independent Owner review are still required.
No npm publication, release authorization or selective-CI activation is claimed.
