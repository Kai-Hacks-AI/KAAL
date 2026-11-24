# E1 — Execution Record (DO)

Status: DO complete — ready for CPO review. **No scoring, blinding, or qualitative evaluation has been performed; CHECK is held until CPO acceptance of this DO PR.**

---

## 1. Approved PLAN Reference and Frozen Inputs

- **Approved PLAN PR:** `Kai-Hacks-AI/KAAL#2393` (CPO accepted with Owner approval at `8cfab89`; squash-merged into `kaal/research/ratchet-understanding` at `6d35c0f0ac99c169df3ee5a5fb5538544acbcdab`, `2026-11-24T09:10:30Z`).
- **Selected isolation & delivery options:** Option **I-A1** (Cloud realization) + Option **D-1** (pinned deployed consumer KAAL surface).
- **`@kaihacksai/kaal-foundation` pre-execution verification:** `node packages/kaal-foundation/bin/kaal-foundation.mjs verify` → `verified` (exit `0`, all 9 foundation cases passed).
- **Frozen PLAN inputs (unchanged, verified via `@kaihacksai/kaal-foundation/sha256`):**
  - `plan.md`: `1ab9debb3fd472388ba63f541e2a03442b7ea9c8afeec303a8cc64f134db74e9`
  - `prompt.txt`: `980505144df299fb524e3de1e678fc2cb2a7bc79cc8049af90b6332464993008`
  - `key.md` (Rev 2 two-track rubric): `ce927764377623bc1ae5f0595dfe76a8205d1e4197a2eb0e38e26208758a590a`

---

## 2. Treatment Staging and Isolation Setup

### Pinned Deployed Consumer Surface (Option D-1)
- **Source revision:** `Kai-Hacks-AI/KAAL@3aafe4f708bd6ce16293d5bd6b6410de8c345449` (`origin/main` base, predating PR #2393; zero E1 files).
- **Staged disposable Arm B repository:** `ChBrain/test-kaal` (private), `main` commit `f35a04c5d3e09aedba6ab5fa06b08af40dabd847`.
- **Exact delivered surface (`91` files, recorded with per-file SHA-256 and `origin` tags in `evidence/treatment-manifest.json`):**
  - `89` verbatim files (`origin: "pinned-3aafe4f"`) extracted via `git archive 3aafe4f708bd6ce16293d5bd6b6410de8c345449`: all 14 KAAL Agent Skills under `skills/<name>/` plus the KAAL Engine (`engineering/core/`) under `.kaal/`.
  - `2` neutral staging additions (`origin: "staging-addition"`):
    - `AGENTS.md` (`f68f3f057bc617320d947f48a8cd7b4dfa3c43b1c859c0d8750effbe76dbec75`, 227 bytes) — neutral consumer entrypoint pointing to `.kaal/` and `skills/INDEX.md`; zero mention of ratchets, controls, or E1.
    - `skills/INDEX.md` (`3ca526bd74d0f1a6683539ad89a6ca815421d804d4c6aab4db2121ed3df7dac7`, 5,434 bytes) — mechanically generated alphabetical table of all 14 skills' verbatim YAML `name`, `description`, and path.
- **Byte-identity and cleanup:** All 91 files in `ChBrain/test-kaal` were verified byte-for-byte against `evidence/treatment-manifest.json` (`d7fbbf476119db6a7ed1e4c25aca0716011ed2f679ec8b0c7c8701aa95511562`) prior to pushing, and `ChBrain/test-kaal` was immediately detached from this KAAL project's resources before any experimental runs began.

### Runtime, Model, and Arm Conditions (Option I-A1 — Cloud Realization)
- **Runtime:** Antigravity Cloud (all 10 runs).
- **Model & settings:** `Medium neon` (identical across all 10 runs; default settings; strictly single turn, no follow-ups or hints).
- **Prompt:** Verbatim `prompt.txt` (`Explain what a ratchet is in the context of software engineering governance. Explain its purpose, behaviour and limitations. Provide a practical example.`).
- **Arm A (`blank`, `a1`–`a5`):** 5 brand-new standalone Antigravity Cloud chats outside any project — zero repository, zero project instructions, zero KAAL skills attached.
- **Arm B (`kaal`, `b1`–`b5`):** 5 brand-new Antigravity Cloud chats inside a clean disposable project (`E1-Arm-B`, zero project instructions, zero extra docs, **only** `ChBrain/test-kaal@f35a04c5d3e09aedba6ab5fa06b08af40dabd847` attached; Antigravity Cloud provisions a fresh ephemeral VM clone per chat).

### Manual Orchestration Disclosure
Per CPO PLAN acceptance, genuine preventive isolation of Arm A could not be achieved via in-VM subagents from this KAAL-attached session. All 10 isolated Antigravity Cloud conversations were therefore launched and collected manually by the human operator (Owner) outside this KAAL project following the interleaved launch sequence (`a1, b1, a2, b2, a3, b3, a4, b4, a5, b5`). The coordinating Antigravity agent staged and verified `ChBrain/test-kaal`, detached it from the KAAL project, archived every verbatim response and UI tool-call excerpt without alteration, computed all `@kaihacksai/kaal-foundation` SHA-256 digests, and verified stopping/contamination criteria.

---

## 3. Run Inventory, Exposure Classification, and Deterministic Track 3 Metrics

| Order | Run | Arm | Exposure | Tool Calls (`M2`) | Words (`M1`) | UTF-8 Bytes (`M1`) | Duration (`M3`) | Tokens/Turns (`M4`) | Raw SHA-256 (prefix) | Excerpt/Audit SHA-256 (prefix) |
| ---: | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | --- |
| 1 | `a1` | `blank` | `none` | 0 | 740 | 5,307 | unavailable | unavailable | `8b3ba059e6fd` | `f476703d7859` |
| 2 | `b1` | `kaal` | `opened` | 3 | 906 | 6,649 | unavailable | unavailable | `c09ea27f81ae` | `da7bd0c41b29` |
| 3 | `a2` | `blank` | `none` | 0 | 742 | 5,394 | unavailable | unavailable | `4d121c293d5e` | `58dec514575b` |
| 4 | `b2` | `kaal` | `opened` | 3 | 863 | 6,187 | unavailable | unavailable | `5bba21112412` | `cbf2ac99461f` |
| 5 | `a3` | `blank` | `none` | 0 | 694 | 4,947 | unavailable | unavailable | `1622d780b0fd` | `acc744a9347e` |
| 6 | `b3` | `kaal` | `opened` | 3 | 893 | 6,458 | unavailable | unavailable | `2c19cdcfb335` | `f0967a5bc6f1` |
| 7 | `a4` | `blank` | `none` | 0 | 698 | 4,793 | unavailable | unavailable | `ca3a0e15ea05` | `a02474355e29` |
| 8 | `b4` | `kaal` | `opened` | 3 | 806 | 5,726 | unavailable | unavailable | `9f386fb8b173` | `f7bc9d9b71d6` |
| 9 | `a5` | `blank` | `none` | 0 | 753 | 5,023 | unavailable | unavailable | `1207e612b7aa` | `8a12c1df9573` |
| 10 | `b5` | `kaal` | `opened` | 3 | 936 | 6,554 | unavailable | unavailable | `afaf43ef7a00` | `f0e9bd25c53b` |

Full digests are recorded in `evidence/manifest.json` (`5910255f515fd6eb5ea10699d9d570353743dad2b13cdd686db3dab53e5abb08`) and `evidence/arm-mapping.json` (`f2e02ce9bc5391987f4875f64d8250c37cf6f48da87aade4be390c13f7bb7925`).

### Exposure Verification (Factual Trace Summary)
- **Arm A (`a1`–`a5`):** `exposure: none` across all 5 runs (`0` tool calls observed in Antigravity Cloud UI; no repository, project, or KAAL skills attached; documented in `evidence/excerpts/a1.audit.txt`–`a5.audit.txt`).
- **Arm B (`b1`–`b5`):** `exposure: opened` across all **5 of 5** runs, backed by verbatim operator-captured Antigravity Cloud UI tool-call steps in `evidence/excerpts/b1.excerpt.txt`–`b5.excerpt.txt`. Every Arm B run executed the same 3-step retrieval pattern inside `ChBrain/test-kaal`:
  1. `rg -i ratchet` workspace search against `/home/antigravity/ChBrain/test-kaal` (or `.`),
  2. `Viewed modes.md:1-35` (`skills/kaal-controls/references/modes.md`),
  3. `Viewed judge-mode.mjs:1-50` (`skills/kaal-controls/scripts/judge-mode.mjs`).
- **Factual trace observation (non-evaluative):** All 5 Arm B runs located `modes.md` and `judge-mode.mjs` directly via workspace ripgrep search rather than via `skills/INDEX.md` or `skills/kaal-controls/SKILL.md`, and all 5 Arm B raw outputs include explicit file/symbol links (`ChBrain/test-kaal/skills/kaal-controls/...`, `modes.md`, `judge-mode.mjs`, `judgeMode`, `applyBaseline`). Under frozen `key.md` Rev 2, the presence of explicit KAAL file/symbol cues means the conditional de-identification sensitivity pass (`Judge 3`) will be triggered in CHECK.

---

## 4. Deviations and Execution Conditions Disclosed

1. **Interleaved launch with partial Cloud concurrency:** Runs `a1, b1, a2, b2` were launched sequentially interleaved (`2026-11-24T09:22Z`–`12:46Z`), and runs `a3, b3, a4, b4, a5, b5` were launched in interleaved order (`12:46Z`–`12:50Z`) and ran concurrently in isolated ephemeral Antigravity Cloud sessions before verbatim collection (`16:03Z`–`16:12Z`). Because each Cloud chat uses an independent ephemeral session/VM, concurrent execution introduced no cross-run contamination.
2. **Cloud Project wrapper on Arm B:** Antigravity Cloud requires a Project to mount a GitHub repository. Arm B (`b1`–`b5`) therefore executed inside a clean disposable project (`E1-Arm-B`, zero instructions, only `ChBrain/test-kaal` attached), whereas Arm A (`a1`–`a5`) executed as standalone Cloud chats outside any project.
3. **Unavailable timing/token metrics (`M3`, `M4`):** Per-run wall-clock durations and token/turn counts were not surfaced in the Antigravity Cloud UI exports and are recorded honestly as `unavailable` in `evidence/metrics.json` (`71a7495daf1a61e83b099acaf6b2b1adad3ea38e559ec171a0270e93c4979fe4`).
4. **No optional stopping or run replacement:** All 10 planned runs completed cleanly on the first attempt (`n = 5` per arm); zero runs were dropped, retried, or added.

---

## 5. Stopping-Condition and Governance Boundary Check

- **Normal completion (`n = 5` per arm):** Met (`10 / 10` archived verbatim).
- **Contamination check:** Zero Arm A runs had KAAL repo/project/skills attached or invoked tools; zero Arm B runs accessed `Kai-Hacks-AI/KAAL` or `E1-ratchet-understanding/` (`plan.md`, `key.md`).
- **Comparability check:** Identical runtime (`Antigravity Cloud`), identical model/settings (`Medium neon`), identical verbatim `prompt.txt`, single turn only across all 10 runs.
- **Governance boundary check:** Zero changes to KAAL packages, capabilities, controls, workflows, or rulesets.

---

## 6. Evidence Index (`evidence/`)

- `evidence/manifest.json` — SHA-256 manifest of all 27 frozen/DO artifacts (`5910255f515fd6eb5ea10699d9d570353743dad2b13cdd686db3dab53e5abb08`)
- `evidence/provenance.json` — full execution provenance, timestamps, manual orchestration disclosure, deviations (`681982eb90b90c2dc95b7c783345974e7190bc538adf9bb93838de4b84619a07`)
- `evidence/treatment-manifest.json` — all 91 files of `ChBrain/test-kaal@f35a04c5d3e09aedba6ab5fa06b08af40dabd847` tagged by origin (`d7fbbf476119db6a7ed1e4c25aca0716011ed2f679ec8b0c7c8701aa95511562`)
- `evidence/arm-mapping.json` — run-to-arm mapping, exposure classifications, and file hashes (`f2e02ce9bc5391987f4875f64d8250c37cf6f48da87aade4be390c13f7bb7925`)
- `evidence/metrics.json` — deterministic Track 3 objective metrics (`M1`–`M4`) (`71a7495daf1a61e83b099acaf6b2b1adad3ea38e559ec171a0270e93c4979fe4`)
- `evidence/raw/a1.md`–`a5.md`, `b1.md`–`b5.md` — verbatim raw subject outputs
- `evidence/excerpts/a1.audit.txt`–`a5.audit.txt`, `b1.excerpt.txt`–`b5.excerpt.txt` — Arm A provenance audits and Arm B verbatim UI tool-call trace excerpts

Awaiting CPO review and acceptance of this DO PR before beginning blinded CHECK evaluation (`check.md` and `RH2.md`).
