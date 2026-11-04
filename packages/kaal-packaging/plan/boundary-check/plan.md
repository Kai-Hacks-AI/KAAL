# Boundary Check Test Plan per package: what `conform` checks (packaging/C23)

PLAN only. It answers the Owner's ruling of 4 Nov (every package has two Test Plans, a Package Check and a Boundary Check; the Boundary Check can be aimed at any file or folder; its result is a finding list; the promotion gate is B, a recorded decision on every finding, technical judgment by the CTO and product impact by the CPO) and Hosting's PLAN `hosting/C100` (#1042). It changes no runtime file, publishes nothing and authorizes no merge, SYNC, promotion or publication.

## Split of work

- **Hosting** supplies the scan and the finding id (`kaal-hosting/<file>:<line>`, one finding per source line; later uses of a bound identifier are references under the origin finding and need no decision, hosting/F66, F68). Hosting emits no decision and judges none (hosting/F69). Its own Boundary Check is declared not applicable (hosting/F71).
- **Each package owner** keeps the Boundary Check plan and the recorded decisions.
- **Packaging** (this PLAN) states the minimum shape of that plan and what `conform` can observe about it. **Testing** owns what a Test Plan is; the shape below is a proposal to align with Testing before the DO.
- **The CTO and the CPO** decide each finding. `conform` never does.

## The plan file

A package declares its Boundary Check in `test/boundary-check.md` with three kinds of content, so it is readable by a person and checkable by a script:

1. **Declaration.** Either `Applicable`, with the targets the scan is aimed at and the command used, or `Not applicable`, with a reason in words. Hosting declares not applicable because Hosting is the operating-system boundary. A missing declaration is not the same as not applicable.
2. **Findings.** The path of the recorded finding list (a JSON file of the scan's result). Packaging reads only the `id` of each finding and the ids of its `references`. It imports nothing from Hosting and knows no rule or kind, so the producer can change without changing `conform`.
3. **Decisions.** One entry per finding id, or per named pattern that lists every id it covers. Each entry has a decision (keep, re-architect or accept), a reason, the technical decider (CTO), the product-impact decider (CPO) and a date. A reference needs no entry of its own: it is covered by its origin finding.

## Amendment after Testing's input (4 Nov), overriding the text above where they differ

Testing proposed the shape below and the Packaging side agrees.

1. **Not in `test/verify.json`.** That file is generated, pins the shipped files by hash, and is the Package Check's consumer evidence. A human decision would force a regeneration and is not evidence of the package.
2. **Not in a shipped path.** Only Package Defects ship, once accepted. Engineering Defects stay internal. So the record is `test/boundary-check.md` in the source workspace, outside `files`, and nothing in it ships. Consequence, stated plainly: an **installed** copy cannot show its Boundary Check, so this is a **source-workspace** check, like the declared source Test Plan (packaging/F14). `conform` on an installed directory reports it as not judged here, not as unknown package evidence.
3. **Content, three kinds plus three additions:**
   - the **digest of the line text** (SHA-256, Foundation) beside each finding id in the recorded list, so a decision matches a finding only when id **and** digest both match;
   - the **coverage line** of the run (files read, files unreadable) beside the finding list path, so an empty list is never read as complying;
   - a **class** on each decision, `Package` or `Engineering`. Packaging records it and ships nothing; which class ships is Engineering's rule.
4. **States reported:** decided, undecided and stale. A finding whose id matches but whose line digest differs is **undecided** (the line changed under the decision) and the old decision is reported **stale**, visibly. An undecided finding still fails the declared Gate B (CPO-accepted). Stale decisions alone never fail. Neither state judges whether a decision is right.
5. **Not applicable stays a declared status with a reason**, not a skipped Case.

## Second amendment (Kai, 4 Nov): the record sits in `test/`, overriding the path above

Kai asked why the record is not under `packages/<name>/test/`. Hosting and Testing raised no objection, and the CPO has not objected.

- **Path:** `packages/<name>/test/boundary-check.md`, one unshipped file next to `test/verify.json`. It holds the declaration, the pointer to the recorded finding list and its coverage line, and the decisions. Every earlier mention of `plan/boundary-check.md` in this PLAN reads as this path.
- **Why it does not ship:** no package on `main` ships `test/` wholesale; each `files` list names test paths one by one (Packaging: `test/embed`, `test/run.mjs`, `test/verify.mjs`, `test/verify.json`). `conform` checks that the record is absent from the packed file list, so a package that adds it to `files` is reported. It stays a source-workspace check; an installed copy reports it as not judged here.
- **Not a planned test:** a decision record changes over time, while planned tests are immutable to DO and CHECK. The record is therefore never listed in any Boundary Declaration or immutable set, and it is not an input of `test/verify.json`.
- **Hosting:** `packages/kaal-hosting/test/boundary-check.md` holds Hosting's not-applicable declaration with its reason and a pointer to `test/verify.json`, and records no finding list for Hosting itself. C103 supersedes only the path clause of its T122.

## What `conform` observes

Results stay three-valued and `conform` never judges whether a decision is right.

- **Not applicable, with a reason:** verified as a declaration. No reason, or an empty one: failed.
- **No declaration, or no readable plan:** unknown (the evidence is absent, nothing is known to be wrong).
- **Applicable, finding list unreadable or not the stated shape:** unknown.
- **Applicable, list readable, and a finding id with no decision (directly or through a pattern), or a decision missing a decider, a reason or a date:** failed. The obligation is declared and observed unmet. This changes what I told the Hosting thread (unknown): an undecided finding is a known gap against a declared gate, not an inability to observe.
- **Applicable, every id decided with both deciders named:** verified, as completeness only. The finding states that adequacy of each decision stays with the CTO and CPO.
- **A decision for an id that is not in the list, or a pattern naming an id that is not in the list:** reported as stale, never as failed, because the list may simply have moved on.
- **Freshness is separate.** `conform` checks the recorded list. It does not re-scan. When the caller supplies a `scan(targets)` function, as `conform` already takes Testing's functions, `conform` compares the fresh ids with the recorded ones and reports ids that appeared or disappeared as unknown until the list is re-recorded. Without it, the finding says plainly that the list was not re-scanned.

This is the N9 rule applied again: the plan existing, or the list being empty, is not evidence that a package complies. A report with no findings means none was found within the scan's stated coverage.

## Draft identifiers (provisional; reserved so C10 and C17 to C22 are untouched)

| Id | Statement |
| --- | --- |
| packaging/F35 | A KAAL package declares a Boundary Check in `test/boundary-check.md`, applicable (targets and command) or not applicable (with a reason). A missing declaration is unknown. |
| packaging/F36 | For an applicable Boundary Check, `conform` reads the finding ids of the recorded list and requires one decision for each, directly or through a pattern that names it, each with a technical decider, a product-impact decider, a reason and a date. A missing decision is failed. References are covered by their origin finding. |
| packaging/F37 | `conform` never judges a decision, ranks a finding or treats an empty list as compliance. Stale decisions are reported, not failed. With a caller-supplied `scan`, ids that appeared or disappeared are unknown until re-recorded. |
| packaging/A24 | One reader of the plan file and one reader of the finding list. The list is read by `id` and `references` only, so Packaging has no dependency on Hosting or on any rule vocabulary. |

Test Case ids T78 to T86 and T93 to T97 are reserved for this Change.

## Test Cases (RED first, then DO)

Fixtures only. No scan runs, no network.

- **T78** Not applicable with a reason: verified. Not applicable with no reason: failed.
- **T79** No `test/boundary-check.md`: unknown. A file with no declaration: unknown.
- **T80** Applicable, finding list missing or unreadable: unknown.
- **T81** Applicable, every id decided with both deciders: verified, and the finding says completeness only.
- **T82** One id with no decision: failed, naming the id. A decision missing a decider, a reason or a date: failed.
- **T83** A pattern entry covers the ids it names, and an id it does not name is still undecided. A reference with no entry of its own is not undecided.
- **T84** An empty finding list is not reported as compliant: the finding states that none was found within the stated coverage. A package with the declaration but no recorded list is unknown.
- **T85** A decision for an id absent from the list, and a pattern naming one, is reported stale, not failed.
- **T86** With a caller-supplied `scan`: an id that appeared or disappeared since the recorded list is unknown. Without it, the finding says the list was not re-scanned.
- **T93** Same id, different line digest: the finding is undecided (failed) and the old decision is reported stale. Same id and digest: decided.
- **T94** The recorded list carries no coverage line, or it shows unreadable files: an empty list is unknown, never compliance.
- **T95** A decision without a `class`, or with a class other than `Package` or `Engineering`: failed. `conform` ships nothing and reads no shipped path for the record.
- **T96** On an installed directory, the Boundary Check is reported as not judged here (source-workspace check), and the record is absent from the packed files.
- **T97** The record is never an input of `test/verify.json` and is not in any immutable set: editing a decision changes neither the manifest nor a planned test. A package whose `files` lists `test` wholesale, or the record itself, is reported as shipping it.

## Held, not proposed

- The format of `test/boundary-check.md` beyond the content above. Testing mirrors it in its Plan model.
- Whether the general profile judges any of this. The deciders are KAAL roles, so this is a KAAL-profile finding.
- Any change to F7, N8 or N9, and any new hard dependency.
- Ownership of the decisions themselves: each package owner, with the CTO and CPO. Packaging does not store them centrally.

## Sequencing

This PLAN, then RED (T78 to T86), then DO. It needs Hosting's finding id format only as an opaque string, which `hosting/C100` already states, so it can proceed without waiting for Hosting's DO. Hosting's `hosting/C103` (its two Test Plans) takes the shape from here once Testing has aligned.
