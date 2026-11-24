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

PLAN status: ready for CPO review (no experimental runs executed; no results included).

Frozen pre-execution artifacts in this directory (digests computed with `@kaihacksai/kaal-foundation` via `node packages/kaal-foundation/bin/kaal-foundation.mjs sha256`):

- `prompt.txt` — verbatim subject prompt (`980505144df299fb524e3de1e678fc2cb2a7bc79cc8049af90b6332464993008`)
- `key.md` — domain-neutral evaluation key, 7-dimension scoring rubric, anti-jargon contract, and blinded judge protocol (`28684c96dd5e68535498a46f18d46d32eef7472040d0090a34fe5a548323c796`)

---

### 1. Methodology and Outcome Mapping

#### Design Summary
E1 is a two-arm controlled agent trial comparing:

- **Arm A (`blank`, untreated):** Fresh Antigravity subagent with an empty disposable workspace and no KAAL access.
- **Arm B (`kaal`, treated):** Otherwise identical fresh Antigravity subagent with pinned KAAL available in its disposable workspace.

The design aligns with KAAL Research (`packages/kaal-research/skills/kaal-research/SKILL.md`, `F1`–`F4`) while respecting the four-stage experiment lifecycle (`plan.md` → `do.md` → `check.md` → `act.md`) mandated above.

#### What Each Outcome Would Inform
Recommendations from E1 are research findings, never implementation authorization; the Owner retains final authority.

- **Favourable (Arm B consistently outperforms Arm A on governance precision, distinction from ordinary gates, inherited-violation lifecycle, type-vs-strategy clarity, or epistemic grounding, with verified KAAL opening):** Supports the hypothesis that KAAL's `kaal-controls` knowledge improves explanation quality beyond base model knowledge; motivates follow-on applied experiments (e.g., designing/reviewing a ratcheted control in a real repository) and multi-model replication.
- **Null or Inconclusive (comparable scores across arms, mixed directionality, high within-arm variance, or Arm B rarely/never opens KAAL):**
  - If Arm B receives KAAL (`delivered`) but rarely opens `kaal-controls` (`opened`), E1 identifies a **Skill discoverability finding** (notably, `packages/kaal-controls/skills/kaal-controls/SKILL.md` frontmatter `description` does not currently contain the word "ratchet" or "baseline").
  - If Arm B opens `kaal-controls` yet performs comparably to Arm A, E1 indicates base model knowledge already matches KAAL's conceptual guidance for this explanatory prompt, pointing future evaluations toward harder operational/code-review tasks.
- **Unfavourable (Arm B underperforms Arm A — e.g., leaks unexplained KAAL jargon, narrows practical applicability, introduces errors, or degrades signal-to-noise):** Identifies concrete failure modes in how KAAL Skills present portable governance concepts to general-purpose agents.

#### Claim Scope Discipline (Per `kaal-research` F4)
In CHECK, every claim will carry an explicit scope and disposition (`yes`, `partly`, `no`, with mandatory `not-shown` whenever not `yes`):

- `description`: what the observed runs in each arm actually produced.
- `comparison`: whether and how Arm A and Arm B differed across the observed runs.
- `effect`: whether KAAL availability *caused* an observed difference. Under `kaal-research` F4, an `effect` claim may be marked `yes` only when untreated and treated runs exist, scoring is blind, every treated run relied upon has trace-verified `exposure: opened`, and the key-freezing and isolation conditions hold (see Section 8 and Decision C-5 for honest scope bounds).

---

### 2. Experimental Setup and Treatment Specification

#### Pinned KAAL Revision
- **Repository:** `Kai-Hacks-AI/KAAL`
- **Pinned commit SHA:** `3aafe4f708bd6ce16293d5bd6b6410de8c345449` (`origin/main` and `origin/kaal/research/ratchet-understanding` base at PLAN completion: `PROMOTION: engineering codeql-gate (#2388)`).
- **Relevant KAAL capabilities present at this commit:** `kaal-controls` through `d3c7c77` (`PROMOTION: controls ratchet-strategy (#2366)`: `I15`, `F34`–`F37`, `SKILL.md`, `references/modes.md`, `scripts/judge-mode.mjs`), `kaal-research` through `91f40dd` (`PROMOTION: research rehearsal-method (#2360)`), and all 14 package Agent Skills.
- **Zero E1 leakage at pinned commit:** Commit `3aafe4f708bd6ce16293d5bd6b6410de8c345449` predates PR #2393 and contains no `engineering/research/experiments/E1-ratchet-understanding/` directory.

#### Arm B Delivery Mechanism (Recommended: Option D-1 — Deployed Consumer KAAL Surface)
For each Arm B run (`b1`–`b5`), a fresh disposable directory `/tmp/e1-runs/<run-id>/workspace/` is materialized deterministically from `git archive 3aafe4f708bd6ce16293d5bd6b6410de8c345449` containing the **consumer-facing deployed KAAL surface** (matching `engineering/MOVE.md`'s separation between `engineering/` development history and deployed KAAL):

1. **All 14 KAAL Agent Skills** extracted verbatim from `3aafe4f708bd6ce16293d5bd6b6410de8c345449` into `workspace/skills/<skill-name>/` (`kaal-architecture`, `kaal-change`, `kaal-controls`, `kaal-engineering`, `kaal-engineer-skill`, `kaal-foundation`, `kaal-graph`, `kaal-guard`, `kaal-hosting`, `kaal-release`, `kaal-research`, `kaal-retro`, `kaal-review`, `kaal-testing`), preserving each skill's exact `SKILL.md`, `references/`, and `scripts/`.
2. **KAAL Engine** (`engineering/core/`) extracted verbatim into `workspace/.kaal/`.
3. **Neutral Skill Index** (`workspace/AGENTS.md` and `workspace/skills/INDEX.md`) generated mechanically from the exact YAML `name`, `description`, and relative path of all 14 skills in alphabetical order — mirroring native Agent Skills discovery without highlighting `kaal-controls`, mentioning ratchets, or hinting at the prompt.

Rationale: Providing all 14 deployed skills tests realistic KAAL availability (both skill discovery and knowledge application) without giving Arm B an artificial shortcut (handing `modes.md` directly) or exposing internal repository engineering history (`engineering/release-management/`, PR retros, change records) that an external KAAL consumer does not receive. (See Decision C-4 for CPO confirmation vs Option D-2 full repository archive.)

Before the first run, the staged Arm B bundle's file list and `@kaihacksai/kaal-foundation` SHA-256 hashes are written to `evidence/treatment-manifest.json`, and every Arm B run receives a byte-identical copy.

#### Arm A Setup (Untreated / Blank)
For each Arm A run (`a1`–`a5`), a fresh empty disposable directory `/tmp/e1-runs/<run-id>/workspace/` is created containing zero files.

#### Held-Constant Execution Parameters (Identical Across Arm A and Arm B)
| Parameter | Value for Arm A and Arm B |
| --- | --- |
| Agent platform | Antigravity subagent runtime (`define_subagent` + `invoke_subagent`) |
| Model | `inherit` (identical session model across all 10 runs; recorded explicitly in `do.md` provenance) |
| Tool permissions | Identical read-only subagent tools (`enable_write_tools: false`, `enable_mcp_tools: false`, `enable_subagent_tools: false`) |
| Workspace mode | `inherit` (only mode supported in this environment; see Section 3) |
| User prompt | Verbatim contents of `prompt.txt`: `"Explain what a ratchet is in the context of software engineering governance. Explain its purpose, behaviour and limitations. Provide a practical example."` |
| System prompt template | Identical wording in both arms, differing only in `<WORKSPACE_PATH>`:<br>`You are a software engineering assistant. Your workspace directory is <WORKSPACE_PATH>. If files or skills exist inside your workspace directory, you may consult them when relevant; do not inspect files outside your assigned workspace directory. Answer the user's request directly, accurately, and clearly.` |
| Follow-up turns | None (strictly single-turn response; no hints, retries, or clarifications) |
| Hashing tool | `@kaihacksai/kaal-foundation` (`node packages/kaal-foundation/bin/kaal-foundation.mjs sha256`), verified first via `kaal-foundation verify` |

---

### 3. Isolation Controls and Honest Residual Disclosure

Following KAAL Controls discipline, isolation measures are classified strictly by what they actually do:

1. **Preventive controls (enforced by runtime/filesystem setup):**
   - Each run (`a1`–`a5`, `b1`–`b5`) executes in a brand-new subagent conversation with an empty conversation history — zero visibility into the coordinating agent's chat, other runs' outputs, or the judge sessions.
   - Each run gets its own freshly created disposable directory `/tmp/e1-runs/<run-id>/workspace/`; Arm A's directory contains zero files and Arm B's contains only the pinned `3aafe4f708bd6ce16293d5bd6b6410de8c345449` bundle (never `E1-ratchet-understanding/`).
   - Write, MCP, and subagent-spawning tools are disabled for all subject runs, preventing cross-run state mutation or environment tampering.
2. **Directive controls (instructions only — never claimed as preventive):**
   - Both arms receive the identical instruction: `"do not inspect files outside your assigned workspace directory"`.
3. **Detective controls (post-run transcript audit — verified after every run):**
   - Immediately after each run completes, its full subagent transcript (`transcript.jsonl` / `transcript_full.jsonl`, located via `manage_subagents`) is audited deterministically:
     - **Arm A contamination check:** Verify that **zero** tool calls read, list, or search `/home/antigravity/Kai-Hacks-AI/KAAL` or any `/tmp/e1-runs/b*` directory. Any violation marks the run `contaminated` (retained in raw evidence, excluded from uncontaminated comparison, and disclosed).
     - **Arm B contamination check:** Verify that **zero** tool calls touch `/home/antigravity/Kai-Hacks-AI/KAAL` (especially `E1-ratchet-understanding/plan.md` or `key.md`). Any violation marks the run `contaminated`.
     - **Arm B exposure classification (per `kaal-research` F4 & RT1 lesson):**
       - `opened`: **only** if a retained verbatim tool-call excerpt in `evidence/excerpts/<run-id>.excerpt.txt` proves the agent opened/read at least one KAAL file inside its assigned workspace.
       - `delivered`: KAAL was staged in the workspace, transcript confirms clean execution, and no KAAL file was opened.
       - `unchecked`: transcript unavailable or unreadable (prevents `effect` claims).
       - Never infer `opened` from an agent's self-report or output prose alone.

#### Disclosed Harness-Level Isolation Residual (Important — Raised in Decision C-3)
In this Antigravity remote VM, subagents must use `Workspace: inherit` (branched/isolated subagent workspaces are unsupported by the platform). Consequently, two harness-level residuals cannot be preventively eliminated inside this VM without bypassing environment boundaries (which is prohibited):

1. **Workspace metadata and root `AGENTS.md` injection:** The Antigravity host runtime may automatically include `<user_information>` (naming `/home/antigravity/Kai-Hacks-AI/KAAL`) and `<user_rules>` (root `AGENTS.md`, which mentions KAAL, `engineering/core/AGENTS.md`, and `@kaihacksai/kaal-foundation`, though not `kaal-controls` or ratchets) in subagent context. During DO, the first Arm A transcript will be inspected to verify and record exact observed harness context in `do.md` and `fresh-means`.
2. **Shared-VM filesystem readability:** Because read tools exist on both arms for comparability, `/home/antigravity/Kai-Hacks-AI/KAAL` remains technically reachable on disk if a subagent disobeys the directive boundary. Post-run transcript audit detects any breach reliably, but does not prevent it beforehand.

Decision C-3 below asks the CPO to choose between **Option I-1** (automated in-VM subagents with full transcript audit and explicit disclosure of this residual) and **Option I-2** (CPO/Owner-supplied Arm A outputs from separate Antigravity conversations with zero attached repository).

---

### 4. Repetition Count and Execution Order

- **Planned repetitions:** **`n = 5` independent runs per arm** (`10` runs total: `a1`–`a5` and `b1`–`b5`).
- **Execution order:** Strictly interleaved (`a1, b1, a2, b2, a3, b3, a4, b4, a5, b5`), sequentially one at a time, to minimize temporal/backend drift bias and eliminate any concurrent cross-talk.
- **What `n = 5` per arm can and cannot show (`n-shows`, no invented threshold):**
  - *Can show:* Whether consistent structural patterns, omissions, or traps appear across repeated independent runs of each arm; whether Arm B reliably discovers and opens KAAL Skills without hints; within-arm response variability; and whether a clear, consistent directional difference is visible in these runs.
  - *Cannot show:* Statistically powered effect sizes, population rates, p-values, or generalization beyond this model, single prompt, and KAAL revision. No arbitrary score cutoff or statistical significance threshold is invented; CHECK reports the full per-run, per-dimension distributions, medians/ranges, qualitative quotes, and counterevidence.

---

### 5. Evidence Format and Provenance

All DO and CHECK artifacts live inside `engineering/research/experiments/E1-ratchet-understanding/` (no reliance on temporary directories after DO completes). Every evidence file is hashed with `@kaihacksai/kaal-foundation` SHA-256 and listed in `evidence/manifest.json`.

#### Planned Directory Layout (Populated in DO and CHECK — Not Present in PLAN)
```text
engineering/research/experiments/E1-ratchet-understanding/
├── plan.md                          # PLAN (this file; frozen upon PLAN PR acceptance)
├── prompt.txt                       # Frozen verbatim prompt (PLAN)
├── key.md                           # Frozen evaluation key & rubric (PLAN)
├── do.md                            # DO execution record, provenance, deviations (DO PR)
├── check.md                         # CHECK blinded analysis, scores, counterevidence (CHECK PR)
├── act.md                           # ACT conclusions, lessons, proposed next steps (ACT PR)
├── RH2.md                           # Optional kaal-research rehearsal record (CHECK PR; see Decision C-1)
└── evidence/
    ├── manifest.json                # Relative paths + kaal-foundation SHA-256 of all evidence files
    ├── provenance.json              # Timestamps, pinned SHA, VM/Node/Antigravity info, key/treatment times
    ├── treatment-manifest.json      # Exact file list + SHA-256 of staged Arm B KAAL bundle
    ├── arm-mapping.json             # Run IDs (a1..a5, b1..b5) -> arm, conversation ID, timestamps, metrics
    ├── raw/
    │   ├── a1.md ... a5.md          # Verbatim raw outputs from Arm A
    │   └── b1.md ... b5.md          # Verbatim raw outputs from Arm B
    ├── excerpts/
    │   ├── a1.audit.txt ... a5.audit.txt       # Transcript audit proving zero out-of-workspace reads
    │   └── b1.excerpt.txt ... b5.excerpt.txt   # Verbatim tool-call trace excerpts (exposure & audit)
    ├── blinded/                     # Added in CHECK PR
    │   ├── blind-mapping.json       # Shuffled labels s01..s10 -> a1..b5 (withheld from judges)
    │   ├── packet-raw.md            # Shuffled s01..s10 verbatim responses handed to Judges 1 & 2
    │   ├── judge-1-scores.json      # Raw output of independent blinded Judge 1
    │   ├── judge-2-scores.json      # Raw output of independent blinded Judge 2
    │   ├── packet-redacted.md       # Conditional minimally de-identified packet (if KAAL cues appear)
    │   ├── redaction.diff           # Exact diff between packet-raw.md and packet-redacted.md
    │   └── judge-3-scores.json      # Conditional Judge 3 scores on packet-redacted.md
    └── metrics.json                 # Deterministic D7b metrics (word/byte counts, tool calls, durations)
```

Note on transcripts: Full subagent transcripts can be large and may contain internal system metadata; DO retains deterministic structured tool-call audit logs and verbatim relevant excerpts under `evidence/excerpts/` (never unredacted credentials/tokens) and verifies every path and SHA-256 in `evidence/manifest.json`.

---

### 6. Scoring and Blinded Evaluation Protocol

Full criteria, conceptual traps (`T1`–`T7`), 0–3 anchor descriptors, and anti-jargon neutrality rules are frozen in `key.md` (`28684c96dd5e68535498a46f18d46d32eef7472040d0090a34fe5a548323c796`). Summary:

- **Seven mandated dimensions:**
  - `D1` Correctness (purpose, non-regression, monotonicity, fail-closed, exit) — 0–3
  - `D2` Distinction from ordinary gates (vs strict blocking gate, vs detective/advisory check, check/filter separation) — 0–3
  - `D3` Treatment of inherited violations (baseline allowance, shrinkage, stale-allowance removal, provenance, identity vs count) — 0–3
  - `D4` Control type versus strategy (control design category vs temporary preventive enforcement strategy/mode; distinct from corrective work) — 0–3
  - `D5` Practical applicability & concrete example (end-to-end operational lifecycle) — 0–3
  - `D6` Grounding, precision & limitations (honest non-compliance claim scoping, granularity/masking, stagnation, provenance/boundary limits) — 0–3
  - `D7a` Efficiency — qualitative signal-to-noise & clarity — 0–3
  - `D7b` Efficiency — objective metrics computed deterministically by script (word/byte counts, tool call counts, run duration, token/turn counts where exposed)
- **Blinded judging (executed in CHECK only):**
  - Shuffled labels `s01`–`s10` generated from a recorded deterministic seed/permutation stored in `evidence/blind-mapping.json`.
  - **Two independent fresh judge subagents** (`Judge 1`, `Judge 2`) score `packet-raw.md` against frozen `key.md` without seeing arm labels, run IDs, transcripts, or each other's scores.
  - Each judge supplies per-dimension integer scores, verbatim supporting quotes/omissions, traps observed, counterevidence, and an explicit **blinding check** (`guessed-arm` + triggering cues).
  - **Conditional de-identification sensitivity pass (`Judge 3`):** Triggered automatically if any response contains explicit KAAL brand/file identifiers (`KAAL`, `RATCHETS`, `judge-mode`, `kaal-controls`, `modes.md`, `F34`–`F37`); strips only those explicit identifiers into neutral placeholders (preserving exact diff) to check whether explicit brand cues altered scores.
  - **No silent reconciliation:** All inter-judge disagreements, blinding-guess accuracy, counterevidence, and Arm A/B overlap are reported verbatim in `check.md`.

---

### 7. Stopping Conditions

1. **Normal completion:** All 10 interleaved runs (`a1`–`a5`, `b1`–`b5`) complete with raw outputs, provenance, and transcript audits archived. Strictly **no optional stopping or post-hoc extension**: `n` is fixed at 5 per arm and will not be increased or reduced after inspecting results.
2. **Contamination stop / escalation:**
   - Inspect `a1`'s transcript immediately after `a1` finishes (before running `b1`–`b5`). If `a1` shows harness-injected ratchet/controls content or accesses `/home/antigravity/Kai-Hacks-AI/KAAL`, **pause DO immediately** and escalate to the CPO.
   - If any Arm B run reads `engineering/research/experiments/E1-ratchet-understanding/`, **halt DO immediately** and escalate.
   - If a single isolated run suffers out-of-workspace read contamination later in the sequence, preserve it in `evidence/`, mark it `contaminated`, and do not silently discard or replace it; if `>= 2` runs in either arm show out-of-workspace reads, **halt DO** and report a systemic isolation failure.
3. **Comparability or runtime failure stop:** If the runtime changes model, loses tool parity, or fails to produce auditable transcripts for `>= 2` runs, halt DO, preserve all partial evidence, and report the blocker to the CPO.
4. **Governance boundary stop:** If any step would require editing KAAL packages, workflows, rulesets, or bypassing repository checks, stop immediately and escalate.

---

### 8. Limitations and Threats to Validity (Disclosed Upfront)

1. **Harness `Workspace: inherit` residual (Arm A purity):** Under Option I-1, Arm A runs in the same VM where `/home/antigravity/Kai-Hacks-AI/KAAL` is mounted, so workspace metadata and root `AGENTS.md` (mentioning KAAL and `kaal-foundation`, not ratchets) may appear in harness context, and filesystem isolation relies on directive + detective controls rather than a preventive sandbox.
2. **Historical order of KAAL authoring vs key freezing (`kaal-research` F3/F4):** KAAL's `kaal-controls` ratchet documentation (`3aafe4f`) existed before E1's `key.md` was written, and the PLAN author read `kaal-controls` while preparing E1. Although `key.md` is strictly vendor-neutral, reviewed by the CPO, and frozen **prior to DO execution and Arm B bundle assembly**, it was not written independently of KAAL's existence. This creates a residual rubric-alignment threat and must be disclosed when assessing whether `effect`-scope claims can be marked `yes` under `kaal-research` F4.
3. **Imperfect blinding due to distinctive content cues:** Even with shuffled labels and a conditional brand-redaction pass, responses influenced by `kaal-controls` may remain partially recognizable by conceptual structure (e.g., four-type control taxonomy or filter-in-front-of-verdict framing). Judge blinding-guess accuracy will be measured and disclosed explicitly.
4. **Single-model, single-prompt, single-turn scope:** Results apply only to the observed Antigravity model, this single explanatory prompt, and KAAL at commit `3aafe4f708bd6ce16293d5bd6b6410de8c345449`. Explanation quality does not automatically transfer to code implementation, CI configuration, or review judgment.
5. **Small sample size (`n = 5` per arm):** Sufficient to surface consistent structural differences and failure modes, insufficient for statistical rate estimation.
6. **Same-platform orchestrator and judges:** While Judge 1, Judge 2 (and Judge 3) run in fresh sessions blind to arm identity, they share the same underlying Antigravity model family as the subject runs (potential self-preference bias); raw responses and quotes are preserved so the CPO and Owner can independently audit every score.

---

### 9. Repository Convention Alignment and Decisions Raised for CPO

No existing repository conventions, capabilities, workflows, or rulesets are changed by this PLAN. The following five alignment points are raised explicitly for CPO decision prior to DO acceptance:

| ID | Topic / Potential Convention Conflict | Analysis | Recommended Resolution (For CPO Confirmation) |
| --- | --- | --- | --- |
| **C-1** | **Experiment home & `kaal-research` record format** | `kaal-engineering/C28` places capability rehearsals under `<capability>/02-learnings/rehearsals/RH<n>/` and notes `engineering/research/` predates C28; `kaal-research` (`F1`–`F4`) defines a plain-text `RH<n>.md` record checked by `judge-rehearsal.mjs`. Meanwhile, this mandate places E1 at `engineering/research/experiments/E1-ratchet-understanding/` with `plan.md`, `do.md`, `check.md`, `act.md`, `evidence/`. | Keep all E1 artifacts under `engineering/research/experiments/E1-ratchet-understanding/` per the CPO mandate (zero changes to `packages/`). In CHECK, **also** emit a companion `kaal-research`-conforming record (`RH2.md` with `id: research/RH2`, or `controls/RH1` if CPO prefers attributing it to Controls) inside this same folder and verify its form with `judge-rehearsal.mjs` and `find-rehearsals.mjs`. Confirm whether companion `RH<n>.md` is desired and which ID namespace to use. |
| **C-2** | **Four-PR stage flow (`PLAN`/`DO`/`CHECK`/`ACT`) vs PR templates and `ACT` controls** | `.github/PULL_REQUEST_TEMPLATE/` has `plan.md`, `do.md`, `act.md` (with `<capability>/C<n>` Change IDs) and no `check.md` template. `controls-act.yml` watches `02-learnings/retros/`, `00-changes/*/act.md`, and `plan/*/act.md`, so `engineering/research/experiments/E1-ratchet-understanding/` triggers no capability-Change ACT gate (verified green on PR #2393). | Raise four separate squash PRs into `kaal/research/ratchet-understanding` (`PLAN` #2393, then `DO`, `CHECK`, `ACT`), each awaiting CPO acceptance. Do not fabricate a capability Change ID (`C<n>`) or a capability 4L retro unless CPO directs otherwise; use concise structured stage PR bodies matching the mandate. Confirm promotion to `main` remains out of scope unless authorized after ACT. |
| **C-3** | **Arm A isolation residual (`Workspace: inherit`)** | In-VM Antigravity subagents enforce `Workspace: inherit`, so `/home/antigravity/Kai-Hacks-AI/KAAL` remains on disk and root `AGENTS.md` may be injected by the harness (see Section 3). | **Confirm Option I-1 (recommended):** Run both arms via automated in-VM subagents with empty vs staged disposable workspaces, strict post-run transcript audits, immediate pause on any contamination, and explicit disclosure of any observed harness metadata in `do.md`/`fresh-means`. Alternatively, select **Option I-2** if the CPO/Owner prefers supplying external zero-repo Arm A outputs directly. |
| **C-4** | **Arm B KAAL delivery surface** | "KAAL available" can mean either the deployed consumer surface (all 14 Agent Skills + KAAL Engine + neutral frontmatter index) or a full repository checkout at `3aafe4f708bd6ce16293d5bd6b6410de8c345449`. | **Confirm Option D-1 (recommended):** Staged deployed consumer surface (all 14 Skills + KAAL Engine + neutral `AGENTS.md`/`INDEX.md` at `3aafe4f708bd6ce16293d5bd6b6410de8c345449`), avoiding leakage of internal `engineering/` development docs. Alternatively, select **Option D-2** (full clean `git archive` of `3aafe4f708bd6ce16293d5bd6b6410de8c345449`). |
| **C-5** | **`key-frozen` vs pre-existing KAAL under `kaal-research` F3/F4** | `kaal-research` F4 requires `key-frozen < treatment-fixed` for `effect` claims marked `yes`. Here `key.md` is frozen in PLAN prior to DO execution and Arm B bundle assembly, but KAAL's underlying `kaal-controls` docs already existed at `3aafe4f`. | Record both timestamps honestly in `provenance.json` (`key-frozen` at PLAN freeze; `kaal-revision-date` of `3aafe4f`; `treatment-bundle-fixed` at DO staging) and disclose the pre-existing-treatment limitation in CHECK. Confirm whether CPO accepts capping automated `effect` claims at `partly` (or reporting `comparison` as the primary verdict scope) if either C-3 or C-5 prevents strict F4 `effect: yes`. |

---

### 10. Readiness Checklist Before DO Execution

DO will **not** begin until:
1. All required CI checks on PR #2393 are green.
2. The CPO reviews and explicitly accepts this PLAN PR (including dispositions on Decisions C-1 through C-5) and PR #2393 is merged into `kaal/research/ratchet-understanding` (or CPO authorizes DO directly from accepted PLAN).
3. `node packages/kaal-foundation/bin/kaal-foundation.mjs verify` returns `verified` (exit 0) in the execution environment before any evidence digest is recorded.

