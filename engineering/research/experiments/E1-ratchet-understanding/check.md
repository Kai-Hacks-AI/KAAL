# E1 — Blinded Evaluation and Analysis (CHECK)

Status: CHECK complete — ready for CPO review. **ACT (`act.md`) is held until CPO acceptance of this CHECK PR.**

---

## 1. Executive Summary (Two Separate Outcomes — Never Blended)

Evaluating all 10 verbatim DO outputs (`a1`–`a5` blank vs `b1`–`b5` KAAL) against the frozen two-track rubric (`key.md` Rev 2, `ce927764377623bc1ae5f0595dfe76a8205d1e4197a2eb0e38e26208758a590a`) using two independent raw blinded judges (**Judge 1**, **Judge 2**) plus a third independent de-identified sensitivity judge (**Judge 3**) yields two clearly distinct findings:

1. **Outcome 1 — Track 1: General Domain-Standard Ratchet Understanding (`G1`–`G6`, max 18): Inconclusive / Mixed Trade-Off with Substantial Arm Overlap**
   - **Arm A (`blank`, `n = 5`):** Median **13** across all three judges; mean **13.8** (J1), **14.4** (J2), **14.2** (J3); range **13–18** (with `a5` achieving **18/18** on J2 and J3, and **16/18** on J1).
   - **Arm B (`kaal`, `n = 5`):** Median **15** (J1), **14** (J2), **14** (J3); mean **15.0** (J1), **14.8** (J2), **14.6** (J3); range **14–17** (peaking at `b3`: **17/18** on J2 and J3, **16/18** on J1).
   - **Why Track 1 is mixed rather than a clean win:** Arm B consistently outperformed Arm A on **inherited-violation mechanics (`G3`: 3.0 vs 2.0–2.4)** and **grounding/limitations (`G5`: 3.0 vs 2.2–2.4)**, and avoided Trap **`GT3`** (count-only blind spot: **0/5** in Arm B vs **2/5** in Arm A: `a1`, `a3`). However, Arm A **unanimously outperformed Arm B on clarity/signal-to-noise (`G6`: 3.0 vs 2.0 on every single run across all three judges)** because every Arm B response leaked workspace-local links (`file:///…/modes.md`, `judge-mode.mjs`) and unexplained framework tokens (`spent: true`, `baseline-source`, `strategy: ratchet`, `then: "preventive"`, `station mode`, undefined `next`). Both arms tied unanimously on **`G1` (3.0 vs 3.0)** and were equally weak on **`G2` (passive/advisory contrast: 1.2–1.4 vs 1.4, with 4/5 in each arm missing the passive-check contrast)**.

2. **Outcome 2 — Track 2: Alignment with KAAL's Governance Model (`K1`–`K5`, max 15): Large, Non-Overlapping Separation (+10 Points)**
   - **Arm A (`blank`, `n = 5`):** Median **2** (J1, J2), **3** (J3); mean **2.0** (J1, J2), **2.6** (J3); range **2–3**.
   - **Arm B (`kaal`, `n = 5`):** Median **12** (J1, J3), **13** (J2); mean **12.2** (J1), **13.0** (J2), **12.4** (J3); range **11–14**.
   - Arm B transmitted KAAL's specific governance choices cleanly on **fail-closed `UNKNOWN` (`K3`: 3.0 vs 0.0)**, **removable filter architecture & mode-scoped claims (`K5`: 3.0 vs 0.0–0.6)**, **accepted-state provenance & stale-allowance discipline (`K2`: 2.4–3.0 vs 1.0)**, **temporary zero-exit lifecycle (`K4`: 2.0–2.2 vs 1.0)**, and **control type vs strategy (`K1`: 1.8 vs 0.0)** — though notably, **no Arm B run reached 3/3 on `K1`**, matching the DO trace finding that all 5 Arm B runs searched `rg -i ratchet` directly into `modes.md` and `judge-mode.mjs` while skipping `skills/kaal-controls/SKILL.md` (where KAAL's full four-type control taxonomy resides).

3. **Primary Outcome Scope & Causality Discipline (`C-5` / `kaal-research` F4):**
   - Primary verdict scope is **`comparison`**, with overall verdict **`inconclusive`** on general explanation improvement (mixed Track 1 trade-off + overlapping ranges) alongside a clear, non-overlapping comparison separation on Track 2 KAAL governance alignment.
   - **`effect: yes` is NOT claimed** (`demonstrated: no` in `RH2.md`): effective judge blinding failed (**10/10** correct arm guesses on both raw and minimally redacted packets), KAAL's `kaal-controls` docs pre-existed `key.md`, Arm B included a Cloud project/workspace wrapper, and Track 1 shows opposite-direction sub-dimension effects.

---

## 2. Unblinded Score Matrices (Judges 1, 2, and 3 Side by Side — No Silent Reconciliation)

Deterministic shuffle (`seed: E1-ratchet-understanding-check-v1-b942354`, stored in `evidence/blinded/blind-mapping.json`) mapped `a1`–`b5` to neutral labels `s01`–`s10`. Track 1 (`G1`–`G6`, max 18) and Track 2 (`K1`–`K5`, max 15) are strictly separated.

### 2.1 Per-Run Totals Across All Three Judges

| Run | Blind Label | Arm | Exposure | Track 1 J1 (Raw) | Track 1 J2 (Raw) | Track 1 J3 (Redacted) | Track 2 J1 (Raw) | Track 2 J2 (Raw) | Track 2 J3 (Redacted) | Traps (J1/J2/J3) | Blind Guess (J1/J2/J3) |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `a1` | `s10` | `blank` | `none` | 13 | 13 | 13 | 2 | 2 | 2 | `GT3` / `GT3` / `GT3` | A / A / A |
| `a2` | `s03` | `blank` | `none` | 14 | 15 | 14 | 2 | 2 | 3 | none / none / none | A / A / A |
| `a3` | `s01` | `blank` | `none` | 13 | 13 | 13 | 2 | 2 | 2 | `GT3` / `GT3` / `GT3` | A / A / A |
| `a4` | `s06` | `blank` | `none` | 13 | 13 | 13 | 2 | 2 | 3 | none / none / none | A / A / A |
| `a5` | `s09` | `blank` | `none` | 16 | 18 | 18 | 2 | 2 | 3 | none / none / none | A / A / A |
| **Arm A summary** | — | **`blank` (n=5)** | **0/5 opened** | **med 13, mean 13.8 (13–16)** | **med 13, mean 14.4 (13–18)** | **med 13, mean 14.2 (13–18)** | **med 2, mean 2.0 (2–2)** | **med 2, mean 2.0 (2–2)** | **med 3, mean 2.6 (2–3)** | **2/5 `GT3`** | **5/5 correct** |
| `b1` | `s02` | `kaal` | `opened` | 14 | 14 | 14 | 13 | 13 | 13 | none / none / none | B / B / B |
| `b2` | `s05` | `kaal` | `opened` | 15 | 14 | 14 | 12 | 13 | 12 | none / none / none | B / B / B |
| `b3` | `s04` | `kaal` | `opened` | 16 | 17 | 17 | 13 | 14 | 14 | none / none / none | B / B / B |
| `b4` | `s07` | `kaal` | `opened` | 15 | 15 | 14 | 12 | 13 | 12 | none / none / none | B / B / B |
| `b5` | `s08` | `kaal` | `opened` | 15 | 14 | 14 | 11 | 12 | 11 | none / none / none | B / B / B |
| **Arm B summary** | — | **`kaal` (n=5)** | **5/5 opened** | **med 15, mean 15.0 (14–16)** | **med 14, mean 14.8 (14–17)** | **med 14, mean 14.6 (14–17)** | **med 12, mean 12.2 (11–13)** | **med 13, mean 13.0 (12–14)** | **med 12, mean 12.4 (11–14)** | **0/5 traps** | **5/5 correct** |

### 2.2 Per-Dimension Breakdown by Arm (Means and Raw Per-Run Vectors Across J1 / J2 / J3)

#### Track 1 — General Domain-Standard Ratchet Understanding (`G1`–`G6`, 0–3 each)

| Dimension | Arm A Mean (J1 / J2 / J3) | Arm A Per-Run Vectors (`a1..a5`) | Arm B Mean (J1 / J2 / J3) | Arm B Per-Run Vectors (`b1..b5`) | Observed Direction |
| --- | --- | --- | --- | --- | --- |
| **G1** Core correctness | `3.0 / 3.0 / 3.0` | J1 `[3,3,3,3,3]`, J2 `[3,3,3,3,3]`, J3 `[3,3,3,3,3]` | `3.0 / 3.0 / 3.0` | J1 `[3,3,3,3,3]`, J2 `[3,3,3,3,3]`, J3 `[3,3,3,3,3]` | **Tie (ceiling)** |
| **G2** Distinction from ordinary & passive gates | `1.2 / 1.4 / 1.4` | J1 `[1,1,1,1,2]`, J2 `[1,1,1,1,3]`, J3 `[1,1,1,1,3]` | `1.4 / 1.4 / 1.4` | J1 `[1,1,3,1,1]`, J2 `[1,1,3,1,1]`, J3 `[1,1,3,1,1]` | **Tie (weak in both arms; 4/5 miss passive contrast)** |
| **G3** Inherited violations & baseline mechanics | `2.0 / 2.4 / 2.2` | J1 `[2,2,2,2,2]`, J2 `[2,3,2,2,3]`, J3 `[2,2,2,2,3]` | `3.0 / 3.0 / 3.0` | J1 `[3,3,3,3,3]`, J2 `[3,3,3,3,3]`, J3 `[3,3,3,3,3]` | **Arm B higher (+0.6 to +1.0)** |
| **G4** Practical applicability & example | `2.2 / 2.4 / 2.2` | J1 `[2,2,2,2,3]`, J2 `[2,3,2,2,3]`, J3 `[2,2,2,2,3]` | `2.6 / 2.4 / 2.2` | J1 `[2,3,2,3,3]`, J2 `[2,2,3,3,2]`, J3 `[2,2,3,2,2]` | **Near tie / judge-sensitive (0.0 to +0.4)** |
| **G5** Grounding, precision & general limitations | `2.4 / 2.2 / 2.4` | J1 `[2,3,2,2,3]`, J2 `[2,2,2,2,3]`, J3 `[2,3,2,2,3]` | `3.0 / 3.0 / 3.0` | J1 `[3,3,3,3,3]`, J2 `[3,3,3,3,3]`, J3 `[3,3,3,3,3]` | **Arm B higher (+0.6 to +0.8)** |
| **G6** Efficiency — Signal-to-noise & clarity | `3.0 / 3.0 / 3.0` | J1 `[3,3,3,3,3]`, J2 `[3,3,3,3,3]`, J3 `[3,3,3,3,3]` | `2.0 / 2.0 / 2.0` | J1 `[2,2,2,2,2]`, J2 `[2,2,2,2,2]`, J3 `[2,2,2,2,2]` | **Arm A unanimously higher (+1.0 on every run)** |

#### Track 2 — Alignment with KAAL's Governance Model (`K1`–`K5`, 0–3 each; Reported Separately)

| Dimension | Arm A Mean (J1 / J2 / J3) | Arm A Per-Run Vectors (`a1..a5`) | Arm B Mean (J1 / J2 / J3) | Arm B Per-Run Vectors (`b1..b5`) | Observed Direction |
| --- | --- | --- | --- | --- | --- |
| **K1** Control type vs strategy / mode | `0.0 / 0.0 / 0.0` | `[0,0,0,0,0]` (all 3 judges) | `1.8 / 1.8 / 1.8` | `[2,2,2,2,1]` (all 3 judges) | **Arm B higher (+1.8; none reach 3)** |
| **K2** Strict provenance & stale-allowance | `1.0 / 1.0 / 1.0` | `[1,1,1,1,1]` (all 3 judges) | `2.4 / 3.0 / 2.4` | J1 `[3,2,3,2,2]`, J2 `[3,3,3,3,3]`, J3 `[3,2,3,2,2]` | **Arm B higher (+1.4 to +2.0)** |
| **K3** Fail-closed uncertainty (`UNKNOWN`) | `0.0 / 0.0 / 0.0` | `[0,0,0,0,0]` (all 3 judges) | `3.0 / 3.0 / 3.0` | `[3,3,3,3,3]` (all 3 judges) | **Arm B higher (+3.0, unanimous)** |
| **K4** Temporary lifecycle & zero retirement | `1.0 / 1.0 / 1.0` | `[1,1,1,1,1]` (all 3 judges) | `2.0 / 2.2 / 2.2` | J1 `[2,2,2,2,2]`, J2 `[2,2,3,2,2]`, J3 `[2,2,3,2,2]` | **Arm B higher (+1.0 to +1.2)** |
| **K5** Removable filter & mode-scoped claims | `0.0 / 0.0 / 0.6` | J1/J2 `[0,0,0,0,0]`, J3 `[0,1,0,1,1]` | `3.0 / 3.0 / 3.0` | `[3,3,3,3,3]` (all 3 judges) | **Arm B higher (+2.4 to +3.0)** |

#### Track 3 — Deterministic Objective Efficiency Metrics (`M1`–`M4`, from `evidence/metrics.json`)

| Metric | Arm A (`blank`, `n = 5`) | Arm B (`kaal`, `n = 5`) | Comparison |
| --- | --- | --- | --- |
| `M1` Word count | median **740**, mean **725.4** (range 694–753) | median **893**, mean **880.8** (range 806–936) | Arm B +21.4% mean words (+155.4 words) |
| `M1` UTF-8 bytes | median **5,023**, mean **5,092.8** (range 4,793–5,394) | median **6,458**, mean **6,314.8** (range 5,726–6,649) | Arm B +24.0% mean bytes (partly `file://` URLs & tables) |
| `M2` Tool calls | **0** on all 5 runs (`[0,0,0,0,0]`) | **3** on all 5 runs (`[3,3,3,3,3]`: 1 `rg`, 2 `view_file`) | Arm B +3 tool calls per run |
| `M3` Wall-clock duration | `unavailable` | `unavailable` | Not exposed in Cloud UI exports |
| `M4` Tokens / turns | `unavailable` | `unavailable` | Not exposed in Cloud UI exports |

---

## 3. Inter-Judge Agreement and Verbatim Disagreement Audit

Across all `10 runs × 11 dimensions = 110` dimension ratings:

- **Judge 1 vs Judge 2 (both on `packet-raw.md`):**
  - Exact agreement: **98 / 110 (89.1%)**
  - Within ±1 point: **110 / 110 (100.0%)** (zero disagreements ≥ 2 points)
  - All 12 disagreements (every single one = 1 point):
    1. `a2 (s03) · G3`: J1=`2` vs J2=`3` (whether distinguishing aggregate vs granular without PR-inflation protection meets 3)
    2. `a2 (s03) · G4`: J1=`2` vs J2=`3` (whether a count-only runnable CI script with PR A/B/C + bot flow earns 3)
    3. `a2 (s03) · G5`: J1=`3` vs J2=`2` (whether omitting explicit compliance-gap phrasing holds G5 at 2)
    4. `a5 (s09) · G2`: J1=`2` vs J2=`3` (whether `"error immediately would block all work; warning would be ignored"` merits 3 vs 2)
    5. `a5 (s09) · G3`: J1=`2` vs J2=`3` (whether omitting explicit PR-tampering guard holds per-file baseline at 2 vs 3)
    6. `b2 (s05) · G4`: J1=`3` vs J2=`2` (whether `strategy: ratchet` syntax in example reduces portability from 3 to 2)
    7. `b2 (s05) · K2`: J1=`2` vs J2=`3` (whether omitting explicit "rejected runs advance nothing" holds K2 at 2 vs 3)
    8. `b3 (s04) · G4`: J1=`2` vs J2=`3` (whether citing `(like judge-mode.mjs)` in the example holds G4 at 2 vs 3)
    9. `b3 (s04) · K4`: J1=`2` vs J2=`3` (whether `"nothing automatically enforces a deadline or retires it"` satisfies the exit-vs-deadline anchor)
    10. `b4 (s07) · K2`: J1=`2` vs J2=`3` (same explicit failed-run non-advancement criterion as `b2`)
    11. `b5 (s08) · G4`: J1=`3` vs J2=`2` (whether `strategy: ratchet` / `baseline-source` in example lowers G4 portability)
    12. `b5 (s08) · K2`: J1=`2` vs J2=`3` (same explicit failed-run non-advancement criterion as `b2`, `b4`)

---

## 4. De-Identification Sensitivity Analysis (`Judge 3`) and Blinding Failure Audit

### 4.1 Score Stability Under Brand/Path De-Identification
Because all 5 Arm B raw outputs contained explicit workspace links (`ChBrain/test-kaal/skills/kaal-controls/...`), `modes.md`, `judge-mode.mjs`, `applyBaseline`, `judgeMode`, and (in `b2`) `"KAAL governance model"`, `packet-redacted.md` replaced only those explicit brand/path/function identifiers with neutral placeholders (full edit trail in `evidence/blinded/redaction.diff`, 0 leftover brand/path tokens).

- **J3 vs J1:** **100 / 110 (90.9%)** exact agreement, **110 / 110 (100%)** within ±1.
- **J3 vs J2:** **100 / 110 (90.9%)** exact agreement, **110 / 110 (100%)** within ±1.
- **All 10 disagreements between J3 and J1** (all = 1 point):
  - `a2/a4/a5 · K5`: J1=`0` vs J3=`1` (J3 gave partial credit `1` where Arm A noted global-count granularity trade-offs)
  - `a5 · G2, G3`: J1=`2,2` vs J3=`3,3` (J3 agreed with J2, giving `a5` 18/18)
  - `b2/b4/b5 · G4`: J1=`3` vs J3=`2` (J3 penalized remaining unexplained keys `strategy: ratchet` / `baseline-source` / `next` / `spent` on G4)
  - `b3 · G4, K4`: J1=`2,2` vs J3=`3,3` (J3 agreed with J2)
- **All 10 disagreements between J3 and J2** (all = 1 point): `a2 · G3,G4,G5,K5`, `a4 · K5`, `a5 · K5`, `b2 · K2`, `b4 · G4,K2`, `b5 · K2`.
- **Takeaway on sensitivity:** Stripping explicit `KAAL` / `file://` / `modes.md` / `judge-mode.mjs` identifiers did **not** flip or materially shift either Track 1 or Track 2 arm comparisons (Track 1 arm-mean gap narrowed slightly from +1.2 [J1] / +0.4 [J2] to +0.4 [J3]; Track 2 arm-mean gap shifted slightly from +10.2 [J1] / +11.0 [J2] to +9.8 [J3]).

### 4.2 Blinding Failure Disclosure (Critical Methodological Finding)
- **Blinding-guess accuracy:** **10/10 (100%)** for **Judge 1 (raw)**, **10/10 (100%)** for **Judge 2 (raw)**, and **10/10 (100%)** for **Judge 3 (minimally redacted)**.
- **Why blinding broke even in `packet-redacted.md`:**
  1. The visible redaction placeholders (`[reference specification]`, `[mode evaluator function]`, `[baseline filter function]`) appeared **only** in Arm B responses — acting as an inadvertent structural marker of Arm B!
  2. Even without placeholders, Arm B responses retained unmistakable KAAL implementation schema tokens (`new-finding`, `baseline-grew`, `stale-allowance`, `baseline-source`, `strategy: ratchet`, `spent: true`) and a uniform 5–6-row Markdown scenario table, whereas all 5 Arm A responses shared classic CI-watermark cues (`Goodhart's Law`, `betterer`/`rubocop`/`phpstan`, standalone Node/Bash scripts).
- **Methodological consequence:** Effective evaluator blinding was **not** achieved. Both raw and redacted evaluations must be treated as **attempted-blind but effectively unblinded by content cues**, precluding any `effect: yes` claim under `kaal-research` F4.

---

## 5. Qualitative Analysis, Counterevidence, and Uncertainty

### What Arm B (KAAL) Consistently Added
1. **Eliminated count-only blind spots (`GT3`):** 2 of 5 blank runs (`a1`, `a3`) proposed scalar warning/error count ratchets without acknowledging violation-swapping ("debt trading"). All 5 Arm B runs used scoped finding-identity baselines (`file#symbol:rule`) and explicitly warned that coarse identifiers mask worsening debt under the same name.
2. **Accepted-state provenance & stale-allowance discipline:** None of the 5 blank runs prevented a PR from editing its own checked-in baseline file upward (reading baseline only from the PR workspace, and in `a4`'s Bash script exiting `0` even when violations dropped!). All 5 Arm B runs explicitly required reading `previous` from the accepted state (`main`), rejecting baseline growth (`baseline-grew`), and failing stale allowances (`stale-allowance`).
3. **Fail-closed semantics (`UNKNOWN`) and removable filter architecture:** 0 of 5 blank runs addressed missing/corrupt baselines or unjudgable check errors (in fact, `a3`'s `try/catch` silently defaulted to `0` errors if `tsc` crashed without stdout!). All 5 Arm B runs explicitly specified fail-closed `UNKNOWN` blocking and a pure check wrapped by a removable baseline filter.

### Counterevidence and Arm B Weaknesses (Equally Reported)
1. **Best single Track 1 answer came from Arm A (`blank`):** Run `a5` (`s09`) scored **18/18** on both J2 and J3 (**16/18** on J1), tying or beating every Arm B run (`b3` peaked at **17/18** on J2/J3, **16/18** on J1). Without KAAL, `a5` contrasted strict errors vs ignored warnings (`G2`), designed a per-file `.lint-baseline.json` closing the global-count loophole (`G3`/`G4`), named real industry tools (`betterer`, `eslint-nibble`), and covered 6 operational limitations including bypass erosion (`G5`).
2. **Unanimous clarity/portability regression in Arm B (`G6`: 2.0 vs 3.0 across all 15 judge-run ratings):** Every Arm B response anchored its general software engineering explanation to workspace-local `file:///home/antigravity/ChBrain/test-kaal/...` paths and leaked unexplained internal tokens (`spent: true`, `then: "preventive"`, `baseline-source`, `station mode`, undefined `next` in `b4`). Even `b2` cited `"this workspace's KAAL governance model"` and `"station mode"` without defining them for a general reader.
3. **Retrieval shortcut bypassed `skills/kaal-controls/SKILL.md` (explaining `K1 < 3` and `G2 = 1` in 4/5 Arm B runs):** Every Arm B run used `rg -i ratchet` directly on `ChBrain/test-kaal` and opened `references/modes.md` + `scripts/judge-mode.mjs`, **skipping `skills/INDEX.md` and `skills/kaal-controls/SKILL.md`**! Because `SKILL.md` (not `modes.md`) defines KAAL's four-type control taxonomy (directive, preventive, detective, corrective) and contrasts detective vs preventive roles, **0 of 5 Arm B runs earned 3/3 on `K1`**, and **4 of 5 Arm B runs (`b1, b2, b4, b5`) scored only 1/3 on `G2`** by omitting the passive/detective contrast!
4. **Runnable code vs conceptual tables & real-world ecosystem breadth:** 4 of 5 Arm A runs provided runnable Node.js or Bash CI scripts and 3 cited real ecosystem tools (`betterer`, `rubocop`, `phpstan`, `Semgrep`, `CodeQL`), plus practical caveats Arm B omitted (Goodhart's Law, perverse coverage-percentage drops when deleting tested dead code, and legitimate escape hatches/overrides). Arm B instead provided crisp multi-scenario verdict tables (`PASS`/`FAIL`/`UNKNOWN`) anchored to `judge-mode.mjs`.
5. **Higher length and tool overhead:** Arm B averaged +155 words (+21.4%) and 3 tool calls per run vs 0 in Arm A.

### Uncertainty and Limitations
- **Small sample (`n = 5` per arm):** Shows consistent directional patterns where arms separate cleanly (e.g., `K2`–`K5`, `G3`, `G5`, `G6`), but cannot estimate population rates or settle narrow differences like the +0.4 to +1.2 Track 1 mean gap.
- **Unblinding & same-model-family judges:** Judges 1–3 share the Antigravity model family with subjects and guessed 10/10 arms; all raw responses and per-dimension evidence quotes are preserved verbatim in `evidence/blinded/` for direct CPO/Owner inspection.
- **Pre-existing KAAL authoring & Cloud Project wrapper:** `kaal-controls` at `3aafe4f` predates `key.md`, and Arm B used disposable Cloud Project `E1-Arm-B` while Arm A ran standalone outside a project.
- **Single model (`Medium neon`), single explanatory prompt:** Does not test applied code implementation, CI authoring, or review judgment.

---

## 6. Formal Claim Scopes (Aligned with `RH2.md` and `kaal-research` F4)

| Claim ID | Scope | Statement | Demonstrated | What Is Not Shown (`not-shown`) |
| --- | --- | --- | --- | --- |
| `c1` | `description` | All 10 runs (`a1`–`a5`, `b1`–`b5`) completed cleanly; 0/5 Arm A runs called tools (`exposure: none`) while 5/5 Arm B runs opened `skills/kaal-controls/references/modes.md` and `scripts/judge-mode.mjs` via `rg -i ratchet` (`exposure: opened`) without opening `skills/INDEX.md` or `skills/kaal-controls/SKILL.md`. | `yes` | — |
| `c2` | `comparison` | On Track 1 (general domain-standard understanding, 0–18), Arm B showed slightly higher medians/means (14–15 / 14.6–15.0 vs 13 / 13.8–14.4) driven by `G3` (inherited violations), `G5` (limitations), and 0/5 vs 2/5 `GT3` traps, while Arm A unanimously beat Arm B on `G6` clarity (3.0 vs 2.0) and produced the highest single score (`a5`: 18/18 on J2/J3). | `partly` | Arm ranges overlap (`13–18` vs `14–17`); opposite-direction trade-off between `G3`/`G5` and `G6`; small sample (`n=5`); 10/10 judge arm recognition prevents true blinding; single model and prompt. |
| `c3` | `comparison` | On Track 2 (KAAL governance-model alignment, 0–15), Arm B separated sharply and without overlap from Arm A across all three judges (Arm B `11–14`, medians `12–13` vs Arm A `2–3`, medians `2–3`), including unanimous 3.0 vs 0.0 on `K3` (fail-closed `UNKNOWN`) and 3.0 vs 0.0–0.6 on `K5` (removable filter & mode-scoped claims). | `yes` | — *(Note: scope is `comparison` of these observed runs only, not causal `effect`.)* |
| `c4` | `effect` | Access to KAAL caused an improvement in general software engineering ratchet explanation quality. | `no` | Track 1 ranges overlap with an opposite-direction clarity penalty (`G6`); effective judge blinding was not achieved (10/10 arm guesses on both raw and redacted packets); KAAL's `kaal-controls` files at `3aafe4f` existed before `key.md` was authored; Arm B carried a Cloud Project wrapper; `n=5`, single model, single prompt. |

---

## 7. Companion Rehearsal Record Verification (`RH2.md`)

Per CPO disposition **C-1**, `RH2.md` (`id: research/RH2`, verified unused on `origin/main` before CHECK) records this trial in `kaal-research`'s exact plain-text schema (`verdict: inconclusive`, `verdict-about: comparison`, `verdict-rests-on: c2, c3`), checked by `find-rehearsals.mjs` and `judge-rehearsal.mjs` against `evidence/manifest.json` (`@kaihacksai/kaal-foundation` SHA-256).

Awaiting CPO review and acceptance of this CHECK PR before proceeding to ACT (`act.md`).
