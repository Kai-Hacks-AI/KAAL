# Declaration delivery: acceptance

| Case | Targets / observation | Negative discriminator |
| --- | --- | --- |
| T46, publisher | F25, N16: exact accepted owner Node, claim and public export | Changed identity, type, name, export or ownership claim |
| T47, publisher | F26, N15: normal pack and ignore-scripts inventory agree; manifest and installed inventory exact; clean installed public resolution and npm test | A stale/repaired manifest, extra/missing file, leaked claim, source-only path |
| T48, publisher | F26: installed tampering gives cannot verify; wrong Node behind refreshed digest gives failed | Verification that trusts only its own manifest or omits the delivered Node Case |
| T49, publisher | F27: package install/read/uninstall leaves pre-existing Engine/configuration untouched; scoped export absent beside unscoped impostor fails | Implicit registration, metadata substitution or unscoped fallback |
| T50, Embedded | F25, F26: shipped Node's accepted content identity/name/type through public export | Wrong authoritative declaration hidden behind regenerated manifest |
| T51, Acceptance | F25–F27, N15: existing ledger-backed lane installs exact tarball alone and runs resolution/installed verifier on each supported OS | Workspace link/source dependency or installed verification not actually run |

T37–T45 belong to #747. T35 remains unchanged. T9/T36 change only as the explicit
amendment table permits. The new cases are immutable to DO after PLAN acceptance.
Preserve the existing wrong-library, false-GREEN, missing/extra/undeclared Case,
bin-collision and damaged-source-layout challenges. No Case is deleted, weakened,
filtered out, skipped or relabeled as platform-inapplicable to make this pass.

The executable publisher probes, clean-consumer/negative/lifecycle fixtures,
Embedded Case and ledger-backed Acceptance scenario accompany this PLAN. They
are not enrolled in source npm test or Acceptance until their DO. Initial RED
is recorded against exact #749 bytes; it must fail for missing delivery, not
missing tooling. No planned Case is represented as executed GREEN.

Retain tool versions, exact source/candidate heads, npm inventory, tarball SHA-256
and integrity, manifest digest, public resolved path and Node digest, declared/
executed Case records and negative outcomes. Repeat from clean committed bytes;
normal pack must neither repair nor dirty those bytes. A Linux autocrlf rehearsal
does not establish native Windows acceptance. Historical #749 three-host GREEN
does not establish 0.0.2 declaration delivery. Record not-run/unknown honestly.
