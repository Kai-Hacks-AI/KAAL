# Consumer Verifier Conformance: Intent

This is `testing/C29`, a PLAN Change. It ships no code. `testing/C30` turns its planned tests GREEN.

**What the Owner set.** On #629 (review 5704237140), the Owner asked that independent consumer verifiers be tested against one shared observable result contract, covering zero or absent tests, a tampered or missing manifest, skipped or inapplicable cases, failures, and the exact installed-package evidence, and that matching result labels never count as proof of equivalent semantics. The Owner's clarification there (comment 6507310201) places it:
- Testing owns the result and evidence semantics and the conformance cases.
- Packaging owns the package entrypoint convention.
- Each package owns its verifier and its tests, and duplicated verifier code is accepted.
- Engineering checks each installed package's verifier against Testing's conformance cases in its own Change, requested on #625.

**What exists.** testing/F11–testing/F17 (`testing/C9`) state consumer verification: one entry point that fails closed, exactly one result of verified, failed or unknown, each with its own exit status and summary, and evidence naming what was exercised. testing/A9 records npm as the first realization, with the exit statuses 0, 1 and 2 and one machine-readable summary line. Guard ships its own verifier, Hosting plans one (hosting/F20–hosting/F26 on #629), and Graph another (#627). Each prints its own summary line and uses its own word for unknown, such as Guard's "cannot verify".

- **testing/I14**: Every consumer verifier is held to the same observable behaviour, whoever implements it. Testing states that behaviour as conformance cases: the change a publisher's harness makes in a fresh consumer, and what any conforming verifier must then show. A verifier conforms only when everything it shows agrees with what the harness itself established: its exit status, its result, its cause, each case's outcome, and the installed package's evidence. A matching result word alone never conforms. Testing judges observations and runs nothing: packing, installing, changing the consumer and running the verifier are the harness's, in Engineering's Change.
