# Known failures: Architecture

- **testing/A51** [testing/F149, testing/F150, testing/F151, testing/N33]: **A pure comparison beside the runner.** `lib/expectations.mjs` holds `compareExpectations` and the register check, with no I/O and no import beyond the language, like `compareReports`. `bin/kaal-testing.mjs` reads the register file through Hosting and passes both to the function, so Testing's boundary (no direct file access in delivered code) holds. The package gains one export, `./expectations`. The Cases pack the package, install it into an empty project and observe the installed copy, as testing/C65 does.

## SIPOC

| Supplier | Input | Process | Output | Customer |
| --- | --- | --- | --- | --- |
| The owner of the register (the one who knows a Test Case is RED on purpose and why) | the register: ids and opaque references | **Testing:** run the tests, compare the run with the register, list `held`, `notHolding`, `unconfirmed`, `absent`, `unexpected` | the run report with `expectations` | the consumer of the report: whoever judges a merge or a release on it; the owner of the register, who removes a `notHolding` entry |
| Testing | the run (tests and their observed result) | | | |

Testing is one step. It starts at a run and a register and ends at a list, handed on.

## Who owns what (Kai, 11-20)

Review has the finding. Defect has the register and its mechanic. Testing has the mechanics of the comparison, which is this Change. Architecture has functional placement. Where a defect is found carries the defect until Architecture moves it. Capabilities depend only on Foundation and Hosting, so none of them imports another; the register is data in the abstract format below, and Testing reads it without knowing who wrote it.

This PLAN covers the Testing side only: the comparison, the format it reads and the command. The register's lifecycle, how entries get in and out, how a finding becomes an entry and how the consumer judges the list are separate Changes of their owners. The one rule Testing states for them is that a `notHolding` entry describes nothing true any more and its owner removes it.
