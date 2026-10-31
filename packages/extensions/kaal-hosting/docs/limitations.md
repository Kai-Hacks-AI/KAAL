# Hosting: Limitations

What Hosting does not establish. The obligations they concern are in [Requirements](requirements.md). These limits are stated, not prevented.

## Operations

- **Containment is by canonical path.** `within` compares canonical paths, not physical objects, so a bind mount, a hard link or another alias can reach the same object from outside `root`. It is a check, not a lock: a link changed between the check and a later read is not prevented (hosting/F48).
- **One filesystem.** Hosting stages its writes beside the directory and renames them into place, so the directory and its parent must be on one filesystem (hosting/F49, hosting/A21).
- **Readers take no lock.** `read`, `readFile` and `kind` take no lock, so a reader can see a directory while a writer changes it.

## Guarded file reconciliation

`reconcile` offers no transactional guarantee beyond hosting/F6 and hosting/F11.

- **Uncooperative writers.** The lock serializes Hosting's writers only. A process that writes into `root` without Hosting can change a file between the precondition check and the apply, and that change is not detected. A caller, KAAL Core included, must not treat `reconcile` as protection against writers that do not use Hosting: its preconditions guard against changes made before the reconciliation began, not against a concurrent uncooperative writer.
- **Expectations.** hosting/F14 makes an expectation exactly as strong as a write's guard. Hosting's writers cannot change an expected file between the check and the apply, and a writer that does not use Hosting is not excluded.
- **Readers.** Readers take no lock, so a reader can see a reconciliation half applied.
- **Unrecoverable host failures.** A host that refuses the rollback too leaves `root` partly applied, reported under hosting/F11. Hosting cannot then put `root` back, and it does not retry.
- **Leftovers.** A staging or aside directory the host will not let Hosting remove stays beside `root` (hosting/F12). Hosting reports it but does not remove it later. After an apply, it holds only originals that were replaced or removed as planned, never anything `root` needs. A later reconciliation is unaffected, since each one stages under a new name. Because those names are new each time, a report with `leftovers` is not equal between hosts (hosting/N3 holds for every report without them).
- **Crashes.** Rollback covers every failure Hosting observes while it runs, not the end of the process itself. A reconciliation cut off by a kill or a power loss can leave `root` partly applied, with the staged and kept-aside files beside it.

## The conformance suite

- **It reads code; it does not run it.** A platform decision reached through data it cannot see, such as a value read from a file or passed in from outside the inspected sources, is not found. `exclusions` say so (hosting/F32, hosting/F55).
- **Hosting is exempt.** It is the one capability that realizes host differences. The suite is for every other capability, and Hosting's own sources are not its subject.
- **Judgment is Review's.** Hosting defines what is found, what is tested and what is asked. Review decides each judgment, Testing decides how a not applicable case is counted, and each capability corrects its own code and cases.
- **Declarations given to it.** The portability audit reads the declarations the runner gives it and the sources under `root`. A declaration kept elsewhere is not audited; the runner is responsible for passing the capability's declarations (hosting/F40).
- **Hosts.** Whether a host fact holds is established on the hosts KAAL runs: Linux, macOS and Windows. Another host gets its own row in the host guide in a new version of Hosting (hosting/F41).

## The package and its verification

- **The interface is the package's shape, not its behaviour.** What each entry does is the business of its own Requirements and Test Cases (hosting/F35).
- **What `verified` establishes.** Only that every declared case ran and passed against the installed copy on this host, apart from those declared not applicable here, that the installed files match the shipped manifest, and that the consumer did not change. It is not provenance, which only the registry's integrity and npm's provenance attestation give. The manifest ships in the package, so a match is consistency evidence only. It does not cover a behaviour no delivered case checks, nor how a consumer uses Hosting (hosting/F21–hosting/F25).
- **The verification does not verify itself.** The Test Cases of the verification itself do not ship, so a delivered run never checks its own verifier. They are allocated to the publisher, who runs them against a packed candidate in a fresh consumer on Linux, Windows and macOS ([Testing](testing.md)).
