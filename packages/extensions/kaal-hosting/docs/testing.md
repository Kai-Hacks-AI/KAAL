# Hosting: Testing

This is Hosting's Product Verification Test Plan: the one that ships, and that your installation runs. Every promise in [Intent](intent.md), [Requirements](requirements.md) and [Architecture](architecture.md) is checked by a delivered Test Case, allocated to the publisher's own tests, or named below as verified by no Test Case. Each case names the identifiers it checks in its title, or in the title of the suite that holds it, for example `hosting/T1 [hosting/I1, hosting/F1]`. The identifiers are the trace: a case covers what its name cites.

## The loops

| Loop | Checks | Where | Runs in your installation |
| --- | --- | --- | --- |
| Intent | the outcomes hold for a consumer of Hosting | `test/embed/intent.test.mjs` | yes |
| Requirements | each obligation holds | `test/embed/requirements.test.mjs` | yes |
| Architecture | each element keeps its placement, boundaries and dependencies | `test/embed/architecture.test.mjs` | yes |
| Code | the implementation behaves as designed | every other `test/embed/*.test.mjs` | yes |

The three outer loops are the acceptance boundary. A case there reaches the package only by its name, `@kaihacksai/kaal-hosting`, so in your installation it exercises the installed copy, and it works only in directories of its own in the operating system's temporary directory. The Code loop tests each operation from the inside. Some cases make the host fail on purpose, through the same `graceful-fs` the package uses, so that a rollback and its report can be checked on your host.

Every case is a plain `node:test` file that needs only Node 24 or later and npm.

## Running them

In your installation, one command runs every delivered case against the installed copy and ends in `verified`, `failed` or `cannot verify` (hosting/F20–hosting/F25):

```sh
npm explore @kaihacksai/kaal-hosting -- npm test
```

Its last line starts with `kaal-hosting-verification ` and carries the result as JSON, with the agreeing process `exit` and string-list `causes` (empty when verified). It names the installed package, its location, your platform and Node version, the digest of the installed files and every case with its outcome, lists under `traces` the cases that cite each identifier, and maps every identifier defined here to `covered`, `allocated` or `unverified`. A trace is declared, not evidence: an identifier is `covered` only when a case that cites it passed in this run, and `not applicable` when every case that cites it is declared not applicable here. It lists each allocated and unverified identifier as not verified by this run.

In Hosting's source workspace, the same `npm test` runs every suite the package declares as a `test:<name>` script, the publisher's included.

## Applicability

A case that cannot apply on some host is declared here, with the platforms where it does not apply and why. There it is not run and is reported as `not applicable`, and it does not keep the run from `verified`. A case skipped anywhere else is `cannot verify` (hosting/F25). No case is declared today: where a case needs something only some hosts have, such as a FIFO or a socket in a directory tree, it establishes by trying whether this host has it, through Hosting's own host facts, and checks what the host does either way.

<!-- kaal-hosting:applicability -->
| Case | Not on | Why |
| --- | --- | --- |
<!-- /kaal-hosting:applicability -->

## Allocated to the publisher

Some promises cannot be checked by a run in your installation: they concern how the package is packed and verified, or they need the publisher's fixtures. Each is allocated to the publisher's own tests, which do not ship, and named here. An allocation says what the publisher runs; it is not evidence that the run passed.

<!-- kaal-hosting:allocated -->
| Identifiers | What the publisher runs |
| --- | --- |
| hosting/N1 | every delivered case and every publisher test on Linux, Windows and macOS before a release |
| hosting/F15, hosting/F17, hosting/A9 | hosting/T21, hosting/T24, hosting/T41 and hosting/T83: the package manifest, and the candidate packed and installed alone into a fresh consumer |
| hosting/F18, hosting/F19, hosting/F21, hosting/F22, hosting/F23, hosting/F24, hosting/F25 | hosting/T25–hosting/T31: the candidate packed, installed into fresh consumers and verified, unchanged and with one thing changed each time; hosting/T84–hosting/T87 also drive the real verifier through controlled passing, failing and unavailable consumer cases, including unexpected failure, and judge the records with the existing release contract |
| hosting/F20 | hosting/T53–hosting/T54: the verification entry copied into a fixture workspace and into directories that are neither an installation nor a workspace |
| hosting/F28, hosting/F34, hosting/N5, hosting/A14 | hosting/T32–hosting/T40: the conformance suite against positive and negative fixtures, its command's exit codes, and its review instructions |
| hosting/N6, hosting/A18 | hosting/T42–hosting/T46: the host facts and the special-entry fixture in fault cases, the portability audit against Guard's negative sources, and its command |
| hosting/F57, hosting/F60, hosting/N8, hosting/A23, hosting/A25 | hosting/T71 and hosting/T75: packaged and relocated Skill checks and inventory. hosting/T76–hosting/T78: existing recovery/result fixtures plus separately recorded guidance and agent validation; structural checks alone do not establish agent behavior. |
<!-- /kaal-hosting:allocated -->

## Verified by no Test Case

<!-- kaal-hosting:unverified -->
| Identifiers | Why |
| --- | --- |
| hosting/A2 | a placement: `reconcile` reuses `update`'s lock, staging and file access. What it promises is checked as hosting/N2 and hosting/F6. |
| hosting/A3 | a bound on cost: a reconciliation reads no more of the root than its own paths. No case measures what is read. |
| hosting/A5 | a placement: what `executable` means on each host is decided only inside Hosting. Its effect is checked as hosting/F7; that no other capability decides it is the conformance suite's to find in that capability. |
<!-- /kaal-hosting:unverified -->
