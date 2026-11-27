# Hosting: Testing

This is Hosting's Product Verification Test Plan: the one that ships, and that your installation runs. Every promise in [Intent](intent.md), [Requirements](requirements.md) and [Architecture](architecture.md) is checked by a delivered Test Case, allocated to the publisher's own tests, or named below as verified by no Test Case. Each case names the identifiers it checks in its title, or in the title of the suite that holds it, for example `hosting/T1 [hosting/I1, hosting/F1]`. The identifiers are the trace: a case covers what its name cites.

## The loops

| Loop | Checks | Where | Runs in your installation |
| --- | --- | --- | --- |
| Intent | the outcomes hold for a consumer of Hosting | `intent.test.mjs` | yes |
| Requirements | each obligation holds | `requirements.test.mjs` | yes |
| Architecture | each element keeps its placement, boundaries and dependencies | `architecture.test.mjs` | yes |
| Code | the implementation behaves as designed | every other `*.test.mjs` beside them | yes |

The three outer loops are the acceptance boundary. A case there reaches the package only by its name, `@kaihacksai/kaal-hosting`, so in your installation it exercises the installed copy, and it works only in directories of its own in the operating system's temporary directory. The Code loop tests each operation from the inside. Some cases make the host fail on purpose, through the same `graceful-fs` the package uses, so that a rollback and its report can be checked on your host.

Every case is a plain `node:test` file that needs only Node 24 or later and npm.

## Running them

In your installation, one command runs every delivered case against the installed copy and ends in `verified`, `failed` or `cannot verify` (hosting/F20–hosting/F25):

```sh
npm explore @kaihacksai/kaal-hosting -- npm test
```

Its last line starts with `kaal-hosting-verification ` and carries the result as JSON, with the agreeing process `exit` and string-list `causes` (empty when verified). It names the installed package, its location, your platform and Node version, the digest of the installed files and every case with its outcome, lists under `traces` the cases that cite each identifier, and maps every identifier defined here to `covered`, `allocated` or `unverified`. A trace is declared, not evidence: an identifier is `covered` only when a case that cites it passed in this run, and `not applicable` when every case that cites it is declared not applicable here. It lists each allocated and unverified identifier as not verified by this run.

In Hosting's source workspace, the same `npm test` runs every suite the package declares as a `test:<name>` script, the publisher's included.

Publisher cases hosting/T88–hosting/T89 additionally characterize escaping-path refusal, preservation of unrelated sibling bytes and the actual transient writer footprint through real filesystem calls. They do not prove caller authority. Independent review of the general Skill must separately challenge root-only tasks, adequate-footprint tasks and advice to erase recovery originals or treat staging as implicitly authorized; a mechanical pass is not that judgment.

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
| hosting/A2 | hosting/T89 observes real lock/staging/aside operations and their cleanup; existing delivered rollback/recovery cases retain the failure guarantees. |
| hosting/N1 | every delivered case and every publisher test on Linux, Windows and macOS before a release |
| hosting/F15, hosting/F17, hosting/A9 | hosting/T21, hosting/T24, hosting/T41 and hosting/T83: the package manifest, and the candidate packed and installed alone into a fresh consumer |
| hosting/F18, hosting/F19, hosting/F21, hosting/F22, hosting/F23, hosting/F24, hosting/F25 | hosting/T25–hosting/T31: the candidate packed, installed into fresh consumers and verified, unchanged and with one thing changed each time; hosting/T84–hosting/T87 also drive the real verifier through controlled passing, failing and unavailable consumer cases, including unexpected failure, and judge the records with the existing release contract. hosting/T79 additionally challenges duplicate declared and executed case identities, inventory generation, and preservation of every observed failure; these adversaries stay publisher-only. |
| hosting/F20 | hosting/T53–hosting/T54: the verification entry copied into a fixture workspace and into directories that are neither an installation nor a workspace |
| hosting/F28, hosting/F34, hosting/N5, hosting/A14 | hosting/T32–hosting/T40: the conformance suite against positive and negative fixtures, its command's exit codes, and its review instructions |
| hosting/N6, hosting/A18 | hosting/T42–hosting/T46: the host facts and the special-entry fixture in fault cases, the portability audit against Guard's negative sources, and its command; hosting/T90–hosting/T100 additionally fix conditional alternatives, complete if/else extents, semicolon-free and awaited/member registrations, and member/logical/comma/ternary continuations with literal endings without borrowing adjacent cases. These attribution regressions remain publisher-only. |
| hosting/F57, hosting/F60, hosting/N8, hosting/A23, hosting/A25 | hosting/T71 and hosting/T75: packaged and relocated Skill checks and inventory. hosting/T76–hosting/T78: existing recovery/result fixtures plus separately recorded guidance and agent validation; structural checks alone do not establish agent behavior. |
| hosting/I15, hosting/F64, hosting/F65, hosting/F66, hosting/F67, hosting/F68, hosting/F69, hosting/F70, hosting/F71, hosting/N9, hosting/A27, hosting/A28, hosting/A29, hosting/A30, hosting/A31 | hosting/T114–hosting/T124: the Boundary Check scan against fixtures built in a temporary directory (targets, findings only, one finding per line, references, ids and digests, no stored decision), the retired boundary skill and the moved host guide, and Hosting's two Test Plans |
| hosting/I16, hosting/F72, hosting/F73, hosting/F74, hosting/N10, hosting/A32, hosting/A33, hosting/A34 | hosting/T129–hosting/T136: `list` and `scratch` on every host (order, empty directories, refusals, cleanup and its failure), their interface, and the intent, the requirement and the architecture tests that name them |
| hosting/I17, hosting/F75, hosting/F76, hosting/F77, hosting/F78, hosting/F79, hosting/N11, hosting/A35, hosting/A36, hosting/A37 | hosting/T206–hosting/T216 and hosting/T226: the start decision on every host with an injected description, the refusal and `viaShim`, `executeSync` against `execute`, the isolated environment, the prepared fixture and its copies, the interface, and the single install in the successors (hosting/T217–hosting/T225) of Hosting's installed-package Cases hosting/T24–hosting/T31 and hosting/T75 |
| hosting/I18, hosting/F80, hosting/F81, hosting/F82, hosting/F83, hosting/F84, hosting/N12, hosting/A38 | hosting/T272–hosting/T279: `readRevision` and `revision` on a scratch repository built in a temporary directory (committed bytes, never the working tree; found, no such revision and unreadable kept apart; a ref taken as data; links and submodules refused; `under` read as literal names, with pathspec magic and wildcards matching nothing; three Git starts for five files and for eighty), `kaal-hosting-revision` against the library, and the placement, interface and guidance of both (hosting/T277 and hosting/T278 read the sources, which do not ship) |
| hosting/I19, hosting/F85, hosting/F86, hosting/F87, hosting/F88, hosting/F89, hosting/N13, hosting/A39 | hosting/T290–hosting/T296: `readPullRequests` and the command with an injected `gh` that answers like each environment (GraphQL answering; GraphQL refused with REST and the cloud review-thread route; no thread route; nothing answering; a refusal against a failure in transit), and the placement, the transports as separate modules, the interface row and the guidance |
| hosting/I20, hosting/F90, hosting/F91, hosting/F92, hosting/A40 | hosting/T297–hosting/T302: `list` with no options, `{}` and the defaults written out gives the same listing and still refuses a link to a directory; `skip` at the root and at depth, a skipped file, a whole-name match only; `links: "skip"` and `"refuse"` for links to a directory and to a file; a skipped directory is not read; a bad option is a `TypeError` and the order stays UTF-16 |
| hosting/I21, hosting/F93, hosting/F94, hosting/F95, hosting/F96, hosting/F97, hosting/A41, hosting/A42 | hosting/T303–hosting/T317, hosting/T327, hosting/T328: the exact template and body bytes, determinism and line ends, the refusals of an invalid declaration, `checkTemplates` on a real directory, the generator importing no `node:fs`; `raisePullRequest` against a stand-in for the API (revisions and policy read at the base, the two steps, the declared auto-merge only, the rules of the owners, the write areas, partial failures and a moved head or base, a rename judged by its source, the token, the caller's authority refused and a permissive head policy never read, every unknown refusing) and the command `kaal-hosting-pull-request` |
| hosting/I23, hosting/F104, hosting/F105, hosting/A46 | hosting/T332–hosting/T335: the template and body bytes with visible text and without, the refusals of an invalid `visible`, `checkTemplates` naming a changed or missing line, and `raisePullRequest` against the stand-in for the API (the owner's text at the base opens the body, the head's is never read, a caller's is refused before any call) |
| hosting/I25, hosting/F113, hosting/A50 | hosting/T349–hosting/T353: the head the event names and the trigger stated for each of the four events with nothing invented, every unreadable event, id and form refused, a disagreement stated and not refused, content related to content and Git to Git (a merge that holds the head and a changed file at the head commit are other content), the identity of bytes and paths written out independently and moved by a byte or a path and not by order, no environment, file or Git read by the facts, and `readCheckout` and the command on a scratch repository with a real test merge commit (the content without `.git`, the head's content from the repository, a directory that is not a Git working copy, exits 0 and 2 and never 1) |
<!-- /kaal-hosting:allocated -->

## Verified by no Test Case

<!-- kaal-hosting:unverified -->
| Identifiers | Why |
| --- | --- |
| hosting/A3 | a bound on cost: a reconciliation reads no more of the root than its own paths. No case measures what is read. |
| hosting/A5 | a placement: what `executable` means on each host is decided only inside Hosting. Its effect is checked as hosting/F7; that no other capability decides it is the conformance suite's to find in that capability. |
<!-- /kaal-hosting:unverified -->
