# E1 — Ratchet understanding

## CPO mandate — boundaries for Antigravity

Status: draft PLAN; complete it before requesting CPO review. The Owner retains final authority.

Research question: Does access to KAAL improve an otherwise identical agent's explanation of a ratchet in software engineering governance?

Hypothesis: KAAL supplies reusable institutional knowledge that improves correctness, precision and applicability. A null or negative result is equally acceptable.

## Experimental boundaries

- A: blank Antigravity agent, without KAAL access or inherited KAAL context.
- B: Antigravity agent with KAAL available. Pin the KAAL revision and record exactly how it is made available.
- Use the same model, settings, prompt, tool permissions and comparable execution conditions, except for KAAL availability. Isolate sessions and prevent contamination from the coordinating agent, other runs, this PLAN and evaluation rubric.
- Identical prompt: "Explain what a ratchet is in the context of software engineering governance. Explain its purpose, behaviour and limitations. Provide a practical example."
- Establish evaluation criteria and repetition count before collecting results. Assess correctness, distinction from ordinary gates, treatment of inherited violations, control type versus strategy, practical applicability, grounding and efficiency where measurable. Do not reward KAAL terminology alone.
- Preserve raw outputs, provenance, execution conditions, deviations and limitations. Blind evaluation where feasible; disclose any inability to blind or isolate.
- Research only. No changes to KAAL capabilities, controls, workflows or rulesets; no bypass of repository governance. Use disposable isolated environments for runs.

## Instructions to Antigravity

1. PLAN: read the repository guidance and current Research capability material. Complete this draft with methodology, setup, isolation, evidence format, scoring, repetition, stopping conditions and limitations. Resolve any conflict with current repository conventions by raising it for CPO decision, not by changing the conventions. Mark this PR ready and request CPO review. Do not execute before acceptance.
2. DO: after PLAN acceptance, execute the approved protocol. Record execution in do.md and retain raw evidence under evidence/. Raise a separate DO PR for CPO review. Do not proceed until accepted.
3. CHECK: compare results against the approved rubric, including counterevidence and uncertainty. Record in check.md; raise a separate CHECK PR for CPO review. Do not proceed until accepted.
4. ACT: record conclusions, lessons and proposed next experiments or product changes in act.md. Raise a separate ACT PR for CPO review. Recommendations are not implementation authorization.

Use the experiment collector and existing repository execution/PR conventions. Each stage must be independently reviewable; report blockers instead of bypassing gates. CPO reviews each stage; the Owner retains final decision authority. Antigravity owns the detailed methodology and execution.

## PLAN completion

PLAN status: revised per CPO review (Rev 2) — ready for CPO re-review (no E1 experimental runs executed; no experimental results included).

Frozen pre-execution artifacts in this directory (digests computed with `@kaihacksai/kaal-foundation` via `node packages/kaal-foundation/bin/kaal-foundation.mjs sha256`):

- `prompt.txt` — verbatim subject prompt (`980505144df299fb524e3de1e678fc2cb2a7bc79cc8049af90b6332464993008`)
- `key.md` — revised two-track evaluation key & scoring rubric separating general domain-standard ratchet understanding (`G1`–`G6`) from KAAL governance-model alignment (`K1`–`K5`), anti-jargon neutrality contract, and blinded judge protocol (`ce927764377623bc1ae5f0595dfe76a8205d1e4197a2eb0e38e26208758a590a`)

---

### 1. Methodology, Two-Track Evaluation, and Outcome Mapping

#### Design Summary
E1 is a two-arm controlled agent trial comparing:

- **Arm A (`blank`, untreated):** Fresh Antigravity agent with genuine preventive isolation from KAAL — zero KAAL files, zero KAAL skills, zero KAAL `<user_rules>`/`AGENTS.md`, and zero attached KAAL repository/context (see Section 3 for isolation evidence and CPO decision).
- **Arm B (`kaal`, treated):** Otherwise identical fresh Antigravity agent with the pinned deployed consumer KAAL surface (`3aafe4f708bd6ce16293d5bd6b6410de8c345449`, Option D-1 accepted by CPO) available.

The design aligns with KAAL Research (`packages/kaal-research/skills/kaal-research/SKILL.md`, `F1`–`F4`), follows the four-stage experiment lifecycle (`plan.md` → `do.md` → `check.md` → `act.md`), and will emit a companion `kaal-research`-conforming rehearsal record (`research/RH2`) in CHECK per CPO disposition C-1.

#### Separate Reporting of Two Outcomes (Per CPO Second Correction)
Evaluation and reporting strictly preserve two separate outcomes — **never** collapsed into a single blended total:

1. **Outcome 1 — General Domain-Standard Ratchet Understanding (`Track 1: G1`–`G6`, max 18):** Measures whether the explanation is accurate, clear, operationally useful, and well-grounded under general software engineering governance standards. A strong answer that has never seen KAAL and adopts none of KAAL's specific design choices (such as mandatory retirement at zero, fail-closed `UNKNOWN` semantics, or KAAL's four-type control taxonomy) can score **18/18 (3/3 on every dimension)**.
2. **Outcome 2 — Alignment with KAAL's Governance Model (`Track 2: K1`–`K5`, max 15):** Separately measures whether the explanation expresses KAAL's specific governance design choices (`kaal-controls`: control type vs strategy separation, strict accepted-state provenance and stale-allowance removal, fail-closed uncertainty, mandatory retirement at zero, removable filter separation and mode-scoped epistemic claims), scored strictly on conceptual substance with zero points for KAAL terminology alone.

#### What Each Outcome Pattern Would Inform
Recommendations from E1 are research findings, never implementation authorization; the Owner retains final authority.

- **Higher Track 1 + Higher Track 2 in Arm B (with verified KAAL opening):** Indicates KAAL both strengthens general software engineering explanation quality and transmits KAAL's specific governance design principles; motivates follow-on applied tasks (design/review/implementation) and multi-model replication.
- **Comparable Track 1 + Higher Track 2 in Arm B:** Indicates base Antigravity already provides strong general domain-standard explanations, while KAAL specifically shifts the agent toward KAAL's governance design choices (control-type/strategy clarity, strict provenance, fail-closed semantics, zero-exit lifecycle, removable filter architecture).
- **Comparable Track 1 + Comparable Track 2 (Null / Inconclusive):**
  - If Arm B rarely or never opens `kaal-controls` (`exposure: delivered` rather than `opened`), surfaces a **Skill discoverability finding** (notably, `packages/kaal-controls/skills/kaal-controls/SKILL.md` frontmatter `description` does not currently contain "ratchet" or "baseline").
  - If Arm B opens `kaal-controls` yet shows no separation on either track, indicates the current Skill wording did not alter responses on this prompt.
- **Lower Track 1 in Arm B (Unfavourable):** Surfaces a concrete harm mode (e.g., unexplained KAAL-internal jargon, narrowed practical applicability, or verbosity degrading clarity) for future Skill authoring consideration.

#### Claim Scope Discipline (Per CPO Disposition C-5 & `kaal-research` F4)
- **Primary outcome / verdict scope:** **`comparison`** (whether and how Arm A and Arm B differed on Track 1 and Track 2 across the observed runs), as accepted by the CPO under C-5.
- **No overstated causality:** `effect: yes` will **not** be claimed where `kaal-research` F4 prerequisites are unmet (including pre-existing KAAL authoring prior to key creation, or any arm/run lacking verified `exposure: opened`, genuine Arm A isolation, or blind scoring). Every claim carries an explicit scope (`description`, `comparison`, `effect`), disposition (`yes`, `partly`, `no`), and mandatory `not-shown` whenever not `yes`.

---

### 2. Pinned KAAL Revision and Delivered Consumer Surface (C-4 Accepted: Option D-1)

#### Pinned KAAL Revision
- **Repository:** `Kai-Hacks-AI/KAAL`
- **Pinned commit SHA:** `3aafe4f708bd6ce16293d5bd6b6410de8c345449` (`origin/main` and `origin/kaal/research/ratchet-understanding` base: `PROMOTION: engineering codeql-gate (#2388)`).
- **Relevant KAAL capabilities at this commit:** `kaal-controls` through `d3c7c77` (`PROMOTION: controls ratchet-strategy (#2366)`), `kaal-research` through `91f40dd` (`PROMOTION: research rehearsal-method (#2360)`), and all 14 package Agent Skills.
- **Zero E1 leakage at pinned commit:** `3aafe4f708bd6ce16293d5bd6b6410de8c345449` predates PR #2393 and contains no `engineering/research/experiments/E1-ratchet-understanding/` files.

#### Exact Delivered Consumer Surface (Verbatim from `3aafe4f708bd6ce16293d5bd6b6410de8c345449`)
Extracted deterministically via `git archive 3aafe4f708bd6ce16293d5bd6b6410de8c345449` (no development history, no `engineering/release-management/`, no `00-changes/`, no retros, no test fixtures outside skill folders, and no E1 artifacts):

1. **All 14 KAAL Agent Skills** placed verbatim under `skills/<skill-name>/`:
   - `packages/kaal-architecture/skills/kaal-architecture/` → `skills/kaal-architecture/`
   - `packages/kaal-change/skills/kaal-change/` → `skills/kaal-change/`
   - `packages/kaal-controls/skills/kaal-controls/` → `skills/kaal-controls/`
   - `packages/kaal-engineering/skills/kaal-engineering/` → `skills/kaal-engineering/`
   - `packages/kaal-engineer-skill/skills/kaal-engineer-skill/` → `skills/kaal-engineer-skill/`
   - `packages/kaal-foundation/skills/kaal-foundation/` → `skills/kaal-foundation/`
   - `packages/kaal-graph/skills/kaal-graph/` → `skills/kaal-graph/`
   - `packages/kaal-guard/skills/kaal-guard/` → `skills/kaal-guard/`
   - `packages/kaal-hosting/05-src/skills/kaal-hosting/` → `skills/kaal-hosting/`
   - `packages/kaal-release/skills/kaal-release/` → `skills/kaal-release/`
   - `packages/kaal-research/skills/kaal-research/` → `skills/kaal-research/`
   - `packages/kaal-retro/skills/kaal-retro/` → `skills/kaal-retro/`
   - `packages/kaal-review/skills/kaal-review/` → `skills/kaal-review/`
   - `packages/kaal-testing/skills/kaal-testing/` → `skills/kaal-testing/`
2. **KAAL Engine** (`engineering/core/`) placed verbatim under `.kaal/` (`KAAL-KERNEL.md`, `AGENTS.md`, and `core/*.md`).

#### Explicit Staging Additions (Separately Recorded in `evidence/treatment-manifest.json`)
To expose the deployed consumer surface neutrally without hinting at `kaal-controls` or ratchets, exactly **two** staging files are added (under Option I-A1; zero added under Option I-A2 if native Antigravity skill upload is used):

1. `skills/INDEX.md` — mechanically generated alphabetical table containing **only** each of the 14 skills' exact verbatim YAML `name`, verbatim YAML `description`, and relative path `skills/<name>/SKILL.md`.
2. `AGENTS.md` (root of disposable Arm B workspace) — minimal neutral consumer entrypoint (<= 10 lines) stating: this workspace has the KAAL Engine in `.kaal/` (start with `.kaal/AGENTS.md`) and 14 installed Agent Skills indexed in `skills/INDEX.md`; zero mention of ratchets, controls, or the experiment.

Every file in the delivered Arm B surface is hashed with `@kaihacksai/kaal-foundation` SHA-256 and recorded in `evidence/treatment-manifest.json` with an explicit `"origin"` tag (`"pinned-3aafe4f"` vs `"staging-addition"`) so reviewers can inspect both the verbatim KAAL bytes and the exact staging additions.

---

### 3. Arm A Isolation Investigation, Empirical Evidence, and Feasible Options (C-3 — For CPO Decision)

Per CPO review on C-3, we investigated genuine preventive isolation of Arm A inside this Antigravity environment using documented, sanctioned mechanisms only (no harness tampering or sandbox bypass, and zero E1 prompt execution).

#### Empirical Findings from Non-E1 Harness Diagnostic
A non-E1 environment diagnostic subagent (`harness-isolation-probe`, conversation `ac2cbdf4582eec8abc07506dd491f577`, launched via `define_subagent` with `enable_write_tools: false`, `enable_mcp_tools: false`, `enable_subagent_tools: false`, `Model: inherit`, `Workspace: inherit` — the only workspace mode supported here) was asked strictly about its own inherited session context and available tools without reading any files. Verified observations:

1. **Inherited Active Workspaces:** Every in-VM subagent automatically receives both `/home/antigravity` and `/home/antigravity/Kai-Hacks-AI/KAAL`.
2. **Automatically Injected `<user_rules>`:** Every in-VM subagent automatically receives `/home/antigravity/Kai-Hacks-AI/KAAL/AGENTS.md` in its system context (explicitly stating *"This repository is governed by KAAL"*, pointing to `engineering/core/AGENTS.md`, `packages/`, `engineering/`, and `@kaihacksai/kaal-foundation`).
3. **Inherited `<project_resources>`:** Every in-VM subagent automatically sees `[github/repo] Kai-Hacks-AI/KAAL (https://github.com/Kai-Hacks-AI/KAAL) -> /home/antigravity/Kai-Hacks-AI/KAAL`.
4. **Unrestricted Read Tool Path & Missing Discovery Tools:** The read-only subagent tool list is `send_message`, `view_file`, `generate_image`, `list_skills`, `lookup_skill`, `lookup_skills`, `get_skill_resources`. `view_file` accepts any absolute path in the VM (including `/home/antigravity/Kai-Hacks-AI/KAAL/...`), so filesystem access to KAAL cannot be preventively blocked per subagent; meanwhile, without write/shell tools, a workspace-staged Arm B subagent would have no directory-listing or search tool.
5. **No On-Disk Subagent Transcripts in This Devbox:** `manage_subagents list` returned **no** `transcript` URI for `ac2cbdf4582eec8abc07506dd491f577`, and `/home/antigravity/.gemini/jetski/brain/` contains **no** `transcript.jsonl` or `transcript_full.jsonl` files. Consequently, in-VM subagents lack even detective post-run transcript auditing and cannot yield trace-verified `exposure: opened` excerpts.
6. **No In-VM Standalone Antigravity Runtime:** The VM hosts only standard developer toolchains and plugin CLIs (`/opt/antigravity/bin`: `gh`, Google Workspace CLIs); the Antigravity agent loop and LLM inference run host-side outside the VM with no in-VM Antigravity CLI or model API credentials. Local Docker/chroot containers therefore cannot host an independent Antigravity agent.

#### Conclusion on In-VM Arm A Isolation
**Genuine preventive isolation of Arm A from KAAL is provably unavailable via in-VM subagents launched from this KAAL-attached Antigravity session.** Running Arm A as an in-VM subagent violates the blank-agent boundary (inherited KAAL `AGENTS.md`, inherited KAAL project resource, unrestricted `view_file` access to KAAL, and no on-disk transcript log). Per the CPO's instruction (*"Do not silently weaken the blank condition"*), in-VM Arm A execution is **rejected** and we return the following feasible options for CPO decision before DO:

| Option | Arm A (`blank`) | Arm B (`kaal`, pinned `3aafe4f`) | Genuine Arm A Isolation? | Model & Platform Parity? | Exposure Trace Verification? | Key Trade-Off |
| --- | --- | --- | --- | --- | --- | --- |
| **I-A1 (Recommended)** | 5 fresh standalone Antigravity conversations with **no repository, no project, and no KAAL skills attached** | 5 fresh standalone Antigravity conversations attached **only** to a clean disposable workspace/repo holding the pinned D-1 consumer KAAL surface (exact 14 Skills + `.kaal/` + 2 staging index files; zero `engineering/` or E1 files) | **Yes (preventive):** zero KAAL files, zero `AGENTS.md`, zero KAAL project resources, zero KAAL skills | **Yes:** both arms run as identical standalone top-level Antigravity sessions with the same model, default settings, and verbatim `prompt.txt`; supports interleaved order (`a1, b1, …`) | **Yes:** operator exports conversation tool-call logs / opened-file excerpts alongside each Arm B raw output | Requires external operator (CPO/Owner or authorized external Antigravity runner outside this KAAL project) to run the 10 isolated conversations and hand raw outputs + traces into DO. (This agent can produce the deterministic D-1 staging bundle/recipe for the disposable Arm B workspace once authorized.) |
| **I-A2 (Alternative)** | 5 fresh zero-repo standalone Antigravity conversations with **zero KAAL skills installed** | 5 fresh zero-repo standalone Antigravity conversations with the 14 pinned KAAL Skills (`3aafe4f`) uploaded to Antigravity's native Skills interface (`list_skills`/`lookup_skill`/`get_skill_resources`) | **Yes (preventive)** provided Arm A completes before skills are installed (or uses a separate non-KAAL profile) | **High:** neither arm attaches a repo; exact native Antigravity Skills discovery without staging `AGENTS.md`/`INDEX.md` | **Yes:** operator exports `lookup_skill` / `get_skill_resources` call traces for Arm B | If Antigravity custom skills are account-global, runs must execute in a sequential block (all 5 Arm A before installing skills for Arm B) rather than interleaved, adding a temporal-order limitation; also delivers Skills only without `.kaal/` Engine files. |
| **I-B (Not Recommended — Hybrid)** | 5 operator-run standalone zero-repo Antigravity conversations | 5 in-VM subagents in this KAAL-attached VM | Yes for Arm A | **No:** mixes standalone top-level Antigravity (A) with KAAL-mounted subagent inheriting root `AGENTS.md` and different tool surface (B) | **No for Arm B:** no on-disk subagent transcript available in devbox | Breaks execution-condition comparability and loses verifiable Arm B exposure traces. Documented only so it can be explicitly rejected. |
| **I-C (Ruled Out)** | 5 in-VM subagents in this VM | 5 in-VM subagents in this VM | **No** (empirically disproved above) | Same subagent harness, but Arm A is not blank | **No** (no on-disk transcripts) | Violates CPO blank-condition boundary. Included only as empirical record of why in-VM execution is blocked. |

#### Exact Operator Execution Protocol Under Recommended Option I-A1 (Zero Leakage, Single Turn)
If CPO approves **Option I-A1**, all 10 conversations are executed **outside this KAAL project's scope** on the **same Antigravity runtime** (either **all 10 in Antigravity Cloud** or **all 10 in Antigravity Local**, never mixed across arms), with identical model and default settings:

- **Workspace count (only 1 disposable Arm B bundle — not 5 repos):**
  - **Local realization (simplest, 100% symmetric):**
    - **Arm A (`a1`–`a5`):** 1 empty local folder (`e1-blank/`, 0 files, no KAAL skills). Open 5 brand-new conversations against `e1-blank/`.
    - **Arm B (`b1`–`b5`):** 1 local folder (`e1-kaal-d1/`) holding *only* the unpacked D-1 consumer bundle from `3aafe4f708bd6ce16293d5bd6b6410de8c345449`, set read-only (`chmod -R a-w e1-kaal-d1`) or verified unmodified between runs. Open 5 brand-new conversations against `e1-kaal-d1/`.
  - **Cloud realization:**
    - **Arm A (`a1`–`a5`):** 5 fresh standalone conversations outside any KAAL project with **no repository** attached (or attached to 1 empty disposable repository with 0 files).
    - **Arm B (`b1`–`b5`):** 1 single disposable private repository containing *only* the pinned D-1 consumer bundle (never `Kai-Hacks-AI/KAAL`), mounted in a separate disposable non-KAAL project. Open 5 brand-new conversations against that single repo — Cloud provisions a fresh ephemeral VM clone per conversation, isolating `b1`–`b5` automatically. Delete/detach the disposable repo after DO is archived.

- **Execution and handoff steps (after PLAN approval):**
  1. This agent generates the deterministic D-1 staging bundle/recipe from `git archive 3aafe4f708bd6ce16293d5bd6b6410de8c345449` (exact 14 Skills + `.kaal/` + neutral `AGENTS.md` + `skills/INDEX.md`) and computes `evidence/treatment-manifest.json` using `@kaihacksai/kaal-foundation`.
  2. The operator mounts that single D-1 bundle in the clean disposable Arm B folder/repo (never `Kai-Hacks-AI/KAAL`, never containing `E1-ratchet-understanding/`).
  3. Using the **same Antigravity runtime, model, and default settings** (recorded explicitly in `evidence/provenance.json`), the operator executes 10 fresh single-turn conversations in interleaved order (`a1, b1, a2, b2, a3, b3, a4, b4, a5, b5`), pasting the exact byte-identical contents of `prompt.txt` with no follow-up turns or hints.
  4. For each run, the operator hands back into this thread: (a) verbatim raw assistant response (`raw/<id>.md`), (b) session metadata (runtime cloud/local, exact model name/version, settings, workspace state, timestamps/durations where visible), and (c) exported tool-call trace/excerpts (confirming zero KAAL reads in Arm A and verifying `opened` vs `delivered` vs `unchecked` exposure in Arm B).
  5. This agent ingests all verbatim artifacts into `evidence/`, verifies every SHA-256 digest with `@kaihacksai/kaal-foundation`, checks stopping/contamination rules, writes `do.md`, and raises the DO PR against `kaal/research/ratchet-understanding` for CPO review.

---

### 4. Repetition Count and Execution Order

- **Planned repetitions:** **`n = 5` independent runs per arm** (`10` runs total: `a1`–`a5` and `b1`–`b5`).
- **Execution order:** Interleaved (`a1, b1, a2, b2, a3, b3, a4, b4, a5, b5`) under Option I-A1 (or disclosed sequential A-then-B block if CPO selects Option I-A2 with account-global skills).
- **What `n = 5` per arm can and cannot show (`n-shows`, no invented threshold):**
  - *Can show:* Whether consistent patterns, omissions, or traps appear across repeated independent runs on Track 1 (general understanding) and Track 2 (KAAL governance alignment); whether Arm B reliably discovers and opens KAAL Skills without hints; within-arm variance; and whether a consistent directional difference is visible in these runs.
  - *Cannot show:* Statistically powered effect sizes, population rates, p-values, or generalization beyond this model, single prompt, and KAAL revision. No arbitrary pass/fail score threshold is invented; CHECK reports the full per-run, per-dimension distributions for Track 1 and Track 2 separately, alongside qualitative quotes and counterevidence.

---

### 5. Evidence Format and Provenance

All DO and CHECK artifacts live inside `engineering/research/experiments/E1-ratchet-understanding/`. Every evidence file is hashed with `@kaihacksai/kaal-foundation` SHA-256 (`node packages/kaal-foundation/bin/kaal-foundation.mjs sha256`) and listed in `evidence/manifest.json`.

#### Planned Directory Layout (Populated in DO and CHECK — Not Present in PLAN)
```text
engineering/research/experiments/E1-ratchet-understanding/
├── plan.md                          # PLAN (this file; frozen upon PLAN acceptance)
├── prompt.txt                       # Frozen verbatim prompt (PLAN)
├── key.md                           # Frozen two-track key & rubric (PLAN, Rev 2)
├── do.md                            # DO execution record, provenance, deviations (DO PR)
├── check.md                         # CHECK blinded Track 1 + Track 2 analysis & counterevidence (CHECK PR)
├── RH2.md                           # Companion kaal-research rehearsal record (id: research/RH2; CHECK PR)
├── act.md                           # ACT conclusions, lessons, proposed next steps (ACT PR)
└── evidence/
    ├── manifest.json                # Relative paths + kaal-foundation SHA-256 of all evidence files
    ├── provenance.json              # Model, settings, isolation option, timestamps, pinned SHA, key/treatment times
    ├── treatment-manifest.json      # Exact file list + SHA-256 + origin ("pinned-3aafe4f" vs "staging-addition")
    ├── arm-mapping.json             # Run IDs (a1..a5, b1..b5) -> arm, session provenance, timestamps, exposure
    ├── raw/
    │   ├── a1.md ... a5.md          # Verbatim raw outputs from Arm A
    │   └── b1.md ... b5.md          # Verbatim raw outputs from Arm B
    ├── excerpts/
    │   ├── a1.audit.txt ... a5.audit.txt       # Session/isolation provenance & trace verification for Arm A
    │   └── b1.excerpt.txt ... b5.excerpt.txt   # Verbatim tool-call trace excerpts (verifying opened vs delivered)
    ├── blinded/                     # Added in CHECK PR
    │   ├── blind-mapping.json       # Shuffled labels s01..s10 -> a1..b5 (withheld from judges)
    │   ├── packet-raw.md            # Shuffled s01..s10 verbatim responses handed to Judges 1 & 2
    │   ├── judge-1-scores.json      # Independent blinded Judge 1 (separate Track 1 & Track 2 scores + quotes)
    │   ├── judge-2-scores.json      # Independent blinded Judge 2 (separate Track 1 & Track 2 scores + quotes)
    │   ├── packet-redacted.md       # Conditional minimally de-identified packet (if explicit KAAL cues appear)
    │   ├── redaction.diff           # Exact diff between packet-raw.md and packet-redacted.md
    │   └── judge-3-scores.json      # Conditional Judge 3 scores on packet-redacted.md
    └── metrics.json                 # Deterministic Track 3 metrics (M1..M4)
```

In CHECK, `RH2.md` (`id: research/RH2`, verified unused across `packages/`, `engineering/`, open PRs, and remote branches at PLAN Rev 2; re-verified against `main` before CHECK) will be validated for form using `packages/kaal-research/skills/kaal-research/scripts/judge-rehearsal.mjs` and `find-rehearsals.mjs`.

---

### 6. Scoring and Blinded Evaluation Protocol

Full criteria, conceptual traps (`GT1`–`GT4`), 0–3 anchor descriptors, anti-jargon neutrality rules, and judge instructions are frozen in `key.md` (`ce927764377623bc1ae5f0595dfe76a8205d1e4197a2eb0e38e26208758a590a`). Summary:

- **Track 1 — General Domain-Standard Ratchet Understanding (0–3 each, max 18; reported separately):**
  - `G1` Core correctness (purpose & monotonic non-regression)
  - `G2` Distinction from ordinary gates and passive checks
  - `G3` Treatment of inherited violations (baseline allowance, tightening, integrity/design trade-offs)
  - `G4` Practical applicability & concrete example
  - `G5` Grounding, precision & general limitations
  - `G6` Efficiency — qualitative signal-to-noise & clarity
- **Track 2 — Alignment with KAAL's Governance Model (0–3 each, max 15; reported separately, never summed with Track 1):**
  - `K1` Control type versus strategy / mode
  - `K2` Strict accepted-state provenance, monotonicity & stale-allowance discipline
  - `K3` Fail-closed uncertainty handling (`UNKNOWN` blocks)
  - `K4` Temporary lifecycle & mandatory retirement at zero
  - `K5` Removable filter architecture & mode-scoped epistemic claims
- **Track 3 — Measurable Efficiency Metrics (`M1`–`M4`, deterministic outside judges):**
  - `M1` Output word count & UTF-8 byte length; `M2` Tool call count; `M3` Wall-clock duration; `M4` Token/turn count where exposed.
- **Blinded judging (executed in CHECK only):**
  - Shuffled neutral labels `s01`–`s10` mapped in `evidence/blind-mapping.json` (withheld from all judges).
  - **Two independent fresh judge sessions** (`Judge 1`, `Judge 2`) score `packet-raw.md` against frozen `key.md`, returning separate Track 1 (`G1`–`G6`) and Track 2 (`K1`–`K5`) integer scores, verbatim evidence quotes/omissions, traps observed, counterevidence, and an explicit **blinding check** (`guessed-arm` + triggering cues).
  - **Conditional de-identification sensitivity pass (`Judge 3`):** Triggered automatically if any response contains explicit KAAL brand/file identifiers (`KAAL`, `RATCHETS`, `judge-mode`, `kaal-controls`, `modes.md`, `F34`–`F37`), replacing only explicit identifiers with neutral placeholders (exact diff retained in `evidence/blinded/redaction.diff`) to test whether explicit brand cues shifted either Track 1 or Track 2 scores.
  - **No silent reconciliation:** All inter-judge disagreements, blinding-guess accuracy, counterevidence, and Track 1 vs Track 2 divergences are reported verbatim in `check.md`.

---

### 7. Stopping Conditions

1. **Normal completion:** All 10 runs (`a1`–`a5`, `b1`–`b5`) complete under the CPO-approved isolation option with verbatim raw outputs, provenance, and trace audits archived. Strictly **no optional stopping or post-hoc extension**: `n` stays fixed at 5 per arm.
2. **Contamination stop / escalation:**
   - If any Arm A session has any KAAL repository, KAAL `AGENTS.md`, or KAAL skill attached/loaded, **halt DO immediately** and escalate to the CPO.
   - If any Arm B session accesses `engineering/research/experiments/E1-ratchet-understanding/` (this PLAN or `key.md`) or non-D-1 development repo files, **halt DO immediately** and escalate.
   - Any contaminated run is never silently discarded or replaced; it is preserved in raw evidence, flagged, and reported.
3. **Comparability or provenance failure stop:** If identical model/settings cannot be maintained across all 10 runs, or if provenance/raw outputs cannot be captured intact, halt DO, preserve partial evidence, and report the blocker to the CPO.
4. **Governance boundary stop:** Any circumstance requiring changes to KAAL capabilities, controls, workflows, or rulesets, or bypassing repository gates, is an immediate hard stop and escalation.

---

### 8. Limitations and Threats to Validity (Disclosed Upfront)

1. **Operator mediation under Option I-A1 / I-A2:** Genuine preventive isolation of Arm A requires executing the 10 standalone Antigravity conversations outside this KAAL-attached VM; provenance accuracy therefore relies on disciplined operator capture of verbatim outputs, session settings, and exported tool traces.
2. **Workspace-attachment bundling under Option I-A1:** Arm B has a disposable D-1 KAAL workspace attached while Arm A has no repository attached, and two minimal staging index files (`AGENTS.md`, `skills/INDEX.md`) expose the 14 skills cleanly. Both are recorded explicitly in `evidence/treatment-manifest.json` as part of the delivered treatment.
3. **Historical order of KAAL authoring vs key freezing (`kaal-research` F3/F4):** KAAL's `kaal-controls` docs (`3aafe4f`) existed before `key.md` was written. Separating Track 1 (general domain-standard understanding) from Track 2 (KAAL governance alignment) mitigates rubric bias against blank answers, and freezing `key.md` before DO prevents post-hoc tailoring — but strict F4 `key-frozen < treatment-created` causality is still unmet, so `comparison` remains the primary verdict scope and `effect: yes` is not claimed.
4. **Imperfect blinding due to distinctive content cues:** Even under shuffled labels and conditional brand redaction, KAAL-influenced answers may be recognizable by structure or specific governance concepts. Judge blinding-guess accuracy is measured and reported verbatim.
5. **Single-model, single-prompt, single-turn scope and small `n = 5`:** Results apply only to the observed Antigravity model, this single explanatory prompt, and KAAL at `3aafe4f708bd6ce16293d5bd6b6410de8c345449`; they surface consistent patterns rather than statistical rates, and explanation quality does not establish implementation/review effectiveness.
6. **Same-platform judges:** Blinded judges run in fresh Antigravity sessions sharing the underlying model family (potential self-preference bias); all raw outputs and verbatim scoring quotes are preserved for independent CPO/Owner audit.

---

### 9. CPO Dispositions and Remaining Decision Before DO

No existing repository conventions, capabilities, controls, workflows, or rulesets are changed by this PLAN.

| ID | Topic | Status | Disposition / Action Needed |
| --- | --- | --- | --- |
| **C-1** | Experiment home & companion `kaal-research` record | **Accepted by CPO** | Keep all E1 artifacts under `engineering/research/experiments/E1-ratchet-understanding/`; emit companion rehearsal record `RH2.md` with `id: research/RH2` in CHECK (not Controls). Availability of `research/RH2` verified unused across `packages/`, `engineering/`, open PRs, and remote branches as of PLAN Rev 2 (re-verified at CHECK). |
| **C-2** | Four-PR stage flow (`PLAN`/`DO`/`CHECK`/`ACT`) | **Accepted by CPO** | Four separate stage PRs into `kaal/research/ratchet-understanding`, awaiting CPO acceptance between stages; no fabricated Change ID (`C<n>`) or capability retro; promotion to `main` is a separate decision after ACT. |
| **C-3** | **Genuine Arm A isolation** | **Open — CPO Decision Required** | In-VM subagents empirically proven unable to isolate Arm A (`ac2cbdf4582eec8abc07506dd491f577`: inherited KAAL workspace, root `AGENTS.md`, `<project_resources>`, unrestricted `view_file`, no on-disk transcripts). **Approve Option I-A1 (recommended: 10 operator-run standalone Antigravity conversations, blank zero-repo Arm A vs disposable D-1 consumer KAAL workspace Arm B, interleaved)** or **Option I-A2 (zero-repo standalone conversations with native KAAL Skills upload, sequential block if skills are account-global)**. |
| **C-4** | Arm B KAAL delivery surface (D-1) | **Accepted by CPO** | Pinned deployed consumer surface at `3aafe4f708bd6ce16293d5bd6b6410de8c345449` (all 14 Skills + `.kaal/` Engine, excluding development repo), with exact delivered files and the 2 staging additions (`AGENTS.md`, `skills/INDEX.md`) tagged separately in `evidence/treatment-manifest.json`. |
| **C-5** | Primary outcome & claim scope | **Accepted by CPO** | `comparison` is the primary outcome/verdict scope; `effect: yes` will not be claimed where `kaal-research` F4 prerequisites are unmet. |
| **R-2** | Two-track rubric separation | **Revised — CPO Re-Review** | `key.md` (Rev 2, SHA-256 `ce927764377623bc1ae5f0595dfe76a8205d1e4197a2eb0e38e26208758a590a`) separates Track 1 (`G1`–`G6` general understanding; 18/18 achievable without KAAL design choices) from Track 2 (`K1`–`K5` KAAL governance alignment), preserving separate scores and reporting both outcomes independently. |

---

### 10. Readiness Checklist Before DO Execution

DO will **not** begin until:
1. All required CI checks on PR #2393 are green on the revised head commit.
2. The CPO approves this revised PLAN (including C-3 isolation option selection — Option I-A1 or I-A2 — and acceptance of frozen `key.md` Rev 2) and PR #2393 is accepted/merged into `kaal/research/ratchet-understanding`.
3. `node packages/kaal-foundation/bin/kaal-foundation.mjs verify` returns `verified` (exit 0) before any DO manifest digest is recorded.


