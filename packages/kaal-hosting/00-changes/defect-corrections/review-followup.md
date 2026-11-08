# C27 independent-review correction evidence

Date: 2026-11-02. Accepted collector ec5ce9f88f1ccd5bea3c68b78f8eb7e832c5b93d.
This continues approved D4's affected-case attribution correction; it adds no
operation, dependency, parser framework, requirement or exception to governance.
The original approval on 685adc1 was dismissed and is not reused as approval.

## Independent findings and final disposition

Review of 5c28f360f985157d4d658b733c0f48323055d98b found two P2 D4 defects:
conditional registration with it/test in the first alternative was omitted;
statement extents could omit controlled cases or include adjacent registrations.
The independent report and all subsequent dispositions are retained in
independent-review.md. Final isolated review reports no remaining actionable
finding within this bounded correction, 31/31 tests passing and all 21 direct
fixture probes matching. It is agent content-review evidence, not GitHub Owner
approval, exact-head CI, merge authorization or publication acceptance.

The correction recognizes either conditional callee alternative and simple
member registrations, balances complete if/else chains, and bounds semicolon-free
statements using top-level tokens and expression continuations. Quoted literal
placeholders preserve terminal-token information without exposing their contents
to structural matching. Existing literal-name and static-inspection limits remain;
this is not a general JavaScript parser or proof that arbitrary source complies.

Final reviewed src/boundary-core.ts Foundation SHA-256:
383451ab213ac88bf85405e523fe33986fd7809679175fe506cb04284b675cc9.
D1/D2/D3 and C29 runtime/verifier/manifest blobs are unchanged from 5c28f36.
Only test:publisher changes in package.json; every other script/field, dependency,
export, packed files declaration and version is unchanged. Root lock is unchanged.
The historical C16 reconstruction is retained, not relabeled as a fresh derivation
of this script-only amendment. Future migration requires fresh complete proof.

## Frozen additional regressions before correction

The original frozen regressions and all their assertions remain unchanged.
Each new file was observed assertion-RED before its relevant local correction;
no syntax/import/setup failure counts as RED. Four remote test-only commits precede
the final correction. They do not move any collector or authorize integration.

| Cases/file under test/publisher | Frozen commit | Foundation SHA-256 | Observed assertion RED |
| --- | --- | --- | --- |
| T90–T93 attribution-branches.test.mjs | 038fcce76e52db4770eb4d8cd58bf9a41c986ac3 | 7c0d1a2b9f31f5b5d57fea2eb6f1c42c113e7d17e93a00ec55f6d0176505d5c4 | 4/4 |
| T94–T96 attribution-prefixes.test.mjs | fa503e369939c70f525b78d7c14a0eee0c06950b | 56983c5e97a5c3dc7dee92ff083c17aeef3d5c23dec25bb22636ac19c222b1d0 | 3/3 |
| T97–T99 attribution-continuations.test.mjs | ebe2a64c4c5d3d15fcb4b762fee3945d58641ee2 | 83b21a8541adc844758934d616644dd9db1a85efc16c61a96a6bceef6d04314d | 3/3 |
| T100 attribution-ternary.test.mjs | 847ee10ec6fcf7d1a159977a1a5c1a3794030cf5 | 1b7fe7f554bcad6bde8705954f64c026abfd9bf6596c799cca8b4b0d4484a94c | 1/1 |

Final independent and parent targeted runs each pass 31/31, zero skips/todos.
Original usage mutations: 4/4 assertion-killed. Original defect mutations: 5/5.
Additional attribution mutations: 6/6 (omit first alternative, spill else-if,
spill ASI, omit comma continuation, erase literal terminal, omit ternary colon).
All mutants restore exact bytes in finally; setup failures never qualify. The
conditional mutation match does not depend on emitted LF versus CRLF. Earlier
mutation-harness routing/escaping failures were corrected and not counted as kills.

Original delivered allocation.test.mjs remains SHA-256
dc36f0df94cde01407a1483235171a849de77c68f3cd2e69ee75115721559760;
fixture-ownership.test.mjs remains
d82c2c6fbb090cd7fa3b752610f536f6453a01dc37ff93b20719cf2324d16ad4;
original publisher defects.test.mjs remains
8dff9db33aad183b58495cb8e6f7a4460b9acb7d13a5cfe9da176db22fa78464.

## Full-source and packing limits

Node 24.22.1/Linux, npm 11.21.0, locally cached integrity-checked exact runtime
versions and TypeScript 5.9.3. The final full source command ran after all mutation
commands finished: first group 164 cases, 162 pass, only existing T43/T66 fail
because this sandbox cannot establish the Linux socket fact, zero skips/todos.
The chained groups do not run after that failure; their targeted results above
are separate commands. Normal npm pack/prepack was attempted and fails closed at
T66. No local normal tarball or clean packed-consumer acceptance is claimed.
No tests, host guide, applicability or required CI were weakened.

One independent T79 attempt collided with a parent-designated mutation. It is
explicitly excluded from product/acceptance evidence; after every parent test,
mutation and prepack command completed, the independent reviewer reran the entire
31-case selection alone and passed. Earlier overlapping full-source attempts are
likewise superseded by the final sequential run. Exact original verifier and
manifest blobs were restored before that isolated review.

The old 5c28f36 native run passed 153 source and 15 normal packed/installed cases
on all three hosts, with original mutations; it does not qualify this amended
runtime. Fresh exact-head Linux/macOS/native-Windows source (including all new
publisher cases), normal prepack, inventory, installed/negative and all mandatory
repository checks are required. Source hydration is not clean npm ci acceptance.

No merge, SYNC, promotion, queue override, gate relaxation, auto-merge activation
or npm publication is authorized. #831 is returned to draft and unarmed while
review, CI and separate Owner integration authority remain open. #832/#835 follow
the actual accepted collector after authorized integration; Engineering-owned
#834 and trusted migration admission stay with Engineering.
