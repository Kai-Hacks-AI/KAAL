---
id: research/RH2
kind: rehearsal
question: Does access to KAAL improve an otherwise identical agent's explanation of a ratchet in software engineering governance?
verdict: inconclusive
verdict-about: comparison
verdict-rests-on: c2, c3
---
Companion kaal-research rehearsal record for E1 (engineering/research/experiments/E1-ratchet-understanding/check.md), emitted under CPO disposition C-1. Track 1 (general domain-standard understanding, 0-18) and Track 2 (KAAL governance-model alignment, 0-15) are reported separately per CPO PLAN review; primary verdict scope is comparison per CPO disposition C-5.

## Design
arms: blank, kaal
untreated: blank
n: blank=5, kaal=5
fresh-means: ten brand-new standalone Antigravity Cloud single-turn chats outside the KAAL project, launched manually by the human operator (Option I-A1); blank arm had zero repository, zero project, and zero KAAL skills attached; kaal arm ran in clean disposable project E1-Arm-B attached only to ChBrain/test-kaal@f35a04c5d3e09aedba6ab5fa06b08af40dabd847 (91 files: 89 verbatim from Kai-Hacks-AI/KAAL@3aafe4f708bd6ce16293d5bd6b6410de8c345449 plus 2 neutral staging index files AGENTS.md and skills/INDEX.md, fresh ephemeral VM clone per chat); launches a1, b1, a2, b2 ran sequentially interleaved and a3..b5 ran interleaved with Cloud concurrency
model: Medium neon (Antigravity Cloud)
settings: default settings, single turn, no follow-ups, verbatim prompt.txt
blind: no
blind-how: deterministic seeded shuffle of a1..a5 and b1..b5 into neutral labels s01..s10 (evidence/blinded/blind-mapping.json withheld from judges); two independent fresh Antigravity judge sessions (judge-1, judge-2) scored evidence/blinded/packet-raw.md against frozen key.md, plus a third independent judge session (judge-3) scored minimally brand-and-path-redacted evidence/blinded/packet-redacted.md (diff in evidence/blinded/redaction.diff); effective blinding was NOT achieved because all three judges guessed 10/10 arms correctly from workspace links, redaction placeholders, and KAAL schema tokens (new-finding, baseline-grew, stale-allowance, baseline-source, spent)
key-frozen: 2026-11-24T09:10:30Z
treatment-fixed: 2026-11-24T09:12:13Z
## Evidence
- role: prompt
  path: prompt.txt
  sha256: 980505144df299fb524e3de1e678fc2cb2a7bc79cc8049af90b6332464993008
- role: key
  path: key.md
  sha256: ce927764377623bc1ae5f0595dfe76a8205d1e4197a2eb0e38e26208758a590a
- role: rubric
  path: key.md
  sha256: ce927764377623bc1ae5f0595dfe76a8205d1e4197a2eb0e38e26208758a590a
- role: answers
  path: evidence/raw/a1.md
  sha256: 8b3ba059e6fd22a71006ccfd898fc85e961433d008c2d11b2c50be2445127a29
- role: answers
  path: evidence/raw/a2.md
  sha256: 4d121c293d5ed5253d3f02a56e70d6c4528992c67633380db95b52f5dd94120d
- role: answers
  path: evidence/raw/a3.md
  sha256: 1622d780b0fd74fd2f85d4da0c09000bd7cc6e2b4c9a9f60275ad88d5f7ee531
- role: answers
  path: evidence/raw/a4.md
  sha256: ca3a0e15ea054a9dd653c5e307edacd2a0a87f864f5801b30dcecf672eb5ae1f
- role: answers
  path: evidence/raw/a5.md
  sha256: 1207e612b7aad0a0e98be28ca14ff9adf484e04d0f0c87a785923fc5087b2f5c
- role: answers
  path: evidence/raw/b1.md
  sha256: c09ea27f81ae419ae7d2d41ef78116777def36720c4d72a9c7b1d061c7ac5fc5
- role: answers
  path: evidence/raw/b2.md
  sha256: 5bba211124123162a5f730990b6d87c9e8b9a42810dfe317b51d84f5d3bc2cf6
- role: answers
  path: evidence/raw/b3.md
  sha256: 2c19cdcfb335edad6fb01cc7984df5066c9b6de700c6996c777279528fb5ac5e
- role: answers
  path: evidence/raw/b4.md
  sha256: 9f386fb8b1732a6db7294a049e81abde0159bda0d52e20359bd8801ce3f26a03
- role: answers
  path: evidence/raw/b5.md
  sha256: afaf43ef7a00e9d4872e5f3c1ffcab0be1819f161de161796ca6c64cb45e7134
- role: scores
  path: evidence/blinded/judge-1-scores.json
  sha256: 1505067f0d74da6ddbb64719cce91ee38acbf8e45582904d993167584e68f049
- role: scores
  path: evidence/blinded/judge-2-scores.json
  sha256: a13358ed7fe0de1a91cdbbd140aac49698150873a7fba54463da08db8c29bec9
- role: scores
  path: evidence/blinded/judge-3-scores.json
  sha256: 2db4e50c51bb0a8c1a65bd969873f3110163405cdcea6f185befa1b255fa3c5e
- role: scores
  path: evidence/metrics.json
  sha256: 71a7495daf1a61e83b099acaf6b2b1adad3ea38e559ec171a0270e93c4979fe4
- role: excerpt
  path: evidence/excerpts/a1.audit.txt
  sha256: f476703d7859d94c5a6cdf34acafa2be0bd9c4a00c353203e772100e3b49a84b
- role: excerpt
  path: evidence/excerpts/a2.audit.txt
  sha256: 58dec514575b8fc8937be960182c7c10ef57457574a83f1e13bfc9bdbcba6cbd
- role: excerpt
  path: evidence/excerpts/a3.audit.txt
  sha256: acc744a9347e5dbe0be40efa067b8f357c21ae5f5a802149924a5183aaefa478
- role: excerpt
  path: evidence/excerpts/a4.audit.txt
  sha256: a02474355e29ccc00ba3b8879287d365e0e0d441c2720b8a1ab1c980db5dd848
- role: excerpt
  path: evidence/excerpts/a5.audit.txt
  sha256: 8a12c1df957382a299877a6cded3d0efcac739557b9027c5e4a82a857cd37681
- role: excerpt
  path: evidence/excerpts/b1.excerpt.txt
  sha256: da7bd0c41b29287b14746bcdd3822e3b4ec4f41c064a1384e561fdbdb771e073
- role: excerpt
  path: evidence/excerpts/b2.excerpt.txt
  sha256: cbf2ac99461fb4804b84bbfe63de2881ca2c6401409bcb785e5cc22f7cc7fd56
- role: excerpt
  path: evidence/excerpts/b3.excerpt.txt
  sha256: f0967a5bc6f15fb0f47acc0e52631cf73824d93098f2af38ff3144d050665595
- role: excerpt
  path: evidence/excerpts/b4.excerpt.txt
  sha256: f7bc9d9b71d654d3240ebbb92ba6c297768e42636da15a5214abed6bccac240d
- role: excerpt
  path: evidence/excerpts/b5.excerpt.txt
  sha256: f0e9bd25c53b344096810add51b76c77aa5c2e2c8542a409b443d91815563fed
- role: treatment
  path: evidence/treatment-manifest.json
  sha256: d7fbbf476119db6a7ed1e4c25aca0716011ed2f679ec8b0c7c8701aa95511562
- role: mapping
  path: evidence/arm-mapping.json
  sha256: f2e02ce9bc5391987f4875f64d8250c37cf6f48da87aade4be390c13f7bb7925
- role: mapping
  path: evidence/blinded/blind-mapping.json
  sha256: 45189d73e0741e2725907a3a9041d55515df8f1b1ecfc5a6d2cef2961e738607
- role: subject
  path: evidence/blinded/packet-raw.md
  sha256: 59c06785d2137a69c2a66e3668a3bbb1ecec25b208e47d9c9875b1304d692318
- role: subject
  path: evidence/blinded/packet-redacted.md
  sha256: b81b31341cc1bd827db7278b0c3fb99b9c3d33d33ea6e0ecfe9fd8c86a2bb745
- role: subject
  path: evidence/blinded/redaction.diff
  sha256: d41b51b655b50de08cb52f0ca1918d3e5217141a97c0b19407483030e24aabe8
- role: provenance
  path: evidence/provenance.json
  sha256: 681982eb90b90c2dc95b7c783345974e7190bc538adf9bb93838de4b84619a07
## Runs
- run: a1
  arm: blank
  exposure: none
- run: a2
  arm: blank
  exposure: none
- run: a3
  arm: blank
  exposure: none
- run: a4
  arm: blank
  exposure: none
- run: a5
  arm: blank
  exposure: none
- run: b1
  arm: kaal
  exposure: opened
  excerpt: evidence/excerpts/b1.excerpt.txt
- run: b2
  arm: kaal
  exposure: opened
  excerpt: evidence/excerpts/b2.excerpt.txt
- run: b3
  arm: kaal
  exposure: opened
  excerpt: evidence/excerpts/b3.excerpt.txt
- run: b4
  arm: kaal
  exposure: opened
  excerpt: evidence/excerpts/b4.excerpt.txt
- run: b5
  arm: kaal
  exposure: opened
  excerpt: evidence/excerpts/b5.excerpt.txt
## Claims
- id: c1
  claim: all ten runs completed; zero of five blank runs called tools while five of five kaal runs searched the staged repository with ripgrep and opened skills/kaal-controls/references/modes.md and scripts/judge-mode.mjs without opening skills/INDEX.md or skills/kaal-controls/SKILL.md
  scope: description
  rests-on: a1, a2, a3, a4, a5, b1, b2, b3, b4, b5
  demonstrated: yes
- id: c2
  claim: on Track 1 (general domain-standard understanding, 0 to 18), the kaal arm had a small median and mean advantage (medians 14 to 15 and means 14.6 to 15.0 versus 13 and 13.8 to 14.4) driven by inherited-violation mechanics (G3), limitations (G5) and zero GT3 count-only traps versus two of five in blank, while blank unanimously outscored kaal on clarity (G6: 3.0 versus 2.0 on every run) and produced the highest single score (a5: 18 of 18 on two judges)
  scope: comparison
  rests-on: a1, a2, a3, a4, a5, b1, b2, b3, b4, b5
  demonstrated: partly
  not-shown: arm ranges overlap (13 to 18 versus 14 to 17), sub-dimensions move in opposite directions (G3 and G5 up versus G6 down), effective judge blinding failed (10 of 10 correct arm guesses on both raw and redacted packets), and five runs per arm on one prompt and one model cannot estimate rates or generalization
- id: c3
  claim: on Track 2 (alignment with KAAL governance design choices, 0 to 15), the kaal arm separated sharply without overlap from the blank arm across all three judges (kaal 11 to 14, medians 12 to 13 versus blank 2 to 3, medians 2 to 3), including unanimous 3.0 versus 0.0 on fail-closed UNKNOWN (K3) and 3.0 versus 0.0 to 0.6 on removable filter separation and mode-scoped claims (K5)
  scope: comparison
  rests-on: a1, a2, a3, a4, a5, b1, b2, b3, b4, b5
  demonstrated: yes
- id: c4
  claim: access to KAAL caused an improvement in general software engineering ratchet explanation quality
  scope: effect
  rests-on: a1, a2, a3, a4, a5, b1, b2, b3, b4, b5
  demonstrated: no
  not-shown: Track 1 ranges overlap with an opposite-direction clarity regression on G6; effective judge blinding failed (10 of 10 arm recognition on raw and redacted packets); underlying kaal-controls content at 3aafe4f existed before key.md was authored (key-frozen precedes treatment-bundle staging only); kaal arm also carried a disposable Cloud project wrapper; five runs per arm, single model, single prompt
## Limits
n-shows: five runs per arm show consistent structural patterns where arms separate cleanly (Track 2 governance choices, G3, G5, G6, and 5 of 5 ripgrep retrieval skipping SKILL.md), and show that Track 1 overall totals overlap across arms; five runs cannot establish statistical rates, effect sizes, or generalization to other models, prompts, or operational tasks
