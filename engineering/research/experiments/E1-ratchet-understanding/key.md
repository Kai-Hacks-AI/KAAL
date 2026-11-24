# E1 — Evaluation Key and Two-Track Scoring Rubric (Frozen Pre-Execution, Rev 2)

Status: revised per CPO PLAN review and frozen prior to DO execution. Do not expose this file to experimental subject sessions (Arm A or Arm B).

## Purpose, Separation Principle, and Neutrality Contract

This key separates two distinct evaluation tracks so that a strong, domain-standard software engineering explanation is **never penalized** for omitting KAAL-specific governance design choices, while KAAL-specific governance alignment is measured transparently alongside it:

- **Track 1 — General Domain-Standard Ratchet Understanding (`G1`–`G6`, 0–3 each, max 18):** Assesses core correctness, distinction from ordinary gates and passive checks, handling of inherited violations, practical applicability/example, grounded limitations, and signal-to-noise efficiency strictly against general software engineering governance standards. A sound domain-standard answer that has never seen KAAL can achieve **18/18 (3/3 on every dimension)**.
- **Track 2 — Alignment with KAAL's Governance Model (`K1`–`K5`, 0–3 each, max 15):** Separately assesses whether an answer expresses the specific governance design choices codified in KAAL's Controls capability (control type vs strategy separation, strict stale-allowance/provenance discipline, fail-closed uncertainty semantics, mandatory retirement at zero, and removable filter-vs-check separation with mode-scoped claims).
- **Track 3 — Objective Efficiency Metrics (`M1`–`M4`):** Computed deterministically outside the judge sessions and reported beside Tracks 1 and 2.

**Mandatory Reporting Separation Rule:** Track 1 and Track 2 scores are **always preserved and reported separately** (per-dimension and per-track). They must **never** be summed into a single blended total.

### Anti-Jargon / KAAL-Terminology Neutrality Rule (Mandatory Across Both Tracks)

- **Never reward KAAL-specific terminology alone.** Terms such as `KAAL`, `RATCHETS`, `judge-mode`, `applyBaseline`, `station`, `strategy: ratchet`, `baseline-source`, or capability/requirement identifiers (`CTL`, `F34`, `F36`, `F37`, `I15`) earn **zero** points on either Track 1 or Track 2 by themselves.
- **Accept equivalent domain-standard vocabulary.** Standard software engineering and governance terms (e.g., *baseline / allowlist / grandfathered debt / known-issues list*, *high-water mark / monotonic non-regression*, *audit / warn / advisory vs blocking / enforcing gate*, *transitional enforcement pattern / rollout mode*, *fail-closed*) receive full credit whenever the underlying concept is stated accurately.
- **Penalize unexplained internal jargon.** On Track 1 (`G4`, `G6`), relying on framework-specific names or internal file/tool references without explaining their portable software engineering meaning lowers practical applicability and clarity rather than helping.
- **Judge substance, not length.** Concise, accurate explanations outscore verbose or padded responses.

---

## Reference Key — Track 1: General Domain-Standard Ratchet Understanding

### What a Strong Domain-Standard Answer Covers (No KAAL-Specific Design Required)

1. **Purpose:** Enables teams to introduce or tighten a software engineering standard (e.g., linting, SAST, type safety, test coverage, dependency/architecture rules, performance budgets) on a system with pre-existing technical debt without freezing delivery for a big-bang rewrite.
2. **Core One-Way Behaviour:** Records the current level or set of violations as a baseline/threshold; blocks changes that make things worse (new regressions); tightens monotonically as improvements are made so progress cannot silently slip backward.
3. **Distinction from Ordinary Gates and Passive Checks:**
   - Contrasts with a **strict/static blocking gate** (which rejects all violations including pre-existing ones, halting delivery immediately — or holds a fixed threshold that never tightens).
   - Contrasts with **passive / warning / advisory reporting** (which surfaces violations without blocking regressions).
4. **Treatment of Inherited Violations:** Explains grandfathering/baselining existing violations so unrelated changes can proceed while new regressions fail; explains how improvements shrink/tighten the baseline; notes relevant baseline design trade-offs (e.g., numeric count/percentage thresholds vs itemised/finding-level baselines, and why baseline updates need governance/integrity so developers cannot casually raise the allowance).
5. **Practical Applicability & Example:** Walks through a concrete, realistic engineering scenario (e.g., static analysis findings, lint rules, test coverage, compiler warnings, or architectural rules) showing the baseline with legacy issues, blocking a newly introduced violation, passing unrelated work, and tightening the baseline after a fix, plus practical workflow ownership.
6. **Grounded Limitations:** Accurately scopes what a ratchet achieves (stopping backsliding is not the same as achieving compliance or fixing legacy debt) and identifies real engineering failure modes such as:
   - does not drive remediation of inherited debt by itself (stagnation risk),
   - gaming / Goodhart effects or violation-swapping in count-based thresholds ("fix one, add another"),
   - brittle identifiers (e.g., line-number baselines breaking on refactors),
   - friction or bypass/override risks outside the enforced check.

### General Conceptual Traps (Track 1 — Do Not Name in Subject Prompt)

- **GT1 — Conflating ratchet with compliance:** Implying a passing ratcheted check means the codebase meets the underlying standard.
- **GT2 — Omitting tightening / one-way locking:** Describing only static grandfathering ("ignore existing issues forever") without explaining monotonic tightening as issues are fixed.
- **GT3 — Ignoring violation-swapping or gaming:** Treating count-only thresholds as equivalent to tracking specific violations without acknowledging swap/masking limits.
- **GT4 — Overclaiming protection:** Claiming a ratchet "guarantees" improvement or makes regressions "impossible" without acknowledging enforcement boundaries, overrides, or separate remediation work.

---

## Reference Key — Track 2: Alignment with KAAL's Governance Model (Design Choices, Not Universal Requirements)

Track 2 records whether an answer incorporates specific governance design choices reflected in KAAL's Controls capability (`kaal-controls`). Omitting these choices does **not** reduce Track 1 scores; they are evaluated strictly as a separate alignment dimension.

1. **Control Type versus Strategy / Mode (`K1`):** Explicitly separates control *type* by design (directive, preventive, detective, corrective — or equivalent standard governance taxonomy) from operating *strategy/mode*, identifying a ratchet as a temporary enforcement strategy/mode applied to a preventive control (relying on a detective check's findings; distinct from corrective remediation), not a fifth/standalone control type.
2. **Strict Baseline Monotonicity, Stale-Allowance Removal & Accepted-State Provenance (`K2`):** Explicitly states that the reference baseline is read from the last *accepted* state (never trusted from the candidate under review), rejected/failed runs never advance the accepted baseline, resolved allowances must be removed (stale allowances for resolved findings fail rather than staying as slack), and re-adding a resolved finding's allowance is rejected as baseline growth.
3. **Fail-Closed Uncertainty Semantics (`K3`):** Explicitly states that missing, unreadable, or incomparable baselines, or a check that could not judge, produce an unknown/blocking outcome rather than silently passing ("missing evidence is never success").
4. **Temporary Lifecycle & Mandatory Retirement at Zero (`K4`):** Explicitly treats a ratchet as strictly temporary with an assigned owner and explicit exit condition: once the baseline is empty (zero), ratchet machinery and baseline are removed and the control continues as an ordinary preventive gate (distinguishing the control's exit condition from a planner's deadline).
5. **Removable Filter Separation & Mode-Scoped Epistemic Claims (`K5`):** Explicitly separates the pure finding-emitting check from a removable ratchet filter in front of the verdict (empty baseline = identity; removing the ratchet leaves the check unchanged), AND scopes claims tightly to mode and granularity (a ratchet proves only no *new* named findings within its boundary; name-based membership misses same-name severity worsening; written rules or settings are not observed operation/effectiveness).

---

## Scoring Rubric

Score every qualitative dimension on a **0–3 integer scale**:
- **0 — Absent or Incorrect:** Missing, factually wrong, or seriously misleading.
- **1 — Surface / Partial:** Touches the idea generically with notable omissions, ambiguities, or conflations.
- **2 — Solid / Competent:** Accurate and substantively covers the core concept with minor omissions.
- **3 — Rigorous / Comprehensive:** Accurate, operationally clear, nuanced, and well-grounded.

### Track 1 Table — General Domain-Standard Ratchet Understanding (`G1`–`G6`, max 18)

| ID | Dimension | 0 (Absent / Incorrect) | 1 (Surface / Partial) | 2 (Solid / Competent) | 3 (Rigorous / Comprehensive) |
| --- | --- | --- | --- | --- | --- |
| **G1** | **Core correctness** (purpose & monotonic non-regression) | Misdefines ratchet or misses one-way non-regression behaviour. | States "don't get worse" generically; misses monotonic tightening or governance purpose. | Accurately explains purpose (incremental adoption with legacy debt), baseline non-regression, and monotonic tightening with no material errors. | Crisp, accurate, error-free explanation of purpose, one-way locking of gains, and how regressions vs improvements behave across changes. (Does NOT require exit-at-zero or fail-closed.) |
| **G2** | **Distinction from ordinary gates** | Does not distinguish a ratchet from ordinary gates or passive checks. | Notes it is less strict than a normal gate, without clearly contrasting strict blocking vs passive reporting. | Clearly contrasts a ratchet against both strict/static blocking gates and passive warning/advisory checks. | All of 2, clearly articulating the distinct trade-off each mode occupies in software governance (delivery halt vs unchecked drift vs controlled non-regression). |
| **G3** | **Treatment of inherited violations** | Does not explain how pre-existing/inherited violations are handled. | Mentions grandfathering/ignoring legacy debt, but vague on tightening or preventing silent re-introduction. | Explains baseline allowance for inherited violations, blocking new ones, and tightening the baseline when legacy issues are resolved. | All of 2, plus thoughtful treatment of baseline design (e.g., itemised/finding-level vs count-based baselines and protecting baseline integrity against casual inflation). |
| **G4** | **Practical applicability & concrete example** | No practical example, or example is incoherent/non-operational. | Generic or toy example showing only one step without realistic workflow behaviour. | Concrete software engineering example showing inherited debt, blocking a new violation, allowing unrelated changes, and tightening on resolution. | Realistic, operationally actionable end-to-end example with clear workflow mechanics (baseline storage, review/update flow, team ownership) accessible to any engineering team. |
| **G5** | **Grounding, precision & general limitations** | Omits limitations or makes unsupported guarantees ("guarantees compliance/impossibility"). | Lists 1–2 generic caveats without operational depth. | Accurately scopes claims (does not prove compliance) and identifies multiple concrete limitations (e.g., stagnation/no auto-remediation, metric gaming/swapping, maintenance friction, bypasses). | Disciplined, balanced, operationally grounded analysis of limitations (compliance gap, stagnation, granularity/gaming, identifier fragility, and enforcement boundary limits) with zero overclaiming. |
| **G6** | **Efficiency — Signal-to-noise & clarity** | Disorganized, padded, or obscure; unexplained jargon impairs comprehension. | Understandable but noticeably verbose, repetitive, or relies on unexplained framework jargon. | Clear, well-structured, concise, and accessible to a general software engineering reader. | High information density, crisp structure, minimal filler, and zero unexplained framework-specific jargon. |

### Track 2 Table — KAAL Governance-Model Alignment (`K1`–`K5`, max 15; Reported Separately)

| ID | Design Choice | 0 (Not Present) | 1 (Implicit / Partial) | 2 (Substantially Present) | 3 (Explicit & Precise) |
| --- | --- | --- | --- | --- | --- |
| **K1** | **Control type vs strategy / mode** | Does not separate control type from operating strategy/mode (or calls ratchet a control type / corrective control). | Hints at enforcement mode vs check without naming control types or strategy separation clearly. | Distinguishes control types (preventive/detective/directive/corrective or equivalent) and identifies ratchet as a temporary strategy/mode of a preventive control, distinct from corrective remediation. | All of 2, stated cleanly: control type reflects design, ratchet is a temporary preventive strategy consuming detective findings, and claims follow the active mode. |
| **K2** | **Strict baseline provenance & stale-allowance discipline** | Does not address accepted-state provenance or stale-allowance rejection. | Mentions protecting baseline edits or shrinking baselines without specifying accepted-state reference or stale-allowance failure. | Specifies reading reference baseline from accepted state (not candidate), rejecting baseline growth, and removing resolved allowances cleanly. | All of 2, explicitly covering accepted-state provenance, no advancement on rejected runs, stale-allowance failure on resolved findings, and blocking re-introduction/re-addition. |
| **K3** | **Fail-closed uncertainty (`UNKNOWN` blocks)** | Does not discuss missing/corrupt baselines or unjudgable checks. | Briefly mentions error handling or missing baseline as a caveat without specifying fail-closed blocking. | Explicitly states that missing/unreadable/incomparable baselines or failed checks must block rather than pass. | Explicitly articulates fail-closed governance semantics ("missing or incomparable evidence is unknown and never success") for both baseline and check failures. |
| **K4** | **Temporary lifecycle & mandatory retirement at zero** | Treats ratchet as open-ended/permanent or omits retirement. | Mentions ratchets are ideally temporary without specifying an exit condition or retirement transition. | Explicitly frames ratchet as temporary with an exit at empty/zero baseline transitioning to an ordinary full preventive gate. | All of 2, plus explicit operational retirement requirements (named owner, explicit exit condition removing ratchet-only machinery, distinguishing exit condition from planning deadline). |
| **K5** | **Removable filter architecture & mode-scoped claims** | Does not discuss check/filter separation or name-based granularity/claim-scoping limits. | Mentions one of the two superficially (e.g., wrapper idea or basic non-compliance caveat). | Clearly articulates either removable check-vs-filter separation or rigorous mode/granularity claim-scoping, and touches the other. | Clearly articulates both: pure finding-emitting check behind a removable filter (empty baseline = identity) AND disciplined mode/granularity/boundary claim scoping (including same-name severity worsening). |

### Track 3 — Measurable Efficiency Metrics (`M1`–`M4`, Deterministic Outside Judges)

Computed by script from raw outputs and provenance logs and reported alongside Tracks 1 and 2 (never folded into a composite score):
- `M1`: Output word count and UTF-8 byte length
- `M2`: Tool call count (total and breakdown where trace-captured; otherwise `unavailable`)
- `M3`: Wall-clock execution duration in seconds (where captured; otherwise `unavailable`)
- `M4`: Token/turn count (if exposed by platform; otherwise `unavailable`)

---

## Blinded Judge Procedure (For CHECK)

1. Two independent fresh Antigravity sessions (**Judge 1** and **Judge 2**) each receive ONLY:
   - This frozen `key.md`,
   - The verbatim `prompt.txt`, and
   - The 10 raw subject responses under shuffled neutral labels `s01`–`s10` (with zero arm IDs, run IDs, timestamps, transcripts, or file paths revealing Arm A vs Arm B).
2. Each judge outputs a structured per-item evaluation for `s01`–`s10` containing:
   - **Track 1 scores** (`G1`–`G6`, integers 0–3, plus Track 1 sum 0–18),
   - **Track 2 scores** (`K1`–`K5`, integers 0–3, plus Track 2 sum 0–15) — **never summed with Track 1**,
   - For every dimension score, a short **evidence quote or specific omission** from that response justifying the score,
   - Track 1 traps observed (`GT1`–`GT4`, if any),
   - **Counterevidence / notable strengths or weaknesses** that qualify numeric scores,
   - **Blinding check:** `guessed-arm` (`A`, `B`, or `uncertain`) and exact textual cues (if any) that triggered the guess.
3. **Conditional de-identification sensitivity pass (`Judge 3`):** Triggered automatically if any response contains explicit KAAL brand/artifact identifiers (`KAAL`, `RATCHETS`, `judge-mode`, `kaal-controls`, `modes.md`, `F34`/`F36`/`F37`). Strips only explicit brand/file identifiers into neutral placeholders (preserving exact diff in `evidence/blinded/redaction.diff`) and runs a third fresh blinded judge session on the redacted packet to test whether brand cues affected Track 1 or Track 2 scores.
4. **No silent reconciliation:** CHECK reports Judge 1, Judge 2 (and Judge 3, if triggered) side-by-side for Track 1 and Track 2 separately, highlighting every disagreement of >= 1 point and every blinding-guess accuracy rate.
