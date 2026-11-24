# E1 — Evaluation Key and Scoring Rubric (Frozen Pre-Execution)

Status: frozen as part of E1 PLAN prior to DO execution. Do not expose this file to experimental subject sessions (Arm A or Arm B).

## Purpose and Neutrality Contract

This key defines what a strong, accurate, operationally useful explanation of a **ratchet in software engineering governance** looks like, together with the common conceptual traps and the scoring rubric used by blinded judges in CHECK.

### Anti-Jargon / KAAL-Terminology Neutrality Rule (Mandatory)

- **Never reward KAAL-specific terminology alone.** Terms such as `KAAL`, `RATCHETS`, `judge-mode`, `applyBaseline`, `station`, `strategy: ratchet`, `baseline-source`, or capability/requirement identifiers (`CTL`, `F34`, `F36`, `F37`, `I15`) earn **zero** points by themselves.
- **Accept equivalent domain-standard vocabulary.** Standard software engineering and governance terms (e.g., *baseline / allowlist / grandfathered debt / known-issues list*, *high-water mark / monotonic non-regression*, *audit / warn / advisory vs blocking / enforcing gate*, *transitional enforcement pattern / rollout strategy*, *fail-closed*) receive full credit whenever the underlying concept is stated accurately.
- **Penalize unexplained internal jargon.** If an answer relies on framework-specific names or internal file/tool references without explaining their general software engineering meaning, treat that as a clarity/applicability weakness under D5 and D7 rather than a strength.
- **Judge substance, not length or style.** A concise, precise explanation that covers the concepts accurately scores higher than a verbose, padded response.

---

## Reference Key (Domain-Neutral Governance Concepts and Traps)

### What a Strong Explanation Covers

1. **Purpose (Why ratchets exist):**
   - Enables adopting or tightening a governance standard on a codebase/system with pre-existing (inherited) violations without halting all delivery ("stop the bleeding" / incremental compliance).
   - Bridges the gap between passive reporting (which allows debt to grow) and strict immediate blocking (which blocks every change until all legacy debt is cleared).

2. **Core Behaviour and Lifecycle:**
   - **Baseline / allowance:** Captures the current known violations as an explicit baseline (allowance).
   - **No new regressions:** Any new violation outside the baseline causes the gate to fail/block; grandfathered violations in the baseline are tolerated temporarily.
   - **Monotonic tightening (one-way movement):** The baseline can only shrink (or remain equal), never grow. When an inherited violation is resolved, its allowance is removed so the standard permanently tightens.
   - **No silent return:** A previously resolved violation that reappears is treated as a new regression and blocks; re-adding it to the baseline is rejected as baseline growth.
   - **Stale-allowance discipline:** Keeping an allowance for a finding that no longer exists leaves hidden slack that could mask a future regression; strict ratchets reject or remove stale allowances in the same change.
   - **Fail-closed on uncertainty:** Missing, unreadable, or incomparable baselines, or an analysis/check that failed to produce a verdict, must block/fail rather than silently pass ("missing evidence is not success").
   - **Temporary lifecycle and explicit exit:** A ratchet is transitional, not permanent. It requires clear ownership and an exit condition: once the baseline reaches zero (empty), the ratchet machinery/baseline is removed and the control operates as an ordinary full preventive gate.

3. **Distinction from Ordinary Gates and Passive Checks:**
   - **Ordinary (strict) preventive gate:** Fails on *any* violation (new or inherited); enforces full compliance immediately.
   - **Detective / advisory / reporting check:** Surfaces violations without blocking changes; provides visibility but does not stop regression.
   - **Ratchet:** Blocks *only* regressions relative to the accepted baseline (plus baseline integrity violations and unknown outcomes).
   - **Clean architectural separation (desirable):** The underlying rule/check stays pure and reports all violations; the ratchet acts as a removable filter/wrapper around the check's findings so retiring the ratchet does not require rewriting the check.

4. **Treatment of Inherited Violations and Baseline Integrity:**
   - Distinguishes between **identity-based baselines** (tracking specific stable finding identifiers, e.g., file/rule/symbol) and **count-based / aggregate thresholds** (e.g., "at most N warnings" or "coverage >= X%"), ideally noting why stable finding identities prevent violation-swapping ("fix one, break another").
   - **Trusted baseline provenance:** The reference baseline must be read from the last *accepted* state (e.g., default branch / last passing release), never trusted blindly from the candidate change under review.
   - **Advancement only on accepted runs:** A failing or unjudgable run must never modify or advance the accepted baseline.

5. **Control Type versus Strategy / Mode:**
   - Distinguishes what a control *is by design* (e.g., directive policy/standard, detective check/scan, preventive gate/block, corrective remediation) from *how it is operated or rolled out*.
   - A ratchet is a **temporary enforcement strategy (or operating mode) of a preventive control** (relying on a detective check's findings to decide what to block), **not** a fifth/separate control type and **not** a corrective control (it stops backsliding; remediation of legacy debt is separate work).

6. **Practical Example:**
   - Gives a realistic, concrete software engineering scenario (e.g., static analysis / SAST findings, linter rules, dependency/license checks, API/schema rules, workflow/policy checks, or coverage) demonstrating:
     1. Existing codebase with inherited violations recorded in an accepted baseline,
     2. A change introducing a new violation -> blocked,
     3. A change touching unrelated code while legacy violations remain -> passes,
     4. A change resolving a legacy violation -> baseline shrinks (and returning it later fails),
     5. Reaching zero baseline -> baseline removed and control continues as a standard blocking gate.
   - Reflects realistic operational mechanics (where the baseline lives, how updates are enforced/reviewed, who owns retirement).

7. **Limitations and Epistemic Discipline:**
   - **Does not prove compliance:** Passing a ratcheted gate only shows *no new regressions* (within what was checked), never that the system satisfies the underlying rule.
   - **Granularity / masking weakness:** Count-based ratchets allow swapping one violation for another ("net-zero churn"); even identity-based ratchets miss a known finding getting *worse* under the same identifier unless identifiers are fine-grained enough.
   - **No automatic remediation or retirement ("permanent temporary" trap):** A ratchet prevents worsening but does not fix inherited debt by itself; without dedicated remediation and an owner monitoring for an empty baseline, the ratchet can linger indefinitely.
   - **Operational fragility / bypass risks:** Unstable finding identifiers (e.g., line-number-only keys) break baseline matching during refactoring; allowing unreviewed baseline edits or overrides outside the gate defeats the ratchet; enforcement only covers actions passing through the gate boundary.

### Common Conceptual Traps (Do Not Name These in the Subject Prompt)

- **Trap T1 — Conflating ratchet with compliance:** Implying a passing ratcheted check means the codebase meets the rule.
- **Trap T2 — Treating ratchet as a control type:** Calling a ratchet a standalone control type (e.g., alongside preventive/detective/corrective) rather than a temporary enforcement strategy/mode of a preventive control.
- **Trap T3 — Count-only blind spot:** Describing ratchets purely as numeric thresholds (e.g., "warning count <= 42") without recognizing swap/masking limits or finding-identity baselines.
- **Trap T4 — Omitting baseline shrinkage / stale-allowance removal:** Describing grandfathering ("ignore existing issues") without explaining how allowances shrink permanently when fixed and why stale allowances or re-added allowances must be rejected.
- **Trap T5 — Missing fail-closed / provenance discipline:** Ignoring where the trusted baseline comes from (candidate vs accepted state) or failing to address missing/unjudgable evidence.
- **Trap T6 — Omitting exit / permanence:** Treating the ratchet as an end state rather than a temporary transitional strategy with an explicit retirement/exit to plain preventive enforcement.
- **Trap T7 — Overclaiming protection:** Claiming a ratchet "guarantees" improvement or "makes regressions impossible" without noting gate boundaries, overrides, or separate corrective work.

---

## Scoring Rubric (7 Dimensions)

Score each qualitative dimension (D1–D6, plus D7a) on a **0–3 integer scale**:

- **0 — Absent or Incorrect:** Missing, factually wrong, or seriously misleading.
- **1 — Surface / Partial:** Touches the concept generically with major omissions, ambiguities, or conflations.
- **2 — Solid / Competent:** Accurate and substantively covers the core concept with only minor omissions.
- **3 — Rigorous / Comprehensive:** Accurate, operationally precise, handles key edge cases/failure modes, and maintains disciplined claims.

| ID | Dimension | 0 (Absent / Incorrect) | 1 (Surface / Partial) | 2 (Solid / Competent) | 3 (Rigorous / Comprehensive) |
| --- | --- | --- | --- | --- | --- |
| **D1** | **Correctness** (purpose, behaviour, monotonicity, lifecycle) | Misdefines ratchet or misses core one-way non-regression behaviour. | States "don't get worse" generically; misses key mechanics (e.g., tightening, fail-closed, or temporary exit). | Accurately explains purpose, baseline non-regression, monotonic tightening, and temporary nature with no material errors. | All of 2, plus crisp handling of no-return after resolution, fail-closed/unknown semantics, and clean exit to full enforcement. |
| **D2** | **Distinction from ordinary gates** | Does not distinguish a ratchet from ordinary gates or passive checks. | Notes it is less strict than a normal gate, without clearly contrasting blocking vs passive/detective behaviour. | Clearly contrasts a ratchet against both strict blocking gates (blocks inherited debt) and passive/reporting checks (blocks nothing). | All of 2, plus clean separation between the underlying rule/check (emitting findings) and the removable ratchet filter/enforcement layer. |
| **D3** | **Treatment of inherited violations** | Does not explain how legacy/inherited violations are handled. | Mentions grandfathering/ignoring legacy debt, but vague on how baselines shrink or stay honest. | Explains baseline allowance for inherited debt, monotonic shrinkage on resolution, and blocking new/returning violations. | All of 2, plus addresses baseline provenance (trusted accepted state vs candidate), stale-allowance removal, and identity-based vs count-based trade-offs. |
| **D4** | **Control type versus strategy** | Does not address control classification, or wrongly calls a ratchet a separate control type / corrective control. | Implicitly treats ratchet as a way of running a check/gate, without clearly separating control type from strategy/mode. | Explicitly distinguishes control type (preventive/detective/directive/corrective) from ratchet as a temporary strategy/operating mode of a preventive control (relying on detective input, distinct from corrective remediation). | All of 2, stated with precision: explains that control type reflects design while ratchet is a temporary enforcement strategy/mode whose claims are bounded accordingly. |
| **D5** | **Practical applicability & example** | No practical example, or example is incoherent/non-operational. | Generic or toy example showing only initial baseline or one step, lacking realistic workflow behaviour. | Concrete software engineering example walking through inherited debt, blocking a new violation, and tightening on resolution. | Realistic end-to-end example covering all transitions (inherited pass, new block, fix & shrink, return block, exit to full gate) plus concrete operational ownership/mechanics. |
| **D6** | **Grounding, precision & limitations** | Omits limitations or makes unsupported/overstated guarantees ("guarantees compliance/impossibility"). | Lists 1–2 generic caveats (e.g., "legacy debt stays") without operational depth or claim-scoping. | Identifies multiple concrete limitations (e.g., no compliance claim, stagnation/no auto-remediation, granularity/masking or bypass risk) with grounded claims. | Disciplined epistemic framing ("stops new regressions only, never proves rule compliance"), covers granularity/masking, stagnation/exit ownership, baseline integrity/provenance, and enforcement boundary limits. |
| **D7a** | **Efficiency — Signal-to-noise & clarity** (qualitative) | Disorganized, padded, or obscure; jargon impairs comprehension. | Understandable but noticeably verbose, repetitive, or relies on unexplained framework jargon. | Clear, well-structured, concise, and accessible to a general software engineering reader. | High information density with crisp structure, minimal filler, and zero unexplained internal jargon. |

### D7b — Measurable Efficiency Metrics (Computed Deterministically Outside Judge)

The following objective metrics are computed by script from raw outputs and transcripts and reported beside D7a in `check.md` (never folded into a composite score):
- Output word count and UTF-8 byte length
- Tool call count (total, file reads, directory/search calls)
- Wall-clock run duration (seconds)
- Token/turn count (if exposed in subagent transcript; otherwise reported as `unavailable`)

---

## Blinded Judge Procedure (For CHECK)

1. Two independent fresh Antigravity subagent sessions (**Judge 1** and **Judge 2**) each receive ONLY:
   - This frozen `key.md`,
   - The verbatim `prompt.txt`, and
   - The 10 raw subject responses under shuffled neutral labels `s01`–`s10` (with zero arm IDs, run IDs, timestamps, transcripts, or file paths revealing Arm A vs Arm B).
2. Each judge outputs a structured per-item evaluation for `s01`–`s10` containing:
   - Integer scores (0–3) for `D1`, `D2`, `D3`, `D4`, `D5`, `D6`, `D7a`,
   - For every dimension score, a short **evidence quote or specific omission** from that response justifying the score,
   - Traps observed (`T1`–`T7`, if any),
   - **Counterevidence / notable strengths or weaknesses** that qualify the numeric score,
   - **Blinding check:** `guessed-arm` (`A`, `B`, or `uncertain`) and exact textual cues (if any) that led to the guess.
3. **Sensitivity de-identification pass (conditional):** If any response contains explicit KAAL brand/artifact identifiers (`KAAL`, `RATCHETS`, `judge-mode`, `kaal-controls`, `modes.md`, `F34`/`F36`/`F37`), a minimally redacted copy of the 10-response packet (replacing only explicit brand/artifact identifiers with neutral placeholders while keeping all conceptual text intact, diff preserved in `evidence/`) is scored by a third fresh blinded judge session (**Judge 3**) to measure whether explicit KAAL cues shifted scoring.
4. No silent reconciliation: CHECK reports Judge 1, Judge 2 (and Judge 3, if triggered) side-by-side, highlighting every disagreement of >= 1 point and every blinding-guess accuracy rate.
