# Boundary Check Test Plan per package: what `conform` checks (packaging/C23)

PLAN only. This is the single normative specification of C23 as of the Owner's rulings of 4 Nov. It replaces the earlier text of #1043, #1046 and the first drafts of this amendment: nothing in the history of this file is active, and where an earlier PLAN said anything different (the record is unshipped or source-only, decisions have an `Engineering` class) it no longer applies. It changes no runtime file, publishes nothing and authorizes no merge, SYNC, promotion or publication.

It answers: every package has two Test Plans (a Package Check and a Boundary Check); the Boundary Check can be aimed at any file or folder and its result is a finding list; the promotion gate is B, a recorded decision on every finding, technical judgment by the CTO and product impact by the CPO (Owner, 4 Nov); boundary tests ship; Engineering Defects are delivery defects and never Package Defects (Owner, 4 Nov); and Hosting's PLAN `hosting/C100` (#1042).

## Split of work

- **Hosting** supplies the scan and the finding id (`kaal-hosting/<file>:<line>`, one finding per source line; later uses of a bound identifier are references under the origin finding and need no decision, hosting/F66, F68). Hosting emits no decision and judges none (hosting/F69). Its own Boundary Check is declared not applicable (hosting/F71).
- **Each package owner** keeps the Boundary Check record and the decisions in it.
- **Packaging** (this PLAN) states the shape of the record and what `conform` observes about it. **Testing** owns what a Test Plan is; the record mirrors Testing's Plan model.
- **The CTO and the CPO** decide each finding. `conform` never does.
- **Engineering's own tree is not a package.** Findings in Engineering's own tooling (CI, release, ledger) are decided in `engineering/boundary/engineering.md`, and any Defect from them is an Engineering (delivery) Defect in `engineering/defects/engineering/`. That is Engineering's, outside Packaging; `conform` takes no Engineering path as input.

## The record: what a package ships

The Boundary Check record is **one file that ships**. It is not in `test/verify.json` (that file is generated and pins shipped files by hash; a human decision would force a regeneration and is not Package Check evidence), and it is never an immutable planned test (see below). It holds:

1. **Declaration.** Either `Applicable`, with the targets the scan is aimed at and the command used, or `Not applicable`, with a reason in words. Hosting declares not applicable because Hosting is the operating-system boundary. A missing declaration is not the same as not applicable.
2. **Findings.** The path of the recorded finding list (a JSON file of the scan's result) and its **coverage line** (files read, files unreadable). Packaging reads only the `id` of each finding, the ids of its `references`, and the **digest of the line text** (SHA-256, Foundation) beside each id. It imports nothing from Hosting and knows no rule or kind, so the producer can change without changing `conform`. The finding list ships with the record, so an installed copy can check the same ids.
3. **Decisions.** One entry per finding id, or per named pattern that lists every id it covers. Each entry has a decision (keep, re-architect or accept), a reason, the technical decider (CTO), the product-impact decider (CPO), a date, and a pointer to the Package Defect when the finding is a fault. A decision matches a finding only when id **and** line digest both match. A reference needs no entry of its own: it is covered by its origin finding.

**Every decision on a finding in a package is a package decision, and ships.** There is no `Engineering` class for a package's findings. A finding that is a fault in what the package contains becomes a Package Defect in `06-defects/` (in today's layout, the package's Defect record), and the decision links to it. A fault is never an Engineering Defect.

## Where the record lives, and how it moves (one path, two layouts)

The location depends only on the package's layout (packaging/C24, #1049); `conform` does not need to be told, and a package is in exactly one layout.

| Where | Today's layout (until the package takes C24) | Package in the C24 layout |
| --- | --- | --- |
| Source of the record | `test/boundary-check.md` | `04-test/boundary-check/boundary-check.md`, finding list beside it |
| Shipped | `test/boundary-check.md`, listed in the package's `files` | `dist/test/boundary-check/boundary-check.md`, a generated copy equal to the source |
| What `conform` reads in the source workspace | `test/boundary-check.md` | the source in `04-test/boundary-check/` |
| What `conform` reads on an installed package | the shipped file at the same path | `dist/test/boundary-check/` under the installed package |

- **Transition.** The move is the package's own layout Change, not part of C23. It moves the file and nothing else, and it supersedes only the path clause of any immutable Case that names the old path (Owner, 4 Nov, path-only supersession), recording each Case with its before and after path. Hosting is the first: C101 to C103 land in today's layout, so C103 adds `test/boundary-check.md` and adds it to `files`; Hosting's later layout Change moves it.
- A package in the C24 layout whose record is still at the old path, or in both places, is reported by the structure check (C24) as not in the layout; `conform` judges whichever one the layout it detects names, and never both.
- **Not a planned test.** A decision record changes over time, while planned tests are immutable to DO and CHECK. The record is therefore never listed in any Boundary Declaration or immutable set. It is pinned by the manifest like any shipped file, and editing a decision regenerates the manifest, which is correct.

## What `conform` observes

Results stay three-valued and `conform` never judges whether a decision is right. The same rules hold in the source workspace and on an installed copy.

- **Not applicable, with a reason:** verified as a declaration. No reason, or an empty one: failed.
- **No declaration, or no readable record:** unknown (the evidence is absent, nothing is known to be wrong). A package that declares the record but leaves it out of its shipped files is reported as not shipping it.
- **Applicable, finding list unreadable or not the stated shape:** unknown.
- **Applicable, list readable, and a finding id with no decision (directly or through a pattern), or a decision missing a decider, a reason or a date:** failed. The obligation is declared and observed unmet. This is the accepted Gate B: an undecided finding is a known gap against a declared gate, not an inability to observe.
- **A finding whose id matches a decision but whose line digest differs:** undecided (failed), and the old decision is reported **stale**, visibly.
- **A decision that names a class other than `Package`:** failed (no Engineering-class decisions exist for a package). A decision with no class is read as `Package`.
- **Applicable, every id decided with both deciders named:** verified, as completeness only. The finding states that adequacy of each decision stays with the CTO and CPO.
- **A decision for an id that is not in the list, or a pattern naming an id that is not in the list:** reported as stale, never as failed, because the list may simply have moved on. Stale decisions alone never fail.
- **Coverage.** The list carries a coverage line; an empty list with no coverage line, or one showing unreadable files, is unknown, never compliance.
- **Freshness is separate.** `conform` checks the recorded list. It does not re-scan. When the caller supplies a `scan(targets)` function, as `conform` already takes Testing's functions, `conform` compares the fresh ids with the recorded ones and reports ids that appeared or disappeared as unknown until the list is re-recorded. Without it, the finding says plainly that the list was not re-scanned.

This is the N9 rule applied again: the record existing, or the list being empty, is not evidence that a package complies. A report with no findings means none was found within the scan's stated coverage.

## Hosting

`packages/kaal-hosting/test/boundary-check.md` ships with its not-applicable declaration, its reason and a pointer to `test/verify.json`, and records no finding list for Hosting itself. C103 supersedes only the path clause of its T122. It follows the transition above and moves in Hosting's layout Change.

## Identifiers (provisional; reserved so C10, C17 to C22 and C24 are untouched)

| Id | Statement |
| --- | --- |
| packaging/F35 | A KAAL package declares a Boundary Check in one shipped record file, applicable (targets and command) or not applicable (with a reason). A missing declaration is unknown. The file is `test/boundary-check.md` in today's layout and `04-test/boundary-check/boundary-check.md` (shipped under `dist/test/boundary-check/`) in the C24 layout. |
| packaging/F36 | For an applicable Boundary Check, `conform` reads the finding ids, line digests and coverage of the recorded list and requires one decision for each id, directly or through a pattern that names it, each with a technical decider, a product-impact decider, a reason and a date. A missing decision, or a changed line digest, is failed. References are covered by their origin finding. All decisions on a package's findings are package decisions and ship; none has an `Engineering` class. |
| packaging/F37 | `conform` never judges a decision, ranks a finding or treats an empty list as compliance. Stale decisions are reported, not failed. With a caller-supplied `scan`, ids that appeared or disappeared are unknown until re-recorded. The same rules apply in the source workspace and on an installed copy. |
| packaging/A24 | One reader of the record and one reader of the finding list. The list is read by `id`, `references` and line digest only, so Packaging has no dependency on Hosting or on any rule vocabulary, and no Engineering path is an input. |

Test Case ids T78 to T86 and T93 to T97 are reserved for this Change.

## Test Cases (RED first, then DO)

Fixtures only. No scan runs, no network.

- **T78** Not applicable with a reason: verified. Not applicable with no reason: failed.
- **T79** No record file: unknown. A record with no declaration: unknown.
- **T80** Applicable, finding list missing or unreadable: unknown.
- **T81** Applicable, every id decided with both deciders: verified, and the finding says completeness only.
- **T82** One id with no decision: failed, naming the id. A decision missing a decider, a reason or a date: failed.
- **T83** A pattern entry covers the ids it names, and an id it does not name is still undecided. A reference with no entry of its own is not undecided.
- **T84** An empty finding list is not reported as compliant: the finding states that none was found within the stated coverage. A package with the declaration but no recorded list is unknown.
- **T85** A decision for an id absent from the list, and a pattern naming one, is reported stale, not failed.
- **T86** With a caller-supplied `scan`: an id that appeared or disappeared since the recorded list is unknown. Without it, the finding says the list was not re-scanned.
- **T93** Same id, different line digest: the finding is undecided (failed) and the old decision is reported stale. Same id and digest: decided.
- **T94** The recorded list carries no coverage line, or it shows unreadable files: an empty list is unknown, never compliance.
- **T95** A decision that names a class other than `Package`: failed. A decision with no class is read as `Package`. `conform` is given no Engineering path and reads none.
- **T96** On an installed directory, the shipped record is judged in full (declaration, finding list and every decision), with the same result as in the source workspace. An undecided finding is failed there too. In today's layout the installed path is `test/boundary-check.md`; in the C24 layout it is `dist/test/boundary-check/`.
- **T97** The shipped record is pinned by the manifest and is not an immutable set: editing a decision regenerates the manifest and changes no planned test. A package that declares the record but leaves it out of its shipped files is reported as not shipping it. A package in the C24 layout with the record at the old path, or at both, is judged at the path its layout names and never at both.

## Held, not proposed

- Whether the general profile judges any of this. The deciders are KAAL roles, so this is a KAAL-profile finding.
- Any change to F7, N8 or N9, and any new hard dependency.
- Ownership of the decisions themselves: each package owner, with the CTO and CPO. Packaging does not store them centrally.
- The exact JSON shape of the finding list beyond the fields Packaging reads (`id`, `references`, line digest, coverage): Hosting's.

## Sequencing

This PLAN, then RED (T78 to T86 and T93 to T97), then DO. It needs Hosting's finding id format only as an opaque string, which `hosting/C100` already states, so it can proceed without waiting for Hosting's DO. Hosting's `hosting/C103` (its two Test Plans) takes the shape from here and moves the file in its later layout Change (packaging/C24, #1049).
