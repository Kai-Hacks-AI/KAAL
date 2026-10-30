# Applicability by Host Fact: Requirements

Each Requirement names, in brackets, the Intents it serves. They extend testing/F43–testing/F50 (`testing/C29`) and change no other.

## Functional

- **testing/F68** [testing/I18]: **A fourth way: a host fact not holding.** testing/F47's applicability becomes `{ platforms?, requires?, absent?, host?, evidence?, reason }`. A case is also not applicable where:
  - **host fact not holding:** `host` is a nonempty list of the host facts the case needs, `evidence` is an `https` link, and the harness established at least one of them not holding on this run.

  The harness establishes host facts through Hosting's `facts()` (hosting/F37) and hands them to `judge` as `facts.hostFacts`, `{ [fact]: { holds, reason, evidence } }`. A fact counts as not holding only where its entry is the harness's own, an own property, and `holds` is exactly `false`. A fact the harness did not establish, an entry whose `holds` is not a boolean, or a fact that holds excludes nothing.

  A declaration with `host` and without an `https` `evidence`, or without a reason, establishes nothing. `evidence` belongs to a `host` declaration: elsewhere it is compared, never required.
- **testing/F69** [testing/I18]: **The same applicability, shown in full.** A verifier that reports a case `not applicable` shows `applicability { platforms?, requires?, absent?, host?, evidence?, reason }`. It conforms only where each of these is the same as what the harness established: the same members, compared as sets for lists, and the same reason and evidence. This extends testing/F44's summary and testing/F47's comparison.
- **testing/F70** [testing/I18]: **Where the fact holds, the case runs.** A case declared by `host` whose facts the harness established holding on this run is an ordinary declared case. In the `clean` scenario it must be reported `pass`. Reporting it `not applicable`, `skipped`, `todo` or `not run` there never conforms. So a verifier cannot use a host declaration to leave a case out everywhere.
- **testing/F71** [testing/I18]: **Verification, not legitimacy.** `judge` decides whether a verifier reported honestly what the harness established. Whether a declaration is permitted is not `judge`'s:
  - which facts exist, and the rules for declaring them, are Hosting's (hosting/F37, hosting/F39);
  - a platform scope outside the operating-system boundary is a violation that Hosting's audit (hosting/F40) and parity (testing/F67) report. `judge` keeps testing/F47's platform way unchanged, so the planned tests of `testing/C29` stand;
  - whether a host exception is genuine is Review's judgment on Hosting's review request (hosting/F40).

  The `not-applicable` scenario covers a host fact as well as a platform scope. No scenario is added, so testing/F43's set and testing/T54 are unchanged.

## Nonfunctional

- **testing/N14** [testing/I18]: `kaal-testing/verifiers` still reads no host, runs nothing and imports nothing (testing/N9). Host facts reach it only as data the harness established through Hosting. Testing never tries a FIFO, a socket or any other host capability itself.

## Not in this Change

- The host facts, `facts()`, the fixtures, the audit and the review guide. They are Hosting's (`hosting/C16`, `hosting/C17`).
- Establishing `osBoundary` (testing/F67) from hosting/F36, and `challenged` (testing/F58) from hosting/F40. They are Engineering's runner, and #668 records them.
- guard/T114's own declaration. That is Guard's (`guard/C118`, #671).
