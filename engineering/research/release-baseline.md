# Research: the KAAL package-release baseline, traced to its owners

> Research, not a PLAN. It reports evidence for engineering/C5 (#610, the Owner's comments 6529592861 and 6529734792) and proposes nothing as Engineering's. Each candidate below belongs to the owner named, and each conflict and gap is returned to that owner or to the Owner. Engineering states none of these requirements.

**Two contracts per package** (the Owner, comment 6529734792). The candidates split into a **generic KAAL Package contract**, which Packaging owns and which references Testing's and Hosting's generic semantics without redefining them, and each delivering capability's **specific contract**. Engineering discovers both, runs both on the same installed candidate, and reports them apart (engineering/C5).

| Candidate | Generic (Packaging, referencing) | Specific (each delivering capability) |
| --- | --- | --- |
| F1 identity: name, version, dependencies | What identity a KAAL package has and how it is stated (gap: no packaging/ ID) | Its own name, version and dependencies |
| F2, N1, N2 independent install; no checkout; the installed copy is exercised | That every package conforms: referencing testing/F12 | Its own install case |
| F3 shipped documentation | Which documents, and where (gap; resolves the Operations conflict, C3) | Their content |
| F4, N3 Embedded Test Cases, kept apart from the publisher's | That every package ships them: referencing engineering/C6's placement and testing/F11 | Its cases |
| F5 installed verification command | The entrypoint convention (gap; resolves C2) | Its command's realization |
| F6, N4 result with cause and evidence; truthful reporting | Referencing testing/F12–F14 and testing/C29 (#639); Packaging requires conformance, Testing owns meaning | Its verifier |
| F7 coverage or explicit allocation | That every package ships it: referencing Testing's semantics (gap at Testing) | Its trace |
| F8, N10 publisher clean-install acceptance of the exact candidate | That acceptance runs on the packed candidate | Its acceptance cases; Engineering orchestrates and gates |
| F9, N9 declared platforms; no silent dilution | That every package declares them: referencing Hosting's host compatibility and testing/F47 | Its platform list |
| F10, N7 artifact identity; provenance distinct from consistency | Identity by SHA-256 (packaging/F4 is the primitive), referencing testing/F14 | Its manifest; publication stays the Owner's |
| N5 determinism | Referencing testing/F15, which promises no same outcome (C7) | Its declared applicability |
| N6 no consumer mutation | Referencing testing/F15 | Its case (gap for Core, Graph) |
| N8 runtime dependencies installable | That every package conforms | Its dependencies |

The trace that follows is the evidence for this split. It was read on 2026-10-30, and every ID was read at the line given.

Read-only trace, after `git fetch` on 2026-10-30. Every ID below was read at the line given.

**Sources and status** (short names used in the table)

| Short | Ref : path | Status |
|---|---|---|
| HOS | `origin/kaal/hosting:packages/extensions/kaal-hosting/plan/release/{requirements,architecture,testing}.md` | #629 merged, approved |
| HOS-B | `origin/kaal/hosting:…/kaal-hosting/plan/boundary/requirements.md` (hosting/C13) | #650 merged |
| HOS-R | `origin/kaal/hosting:…/kaal-hosting/plan/reconciliation/requirements.md` | merged on kaal/hosting |
| CORE | `origin/kaal/core:packages/kaal-core/plan/release/*.md` | #622 merged |
| GRA | `origin/claude/project-thread-kt4lcb-graph-release:packages/skills/kaal-graph/plan/release-0.0.1/*.md` | #627 open: **planned, not approved** |
| GRD | `origin/main:packages/kaal-guard/docs/{requirements,testing}.md` (same text on `kaal/guard-release`, sometimes 1 line later) | shipped (published Guard) |
| GRD-E | `origin/main:engineering/guard/{requirements,change}.md`, `.github/workflows/guard-release.yml` | on main |
| TST-C | `origin/kaal/testing:packages/skills/kaal-testing/plan/consumer/requirements.md` (delivered into `payload/Testing.md:45`) | merged on kaal/testing, not on main |
| TST-M | `origin/kaal/testing:…/kaal-testing/plan/model/requirements.md` (C14; DO C15 #630 merged) | merged on kaal/testing |
| TST-V | `origin/claude/testing-c29-verifier-contract:…/kaal-testing/plan/verifiers/requirements.md` | #639 open: **planned, not approved** |
| ENG-L | `origin/kaal/engineering:engineering/lanes/README.md` (C6) | #625 merged (PLAN) |
| ENG-V | `origin/kaal/engineering:engineering/verification/README.md` (C7) | #641 merged (PLAN) |
| ENG-P | `origin/kaal/engineering:engineering/platforms/README.md` (C9) | #648 merged (PLAN) |
| ENG-B | `origin/kaal/engineering:engineering/boundaries/README.md` (C10) | #649 merged (PLAN) |
| PKG | `origin/kaal/packaging:packages/kaal-packaging/{capability/Packaging.md,plan/measurement/requirements.md}` | on kaal/packaging |
| CHG | `origin/claude/project-thread-u13ksf-release:packages/skills/kaal-change/plan/release/requirements.md` | #636 open: **planned, not approved** |

`engineering/README.md` does not exist on `origin/kaal/engineering` (only `lanes/`, `verification/`, `platforms/`, `boundaries/`, `conformance/`, `guard/`, … READMEs).

## 1. Trace table

**Two contracts (the Owner's clarification).** Every KAAL package has two independently authoritative contracts:
- a generic KAAL Package contract, owned by Packaging, which references Testing's and Hosting's generic semantics;
- a specific product contract, owned by the delivering capability.

**Confirmed: Packaging has no generic package contract today.** Its only files on `origin/kaal/packaging`, and on each of the `packaging-c1`, `c2` and `c3` branches, are `capability/Packaging.md` (14 lines: it "measures and describes packages. It decides nothing about them") and `plan/measurement/` (packaging/F1–F6, N1–N6, all about size measurement). `origin/main` has no `packages/kaal-packaging`. Engineering already counts on such a contract: engineering/verification/README:58 says "Not yet stated. Packaging plans it in its own Change".

| Cand. | Authoritative owner (charter) | Generic (Packaging) or specific (delivering capability) | Existing IDs (file:line) | Status |
|---|---|---|---|---|
| **F1** name/version/deps | Packaging (package semantics); each capability for its own name | generic, currently stated per product: candidate for Packaging's generic contract (the actual name, version and dependency values are specific) | hosting/F15 HOS req:7; core/F74 CORE req:61 (+core/A36 arch:24); graph/F8 GRA req:23 (planned); change/F18 CHG req:15 (planned); guard/N6 GRD req:288 | **duplicated** per package; **gap** at Packaging: no packaging/ ID states package-identity semantics (PKG Packaging.md:10–12 only describes/measures) |
| **F2** independent install of packed artifact | each delivering capability; Engineering orchestrates | generic, currently stated per product: candidate for Packaging's generic contract | hosting/F17 HOS req:9 (T24 test:10); core/F72 CORE req:54 (A35 arch:18, T76 test:11); graph/F9 GRA req:24 (T13, planned); change/F25 CHG req:70 (planned); engineering/F7 ENG-V:26 (T12 :75); testing/F9 TST evidence req:29 (evidence counts only from packed tarball) | **duplicated** (consistent) |
| **F3** shipped Intent/Req/Arch/Testing/Operations/Limitations | each capability | generic, currently stated per product: candidate for Packaging's generic contract (each document's content is specific) | guard/F37 GRD req:250; hosting/F18 HOS req:15 (T25); core/F69 + core/N19 CORE req:24, :7 (T74); graph/F5 GRA req:7 (T8, planned); change/F20, F21 CHG req:35, :41 (planned) | **duplicated** + **conflict on Operations** (see §2 C3) |
| **F4** executable Embedded Test Cases | each capability (Embedded Tests: ENG-L:10); Testing for semantics | generic, currently stated per product: candidate for Packaging's generic contract (the delivered-case shape; the cases themselves are specific) | testing/F11 TST-C:14; guard/F31, F39 GRD req:195, :266; hosting/F19 HOS req:16; core/F70 CORE req:32 (A33 arch:5); graph/F7 GRA req:17 (planned); change/F22 CHG req:51 (planned) | **duplicated** (consistent) |
| **F5** installed verification command | Packaging (entrypoint convention, ENG-V:17); each capability realizes | generic, currently stated per product: candidate for Packaging's generic contract | testing/F12 TST-C:16; guard/F32 GRD req:200; hosting/F20 HOS req:17; core/F70, F75 CORE req:32, :38 (A34 arch:9); graph/F6 GRA req:11 (planned); change/F22 CHG req:51 (planned) | **duplicated**; **gap**: Packaging convention "Not yet stated" ENG-V:58; **conflict** on what source `npm test` runs (§2 C2) |
| **F6** verified/failed/cannot verify with cause/evidence | Testing (result semantics); each verifier realizes | generic: Testing owns the semantics (testing/F13, F14) and Packaging references them; the summary line and exit codes are generic, currently stated per product: candidate for Packaging's generic contract | testing/F13, F14 TST-C:18, :20; testing/F44–F46, F49 TST-V:13,14,21,36 (planned); guard/F33, F34, N4 GRD req:205, :217, :286; hosting/F21, F22 HOS req:18, :24; core/F70 CORE req:32 (results only, no cause/evidence); graph/F6 GRA req:11 (planned); change/F22, F24, F29 CHG req:51, :66, :22 (planned) | **duplicated**; **conflict** on tampered file (§2 C1); core/F70 states no cause/evidence/next step (weaker, inferred gap) |
| **F7** requirement→test coverage or explicit allocation | Testing (semantics) / each capability (its trace) | generic, currently stated per product: candidate for Packaging's generic contract (each product's trace is specific) | guard/F38 GRD req:259 (+ testing.md:28–37 allocation table); hosting/F23 HOS req:25 (T28); core/F71 CORE req:45; graph/F5 bullet "every identifier a delivered case cites is defined" GRA req:7 (planned; no allocation stated); change/F20 CHG req:35 (definition only, planned) | **duplicated**; **gap** at Testing: no testing/ ID defines covered/allocated/unverified for a shipped package; Graph and Change state no allocation |
| **F8** publisher clean-install acceptance of the exact candidate | each delivering capability; Engineering orchestrates | generic, currently stated per product: candidate for Packaging's generic contract (Engineering runs it) | core/F72 CORE req:54 (T76); hosting/A9 "Lanes" HOS arch:26 + Limits HOS req:48; graph/F9 GRA req:24 (T13, planned); change/F25 CHG req:70 (planned); engineering/F7 ENG-V:26; Guard: allocation GRD testing.md:35, guard/N9 GRD-E requirements.md:19 | **duplicated**; **conflict** packed vs registry evidence (§2 C5); "exact" (same bytes as published) stated only for Guard (guard-release.yml:6–8) → **gap** elsewhere |
| **F9** declared platforms/runtime | Hosting (host compatibility); each capability declares | generic duty to declare: generic, currently stated per product: candidate for Packaging's generic contract; the declared platforms and runtime are specific (Hosting owns host compatibility) | guard/N1 GRD req:279; hosting/N1 HOS-R req:7; hosting/F19, F20 (Node 24) HOS req:16–17; graph/N6 GRA req:34 (planned); core release plan: none (grep: no platform/Node statement in CORE) | **duplicated** for Guard/Hosting/Graph; **gap** for Core and Change (inferred from grep); no Packaging/Hosting ID requires every package to declare it |
| **F10** repeatable publication + artifact identity | Engineering (producing packages: PKG Packaging.md:12) ; Packaging measures identity | generic (Engineering realizes it); stated only for Guard's workflow, so a candidate for Packaging's generic contract | Guard only: R1 GRD-E change.md:30, guard-release.yml:1–8 (publishes "only a tarball with that SHA-256"); packaging/F1, F4, N1 PKG req:7, :10, :15 (artifact SHA-256 in a measurement record, not publication); publication is Owner-gated: HOS req:46, guard/N6 GRD req:288 | **gap** for every package but Guard; no engineering/ ID |
| **N1** no source checkout for consumer verification | Testing (semantics); each capability | generic: Testing (testing/F12) owns the semantics; generic, currently stated per product: candidate for Packaging's generic contract | testing/F12 TST-C:16; guard/F32 GRD req:200–202; hosting/I6 HOS intent:11, hosting/F19 HOS req:16; core/F70 CORE req:37, core/F75 :40; graph/I4 GRA intent:9 (planned); change/N7 CHG req:11 (planned); engineering/N5 ENG-V:32 (T13 :76) | **duplicated** (consistent) |
| **N2** installed artifact is exercised | Testing; each capability | generic: Testing (testing/F12) owns the semantics; generic, currently stated per product: candidate for Packaging's generic contract | testing/F12 TST-C:16; guard/F31 GRD req:198; hosting/F19 HOS req:16; core/F70 CORE req:32; graph/F7 GRA req:18 (planned); change/F22 CHG req:53 (planned); engineering/T12 ENG-V:75 | **duplicated** (consistent) |
| **N3** publisher vs Embedded tests/evidence distinct | Engineering (placement) + Testing (whose evidence) | generic (Engineering's placement and Testing's testing/F11, F17); generic, currently stated per product: candidate for Packaging's generic contract | ENG-L:9–11 (Engineering/Embedded/External), engineering/F3 ENG-L:19; testing/F11, F17 TST-C:14, :26; guard/F31, F36, F39 GRD req:196, :233, :269; hosting/F20 HOS req:17, hosting/A9 HOS arch:22; core/F71, F75 CORE req:45, :38; graph/F7 GRA req:17 (planned); change/F24 CHG req:66 (planned) | **duplicated** (consistent on separation; source `npm test` content conflicts, §2 C2) |
| **N4** missing/skipped/inapplicable/incomplete reported truthfully | Testing | generic: Testing owns the semantics; generic, currently stated per product: candidate for Packaging's generic contract | testing/F12, F13 TST-C:16, :18; testing/F26, F27 TST-M:20–21; testing/F43, F47, F48 TST-V:7, :28, :30 (planned); guard/F33, F38, F40 GRD req:205, :259, :271; hosting/F21, F25 HOS req:18–21, :27; core/F70, F75 CORE req:32–37, :44; graph/F6 GRA req:16 (planned); change/F22, F23 CHG req:51, :60 (planned); engineering/F14, N7 ENG-B:26, ENG-P:19 | **duplicated**; **conflict** on core's count-only rule (§2 C4) and Change's non-platform applicability (§2 C6) |
| **N5** determinism within declared applicability | Testing (result semantics) | generic: Testing owns it (testing/F15), which conflicts with the candidate; no product states it | testing/F15 TST-C:22 explicitly **does not** promise same outcome (narrowed by testing/C13, TST consumer testing.md:24); testing/N8 TST-M:8 (model pure); guard/N2 GRD req:282 (Guard's verdicts, not its verification); hosting/F20 "can be repeated" HOS req:17; engineering/F9 ENG-P:13–16, engineering/N8 ENG-B:37 (Engineering's comparisons) | **conflict** between candidate wording and testing/F15 (§2 C7); no package states determinism of its verification |
| **N6** no consumer-environment mutation | Testing (testing/F15) ; each capability | generic: Testing (testing/F15) owns the semantics; generic, currently stated per product: candidate for Packaging's generic contract | testing/F15 TST-C:22; guard/F35 GRD req:224; hosting/F24 HOS req:26 (T29); change/N7, F26 CHG req:11, :76 (planned); engineering/N2 ENG-L:20 (lanes don't rewrite package tests) | **duplicated**; **gap** for Core (CORE has no intact-consumer requirement) and Graph (GRA none) |
| **N7** exact-artifact provenance vs consistency evidence | Testing (evidence semantics); Engineering (reporting) | generic: Testing owns the evidence semantics; generic, currently stated per product: candidate for Packaging's generic contract | guard/F34 GRD req:217–222 (+ "Provenance" limit :241); hosting/F22 HOS req:24 + Limits :47; testing/F14 TST-C:20; testing/F31 TST-M:33 (Run provenance); testing/F9 TST evidence req:29; engineering/C7 "incorrect provenance" scenario ENG-V:45; guard/N9 GRD-E requirements.md:19; packaging/F4 PKG req:10 | **duplicated** for Guard/Hosting; **gap** for Core, Graph, Change (none distinguish consistency from provenance; Change only states a digest, CHG req:66) |
| **N8** runtime dependencies installable | each capability; Packaging (inferred) | generic, currently stated per product: candidate for Packaging's generic contract | core/F73 CORE req:60 (T78); graph/F8 GRA req:23 (planned); hosting/F17 HOS req:9 ("runtime dependencies from the registry"); guard/N6 GRD req:288 (no KAAL dependency); change/N6 CHG req:7 (none, planned) | **duplicated** (consistent); no Packaging ID |
| **N9** platform differences tested, no silent dilution | Hosting (boundary suite) + Testing (applicability) + Engineering (parity) | generic: Testing (F47, F48), Hosting (its boundary suite) and Engineering (C9, C10) each own their part; each product's applicability declarations are specific | testing/F47, F48 TST-V:28, :30 (planned); engineering/F9, N6, N7 ENG-P:13, :18, :19; engineering/F12–F16, N9 ENG-B:20–38; hosting/F27–F34, N5 HOS-B:7–40 (`dilution` kind :15); hosting/F25 HOS req:27; guard/F40 GRD req:271; graph/N6 GRA req:34 (planned) | **duplicated** (layered, consistent); **conflict** with Change's applicability (§2 C6) |
| **N10** automated, repeatable release acceptance | Engineering (orchestration, gates) ; each capability's acceptance | generic (Engineering orchestrates); generic, currently stated per product: candidate for Packaging's generic contract | engineering/F7, F8, T12–T15 ENG-V:26, :31, :75–78 (CI run is a separate `.github/` Change :62); core/F72, A35 CORE req:54, arch:18; hosting/A9 lanes HOS arch:26; graph/F9 GRA req:24 (planned); change/F25 CHG req:70 (planned); Guard K6/R1 GRD-E change.md:30 | **duplicated**; **gap**: no engineering/ ID makes release acceptance a gate (C7 lists non-conforming packages, ENG-V:33; gate is Guard's, ENG-V:20) |

## 1a. Per-product statements that would become Packaging-generic

Today each item below is stated separately in each product's release plan. Packaging's generic contract would state it once, citing Testing's and Hosting's semantics where they apply. Each product would keep only its specific values and cases.

| Generic item | Statements today (product release plans) |
|---|---|
| Scoped name, version, public access, runtime dependencies (F1, N8) | hosting/F15 HOS req:7; core/F73, F74 CORE req:60–61; graph/F8 GRA req:23 (planned); guard/N6 GRD req:288; change/F18, N6 CHG req:15, :7 (planned) |
| What ships and what does not; layout of `files` (F3, F4, N3) | hosting/F17, F18, F19 HOS req:9, :15, :16; core/F69, N19, A33 CORE req:24, :7, arch:5; graph/F5, F7, A5 GRA req:7, :17, arch:5 (planned); guard/F31, F37, F39 GRD req:195, :250, :266; change/F18, F20 CHG req:15, :35 (planned) |
| Installed entrypoint `npm test` → `test/verify.mjs`, with `test:publisher` kept apart (F5, N1, N2) | hosting/F20, A9 HOS req:17, arch:22; core/F70, F75, A34 CORE req:32, :38, arch:9; graph/F6, A6 GRA req:11, arch:9 (planned); guard/F32 GRD req:200; change/F22 CHG req:51 (planned) |
| Verifier output: summary line, exit codes 0/1/2, cause and next step, evidence fields (F6). The semantics stay Testing's (testing/F13, F14, F44–F49) | hosting/F21, F22 HOS req:18, :24; guard/F33, F34, N4 GRD req:205, :217, :286; core/F70 CORE req:32; graph/F6 GRA req:11 (planned); change/F22, F24 CHG req:51, :66 (planned) |
| Shipped manifest `test/verify.json`: hashes, cases, coverage, applicability (F7, N4, N7) | hosting/F22, F23, F25 HOS req:24, :25, :27; guard/F34, F38, F40 GRD req:217, :259, :271; graph/F6 GRA req:12 (planned); change/F22, F23 CHG req:53, :60 (planned). Core has no manifest (CORE uses the "Shipped files" list in `docs/operations.md`, req:56) |
| Intact consumer (N6). The semantics stay Testing's (testing/F15) | hosting/F24 HOS req:26; guard/F35 GRD req:224; change/N7, F26 CHG req:11, :76 (planned) |
| Consistency is not provenance (N7) | hosting/F22 and Limits HOS req:24, :47; guard/F34 and its limits GRD req:222, :241 |
| Verifier-only built-ins; no Testing or Guard dependency | hosting/N4 HOS req:41; guard/N13 GRD req:302; graph/F6 GRA req:16 (planned); change/N7 CHG req:11 (planned) |
| Publisher clean-install acceptance of the packed candidate (F2, F8, N10) | core/F72, A35 CORE req:54, arch:18; hosting/F17, A8, A9 HOS req:9, arch:20, :26; graph/F9 GRA req:24 (planned); change/F25 CHG req:70 (planned); Guard allocation GRD testing.md:35 |
| Platform and runtime declaration (F9). The values stay specific | guard/N1 GRD req:279; hosting/N1 HOS-R req:7; graph/N6 GRA req:34 (planned) |
| Publication workflow and artifact identity (F10) | Guard only: R1 GRD-E change.md:30, guard-release.yml:1–8 |

Already generic and owned elsewhere, so Packaging would reference rather than restate:
- Testing: testing/F11–F17 (TST-C), F26–F27 (TST-M) and F43–F49 (TST-V, planned).
- Hosting: hosting/F27–F34 (its boundary suite).
- Engineering's orchestration: engineering/F1–F3, F7–F9, F12–F16.
- hosting/F26 already says the verifier contract is shared and Testing's, so it is not Packaging's.

## 2. Conflicts (exact quotes)

- **C1 Tampered installed file: failed vs cannot verify.**
  - graph/F6, GRA requirements.md:16: "A changed or missing shipped file is failed." (also graph/T12, testing.md:11: "A changed shipped file is failed (1)").
  - hosting/F21, HOS requirements.md:20: "`cannot verify`, exit 2: … the installed files do not match the shipped manifest".
  - guard/F33, GRD requirements.md:212: "the installed files do not match the shipped manifest (guard/F34);" (under `cannot verify`).
  - testing/F43, TST-V requirements.md:10 (planned): "**unknown:** … an installed file changed, removed or added".
  - change/F22, CHG requirements.md:57 (planned): "**unknown** when … the manifest is missing or does not match".
  - core/F70, CORE requirements.md:35 puts "a file is missing" under `cannot verify`. Graph is the outlier, and Graph's PLAN is not approved.
- **C2 What `npm test` runs in the source workspace.**
  - core/F75, CORE requirements.md:39: "**in the source workspace,** `npm test` is comprehensive. It runs every suite the package declares as a `test:<name>` script, the publisher's and the consumer's included".
  - ENG-L README.md:3: "(#625, comment 6510333640, which supersedes the earlier reading that a package's source `npm test` runs every publisher suite …)".
  - hosting/F20, HOS requirements.md:17: "the package's `test` script runs that entry and nothing else. … The publisher's own suite moves to a `test:publisher` script." graph/F6, GRA :11: "`npm test` is the consumer's entry". Engineering defers to the package, ENG-L:25: "core/C29 sets what Core's own `npm test` runs." Packaging owns the convention but has not stated it (ENG-V:58).
  - Related stale reference: core/A34, CORE architecture.md:17: "engineering/C6 (#625) adds a Consumer lane for the installed verdict" vs ENG-L:3: "Consumer verification of the packed artifact … are not part of this Change. They are engineering/C7 (#641)."
- **C3 Where Operations documentation lives.**
  - core/F69, CORE requirements.md:24: ships "`docs/limitations.md`, `docs/operations.md` and `docs/testing.md`"; graph/F5, GRA :7 (planned): "Intent, Requirements, Architecture, Operations, Limitations and Testing".
  - guard/F37, GRD requirements.md:255: "Operations: the README and the Skill." with `docs/` holding "Intent, Requirements, Architecture, Testing and Limitations" (:251).
  - hosting/F18, HOS requirements.md:15: five docs, no operations; "The README keeps the overview, installation, removal and how to verify". change/F21, CHG :41 (planned): "The README states operation".
  - Also: core/F72 and graph/F9 make `docs/operations.md` the shipped-files list; Guard/Hosting use `test/verify.json` hashes for that.
- **C4 Verified on counts vs declared inventory.**
  - core/F70, CORE requirements.md:33: "**verified**, when every delivered loop ran at least one test and none failed" (no declared inventory, no skip/todo rule; CORE testing.md:44 counts "only the tests the files declare").
  - testing/F12, TST-C:17: "a run in which no case failed but fewer cases executed than the product declares is unknown"; testing/F13, :19: "unknown when no case failed but a declared case was skipped, not run or unable to run".
  - Core would not satisfy testing/F43's "a declared case skipped; a declared case marked todo" scenarios (TST-V:10). Inferred: both are merged, but Core's verifier has no manifest to declare cases against.
- **C5 Which candidate evidence counts toward a release.**
  - guard/N9, GRD-E engineering/guard/requirements.md:19: "Only `registry` evidence counts toward a Release."
  - hosting/A9, HOS architecture.md:26: "a release candidate is verified on all three hosts before the Owner's go" (packed). core/F72, CORE :54: "installed from its packed tarball". These are pre-publication, packed evidence. Not contradictory within one package, but the baseline must choose (or require both).
- **C6 Applicability: platform-only vs installation-dependent.**
  - testing/F47, TST-V:28 (planned): "A case is not applicable only where the harness itself established … a nonempty platform scope that excludes the platform it ran on, and a nonempty reason." testing/F43, :10: unsupported inapplicability "because the manifest gives no platform scope" is unknown.
  - change/F23, CHG requirements.md:61 (planned): "The manifest declares, for each case, when it applies: always, with Graph installed, or with Graph absent." Both PLANs are open. As written, Change's cases that do not apply because Graph is absent would not conform to testing/F47.
- **C7 Determinism (candidate N5) vs testing/F15.**
  - testing/F15, TST-C:23: "The same installation does not promise the same outcome, since time, network, environment or a case's own nondeterminism may differ between runs, so each result stands for its own run only." Narrowed on the Owner's review (TST consumer testing.md:24). A baseline "determinism" item would have to be limited to the procedure and the reported evidence, or Testing would have to amend F15.
- **Minor, inferred:** guard/F40 GRD req:275 makes an identifier covered only by not-applicable cases `cannot verify` unless declared N/A for the identifier. hosting/F25 HOS req:27 says only that the case "does not keep the run from `verified`". Hosting may be weaker here, depending on how hosting/F23 counts coverage.

## 3. Gaps (no owner states it yet)

- **Package entrypoint convention (F5, and F1/F3 package shape)** → Packaging. ENG-V:58: "Not yet stated. Packaging plans it in its own Change". `kaal/packaging` has only `plan/measurement/`.
- **Package-identity semantics (F1)** → Packaging. Each package names itself (Owner's namespace decision on #622, recorded as core/F74/A36). No packaging/ ID.
- **Repeatable publication + exact-artifact binding (F10, F8 "exact")** → Engineering (Packaging.md:12: "Producing and assembling packages stays Engineering's"). Only Guard's R1 workflow exists. No engineering/ ID for Core/Hosting/Graph/Change/Foundation. Publication itself remains the Owner's decision.
- **Coverage/allocation semantics (F7)** → Testing. Guard/Hosting each define covered/allocated/unverified locally. testing/F43–F49 (planned) do not include coverage scenarios. Graph and Change state no allocation.
- **Release acceptance as an automated gate (N10)** → Engineering (gate evaluation), Guard (gate enforcement per ENG-V:20). C7 reports conformance and keeps a not-ready list. Running in CI is a separate `.github/` Change (ENG-V:62). Nothing makes acceptance block a release.
- **Declared platforms/runtime for every package (F9)** → each capability; Hosting for host compatibility. Core and Change release PLANs state none (from grep). No cross-package rule.
- **Intact consumer (N6) and provenance vs consistency (N7) for Core and Graph** → Core and Graph (Testing's F14/F15 already state the semantics). Their release PLANs have no manifest digest, no intact-consumer check and no provenance statement.
- **Cause/evidence/next step for Core's and Graph's results (F6)** → Core, Graph. testing/F49 (planned) would require them.
- **Missing test entrypoint in source lanes**: engineering/F1 ENG-L:17 runs "`npm test --if-present -w <name>`", so a package with no `test` script is skipped silently in the comprehensive lane. No engineering/ ID states "missing entrypoint is never verified" for lanes. C7's "zero tests" scenario (ENG-V:39) covers installed runs only. (Inferred. Not found in lanes README.)

## 4. Overlaps among the candidates

- **F2 / N1 / N2 / F8**: F2 (it installs on its own) and F8 (the publisher accepts it in a clean install) are the same act seen by consumer and publisher. Every source states them together: core/F72, graph/F9, change/F25, engineering/F7. N1 (no checkout) and N2 (installed copy exercised) are the two halves of testing/F12. Engineering tests them as T13 and T12. Suggest: F2 + N1 + N2 → one consumer item; F8 → publisher item.
- **F5 / F6 / N4**: the command (F5) is defined by its result (F6). N4 is F6's fail-closed rule (testing/F12–F13 are written as one pair). Every package states all three in one requirement (guard/F32–F33, hosting/F20–F21, change/F22).
- **F4 / N3**: placing tests as Embedded is the same decision as keeping them apart from publisher tests (ENG-L:9–11, graph/F7, testing/F11).
- **F7 / N4**: an uncovered identifier is `cannot verify` (guard/F38, hosting/F23), so coverage honesty is part of truthful reporting.
- **N7 / F10 / F6**: provenance (N7) needs the published artifact's identity (F10). The evidence field (F6/testing/F14) carries it. Packaging's SHA-256 record (packaging/F4) is the one existing identity primitive.
- **F9 / N9 / N5**: N9 is enforced across F9's declared platforms. N5's "within declared applicability" relies on N9's applicability (testing/F47). Under testing/F15, N5 can only cover the procedure, not the outcomes.
- **N6 / N2**: both are stated in testing/F15 and guard/F35. Hosting splits them (F19 scratch space, F24 comparison).
- **F3 / F7**: the shipped Testing document carries the coverage trace (guard/F37 "Testing", core/F71).
