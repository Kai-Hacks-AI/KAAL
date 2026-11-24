# E1 — Conclusions, Lessons, and Proposed Actions (ACT)

Status: ACT complete — ready for CPO review. **Recommendations in this document are research proposals only and do not authorize product, capability, governance, or promotion changes. The Owner retains final authority.**

---

## 1. Stage Lineage and Preservation Statement

- **PLAN:** `Kai-Hacks-AI/KAAL#2393` (CPO accepted with Owner approval at `8cfab89`; squash-merged into `kaal/research/ratchet-understanding` at `6d35c0f0ac99c169df3ee5a5fb5538544acbcdab`, `2026-11-24T09:10:30Z`).
- **DO:** `Kai-Hacks-AI/KAAL#2422` (CPO accepted; squash-merged into `kaal/research/ratchet-understanding` at `b942354`).
- **CHECK:** `Kai-Hacks-AI/KAAL#2423` (CPO accepted `2026-11-24T20:02:17Z`, with Owner direction to deploy future experimental skills into `.agents/skills/` and preserve E1 as executed; squash-merged into `kaal/research/ratchet-understanding` at `79e4f793e358ac708ce14f5886e0d60c8e9450de`, `2026-11-24T20:06:30Z`).
- **Preservation:** All prior E1 artifacts (`plan.md`, `prompt.txt`, `key.md`, `do.md`, `check.md`, `RH2.md`, and `evidence/`) are preserved **exactly as executed** with zero retroactive edits. No KAAL capabilities, controls, workflows, or rulesets were modified during E1.

---

## 2. Conclusions (Strictly Within `comparison` Scope and Observed Limitations)

Evaluating 10 isolated Antigravity Cloud runs (`Medium neon`, `n = 5` blank vs `n = 5` pinned KAAL consumer surface at `3aafe4f708bd6ce16293d5bd6b6410de8c345449`) against the frozen two-track rubric (`key.md` Rev 2) supports three grounded conclusions:

1. **General Domain-Standard Ratchet Understanding (`Track 1`, 0–18): `inconclusive` (Mixed Trade-Off, Overlapping Ranges)**
   - Overall Track 1 scores overlapped substantially between Arm A (`blank`: median **13**, means **13.8–14.4**, range **13–18**) and Arm B (`kaal`: medians **14–15**, means **14.6–15.0**, range **14–17**), and Arm A produced the single highest Track 1 score (`a5`: **18/18** on Judge 2 and Judge 3; **16/18** on Judge 1).
   - Beneath that overlap sits a sharp, consistent sub-dimension trade-off:
     - **Where KAAL helped:** Arm B consistently scored higher on **inherited-violation baseline mechanics (`G3`: 3.0 vs 2.0–2.4)** and **grounding/limitations (`G5`: 3.0 vs 2.2–2.4)**, and eliminated count-only blind spots (**Trap `GT3`: 0/5 in Arm B vs 2/5 in Arm A**).
     - **Where KAAL hurt:** Arm B **unanimously lost 1 point on clarity/portability (`G6`: 2.0 vs 3.0 across all 15 judge-run ratings)** because every Arm B answer embedded workspace-local `file://` paths and unexplained internal schema tokens (`spent: true`, `baseline-source`, `strategy: ratchet`, `then: "preventive"`, `station mode`, undefined `next`), while also averaging +21.4% more words (`M1`: 880.8 vs 725.4) and 3 tool calls vs 0 (`M2`).
     - **Where both arms tied:** Unanimous ceiling on core correctness (`G1`: **3.0 vs 3.0**), and shared weakness on contrasting passive/advisory checks (`G2`: **1.2–1.4 vs 1.4**, missed by 4/5 runs in each arm).

2. **KAAL Governance-Model Alignment (`Track 2`, 0–15): Large, Non-Overlapping Comparison Separation (+10 Points)**
   - Arm B separated cleanly without overlap from Arm A across all three judges (**11–14**, medians **12–13** vs **2–3**, medians **2–3**), consistently transmitting fail-closed `UNKNOWN` semantics (`K3`: **3.0 vs 0.0**), removable check-vs-filter architecture & mode-scoped claims (`K5`: **3.0 vs 0.0–0.6**), accepted-state provenance & stale-allowance discipline (`K2`: **2.4–3.0 vs 1.0**), and temporary zero-exit lifecycle (`K4`: **2.0–2.2 vs 1.0**).
   - However, **0 of 5 Arm B runs reached 3/3 on `K1` (control type vs strategy: mean 1.8)** because every Arm B run searched `rg -i ratchet` directly into `references/modes.md` and `scripts/judge-mode.mjs`, skipping `skills/kaal-controls/SKILL.md` where KAAL's four-type control taxonomy resides.

3. **Causal Scope Bounds (`effect: no` in `RH2.md`):**
   - E1 establishes a `comparison` result on these 10 runs, **not** a causal `effect: yes` claim. Effective evaluator blinding was not achieved (**10/10** correct arm recognition by Judges 1, 2, and 3 on both raw and minimally redacted packets); KAAL's `kaal-controls` files at `3aafe4f` pre-existed `key.md`; Arm B carried a disposable Cloud Project wrapper (`E1-Arm-B`); and `n = 5` on one model (`Medium neon`) and one explanatory prompt cannot estimate population rates or generalize to operational tasks.

---

## 3. Owner Direction Recorded for Future Experiments

Per CPO CHECK acceptance on PR #2423 (`2026-11-24T20:02:17Z`):

- **Deploy future experimental skills into `.agents/skills/`** (standard Agent Skills discovery layout) rather than custom `skills/` + staged `skills/INDEX.md` + workspace root `AGENTS.md`.
- **Preserve E1 as executed:** E1's artifacts (`plan.md`, `do.md`, `check.md`, `RH2.md`, `evidence/`) remain unchanged as the exact historical record of the `skills/` + `AGENTS.md`/`skills/INDEX.md` consumer staging deployed at `ChBrain/test-kaal@f35a04c5d3e09aedba6ab5fa06b08af40dabd847`.

This direction directly addresses E1's retrieval observation: in E1, 5/5 Arm B runs bypassed `skills/INDEX.md` and `skills/kaal-controls/SKILL.md` via raw ripgrep (`rg -i ratchet`). Deploying into `.agents/skills/` allows future experiments to test native Agent Skills discovery (`SKILL.md` entry routing) without custom staging wrappers.

---

## 4. Lessons Learned

1. **L1 — Two-track rubrics prevent circularity and surface real trade-offs:** Separating general domain-standard understanding (`Track 1`) from KAAL-specific governance design alignment (`Track 2`) proved essential. A single blended score would have made Arm B look like an unqualified win (+11 points), hiding both that a blank agent reached **18/18** on general quality (`a5`) and that Arm B suffered a unanimous clarity/portability regression (`G6`: 2.0 vs 3.0).
2. **L2 — Genuine Arm A isolation requires standalone sessions outside the KAAL project:** In-VM subagent diagnostics (`ac2cbdf4582eec8abc07506dd491f577`) proved `Workspace: inherit` leaks root `AGENTS.md`, `<project_resources>`, and `view_file` access to `Kai-Hacks-AI/KAAL`, while omitting on-disk `transcript.jsonl`. Manual standalone Cloud execution (`Option I-A1`) achieved genuine preventive Arm A isolation and trace-verified Arm B `exposure: opened` (`5/5`), at the cost of manual operator capture and an unavoidable Cloud Project wrapper on Arm B.
3. **L3 — Minimal brand/path redaction does not preserve evaluator blinding:** Replacing explicit `KAAL` / `file://` strings with bracketed placeholders (`[reference specification]`, `[mode evaluator function]`) left blinding accuracy at **10/10** in Judge 3 — both because placeholders appeared only in Arm B and because KAAL schema tokens (`new-finding`, `baseline-grew`, `stale-allowance`, `baseline-source`, `spent: true`) remained identifiable. True blinding requires either **executable/behavioural tasks scored deterministically** (tests/mutations rather than prose judges) or **symmetric stylistic and schema normalization** audited before judging.
4. **L4 — Direct `rg` retrieval bypasses `SKILL.md` entry guidance:** When an agent locates a reference file directly via text search (`rg -i ratchet` → `references/modes.md`), cross-cutting framing that lives only in `SKILL.md` (such as KAAL's four-type control taxonomy and detective-vs-preventive contrast) is missed unless `references/` links back or native `.agents/skills/` discovery opens `SKILL.md` first.
5. **L5 — Grounded local files can induce jargon/path leakage in general-audience answers:** Even when asked a general software engineering question, 5/5 Arm B runs cited local `file://` links and internal script return fields without translating them for an outside reader, whereas Arm A runs produced clean, portable explanations with runnable Node/Bash scripts and real-world tooling references (`betterer`, `rubocop`, `phpstan`, `Semgrep`, `CodeQL`) — though Arm A's scripts also contained real governance bugs (PR-branch baseline reads in all 4 scripts, `a3`'s silent `catch` defaulting to `0` errors, and `a4`'s non-enforcing Bash `echo`).

---

## 5. Proposed Product and Capability Changes (Proposals Only — Not Implementation Authorization)

Each proposal belongs to its owning capability and requires a separately authorized PLAN/DO/ACT Change decided by the Owner:

| ID | Owning Capability | Proposal | E1 Evidence Basis |
| --- | --- | --- | --- |
| **P1** | `kaal-controls` | Add ratchet/baseline trigger phrasing (e.g., *"ratchet, baseline, incremental non-regression"*) to `SKILL.md` frontmatter `description`, and add a brief pointer in `references/modes.md` back to `SKILL.md`'s four-type taxonomy and detective-vs-preventive contrast. | 5/5 Arm B runs bypassed `SKILL.md` via `rg -i ratchet`, capping `K1` at `1.8/3` (0/5 reached 3) and leaving 4/5 Arm B runs at `1/3` on `G2` (passive/detective contrast). |
| **P2** | `kaal-controls` | Add concise guidance in `SKILL.md` / `modes.md` advising agents to translate KAAL concepts into portable software engineering terms (avoiding unexplained internal tokens like `spent: true`, `baseline-source`, `station mode` or workspace-local `file://` links) when answering general audience questions. | Unanimous `G6` clarity penalty across all 5 Arm B runs (`2.0` vs `3.0` on all 3 judges), which offset Arm B's `G3`/`G5` gains on Track 1. |
| **P3** | `kaal-research` | Add a short methodological note to `SKILL.md` / `references/rehearsal.md` (drawing on `RH1` and `RH2`) warning that visible redaction placeholders and framework schema tokens defeat prose blinding, and recommending deterministic behavioural evaluations or symmetric normalization when claiming effective blinding. | Judge 3 guessed `10/10` arms accurately even on `packet-redacted.md`, demonstrating why attempted blinding must be audited empirically rather than assumed. |
| **P4** | Research / Experiment Setup | Standardize future experimental skill deployments under `.agents/skills/` (per Owner direction recorded in Section 3), eliminating custom `skills/INDEX.md` staging additions. | Owner direction on PR #2423 + E1 retrieval bypass of `skills/INDEX.md` (`0/5` opened). |

---

## 6. Proposed Next Experiments (Proposals Only — Owner Decides)

| ID | Proposed Experiment | Question & Why It Follows From E1 | Key Design Upgrade Over E1 |
| --- | --- | --- | --- |
| **E2** | **Applied Ratchet Engineering Task (Executable / Behavioural)** | Does KAAL reduce real implementation/review defects when an agent must *build or review* a ratcheted CI check on a fixture repo? E1 showed Arm A wrote runnable scripts with real governance bugs (`a3` silent `catch` -> 0 errors, `a4` non-enforcing Bash `echo`, PR-branch baseline reads in 4/4 scripts), while Arm B knew the right invariants (`K2`, `K3`, `K5`) conceptually. | Score primarily via **deterministic Test Cases & mutation fixtures** (new finding, baseline growth, stale allowance, re-introduction, missing/corrupt baseline, empty exit) — eliminating prose-blinding failure entirely. Deploy skills under `.agents/skills/`. |
| **E3** | **Native `.agents/skills/` Discovery Trial** | Under the Owner-directed `.agents/skills/` deployment (without custom `skills/INDEX.md` or workspace `AGENTS.md`), do agents discover and open `kaal-controls/SKILL.md` first — and does routing through `SKILL.md` close E1's `K1` and `G2` gaps? | Tests native Agent Skills discovery cleanly (separating `SKILL.md`-routed retrieval from raw `rg` lookup) and directly tests P1 if later authorized. |
| **E4** | **Multi-Model & Cross-Family Judge Replication** | Do E1/E2 patterns hold across weaker and stronger model tiers/families, and under cross-family blinded judges? | Controls for single-model (`Medium neon`) ceiling effects (`G1 = 3.0`, `a5 = 18/18`) and same-model-family judge bias. |

---

## 7. Governance and Collector Closure Notes

- **Disposable resources:** Disposable Arm B repo `ChBrain/test-kaal` (`f35a04c5d3e09aedba6ab5fa06b08af40dabd847`) and disposable Cloud project `E1-Arm-B` may be deleted by the Owner (all 91 files are archived by SHA-256 in `evidence/treatment-manifest.json`).
- **Promotion out of scope:** Per CPO disposition **C-2**, promotion of `kaal/research/ratchet-understanding` to `main` is a separate Owner/CPO decision after ACT acceptance and is not initiated here.
- **No implementation authorization:** Nothing in this ACT record authorizes changes to `packages/`, `engineering/`, `.github/`, controls, or rulesets.
