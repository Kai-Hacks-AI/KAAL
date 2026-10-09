# Evidence

Everything here was read or run in this Change. Nothing was sealed, nothing in PR #72 was touched, no helper was started to act as a Reviewer, and nothing below is a review of this Change.

## 1. The Codex trial on #72, as it happened

Sources: PR #72 conversation and review, read 2026-10-09 (head `8fb16da`).

- **The request** (Owner comment, 07:05 UTC): `@codex review`, "experimental, narrowly scoped lens review only". It named the Way of Working (`kaal-intent`), the discipline (`kaal-review`), the subject ("only this Change's `work/01-intent.md`"), the question ("does it clearly establish what is wanted and why, intended outcomes and boundaries, without prematurely prescribing Requirements, Architecture or implementation?"), the instruction to "ground findings in the actual Skill guidance", and the standing: "observation only… not an authorized ROWING convergence judgment"; the Worker was told not to change the Work.
- **The result** (review state `COMMENTED`, 07:08): one inline P2 thread on `work/01-intent.md` lines 79 to 82 ("Keep the downstream work plan out of the Intent"). It says the `Expected Work` section and the line "Do not implement until the architectural direction has been reviewed" are "prescribed work and process rather than wanted end states or boundaries", cites `packages/kaal-intent/skills/kaal-intent/SKILL.md:19-20,28-30`, and concludes an outcome-equivalent realization could violate the Intent merely by following a different workflow.
- **After:** the head of #72 was still `8fb16da`, the commit reviewed. The finding lives in a GitHub thread, not in the Change record.

I checked the citation: lines 19 and 20 are steps 2 ("Say what is wanted and why… the boundaries") and 3 ("Keep how out"); lines 28 to 30 are the rules ("Do not put Requirements, Architecture or implementation in an Intent…"). It quotes the Skill accurately.

## 2. What it demonstrates

1. **Two independent Skills compose for a targeted review with no change to either.** `kaal-intent` supplied the standard, `kaal-review` was named as the discipline, the comment supplied the relationship. Neither Skill needed to name the other for the finding to arise.
2. **The result is an internal-position finding**: an Intent examined against the Way of Working of the capability that describes Intents, with the standard cited from the Skill's own text. This is the "Intent adequacy" lens working once.
3. **A targeted review yields a useful, anchored finding without establishing convergence.** The review state is `COMMENTED`; nothing in the Change moved; the Owner's framing ("not an authorized ROWING convergence judgment") held without any machinery.
4. **The finding is about an established, fixed Intent.** The Change cannot resolve it (the Intent is the fixed target); only the Owner can answer it, possibly with another Intent. That is the timing point in R12: an internal lens on an established subject informs; it does not gate.
5. **The finding needs judgment, which is what a lens is for.** Step 3 of `kaal-intent` carries an exception: a method "the Owner actually wants (for example 'it must not use X'): that is a boundary, and it stays". "Do not implement until the architectural direction has been reviewed" may be exactly that. The finding does not weigh the exception. I do not decide which reading is right; it is the Owner's. It shows why a lens states a *question* and does not issue a verdict, and why its output is information until someone with the authority acts on it.

## 3. What remains unproven

| # | Not shown | Why |
|---|---|---|
| U1 | **Discoverability.** That an Agent finds the right lens without being told. | Every part of the lens was supplied (§4). Neither `kaal-intent` nor `kaal-review` is installed in this repository's `.kaal/skills`; they were read from `packages/`, the Engineer-mode source tree. Core's `installedSkills()` was not in the path. |
| U2 | **That `kaal-review`'s discipline was applied.** | The output is Codex's native PR review (P2 badge, inline thread). No result identity was named, no Reviewer statement of authority and independence, no round. The comment asked for it by name; whether it was read is not visible. |
| U3 | **Generality.** | One run, one provider, one subject, the easiest lens: a short prohibition list in a SKILL.md as the standard. The external lens (fulfilment) and every lens whose capability has no Way of Working (G4) were not tried. |
| U4 | **Reproducibility.** | No second run. A weaker prompt may produce a different finding or none. |
| U5 | **That the finding is right.** | Unadjudicated (§2, point 5). |
| U6 | **That a Process improves on explicit instruction.** | No counterfactual: there was no run without the comment's naming. |
| U7 | **Independence or seat.** | Codex acted at the Owner's request under no Change assignment; the Owner said so. Nothing here bears on the Reviewer seat. |
| U8 | **Other operating modes.** | It ran in Engineer mode, in this repository. |
| U9 | **That findings reach the record.** | The finding is in a PR thread. Nothing carried it into `work/` or a retro, so whether it will be learned from depends on someone doing so (R16). |

## 4. Explicit instruction versus a Process making the lens discoverable

What the GitHub comment supplied, part by part, against what a Process statement would have to supply for an Agent that was *not* told:

| Part of the lens | In the Codex trial | In the model |
|---|---|---|
| Subject | named: "only `work/01-intent.md`" | the Process says what kinds of subject it has lenses for (an Intent); the Agent supplies the file |
| Standard | named: "`kaal-intent`" | the Process names it by `{name, id}`; the Agent follows the pin |
| Expectation | stated as a long question, close to a paraphrase of `kaal-intent` steps 2 and 3 | the Process states the question once |
| Discipline | named: "`kaal-review`", with the instruction not to act | the Process names Review; the round form is Review's |
| Standing | stated: not convergence, observation only | the Process states it; absent, the default is information |
| Timing | not stated; the Intent was already established | the Process states it (R12) |
| Boundary | one file | the Process states the Change it applies in |

**What follows:** the comment is a one-off, human-supplied *instance* of the composition; the Process would be the same information held once, pinned to the capability bytes, and found by an Agent without being retyped. Whether that makes a difference to an Agent is exactly U1 and U6, and this trial cannot show it. It shows that the composition is *possible and useful* when supplied; it does not show that a Process is *needed* to supply it, only that supplying it by hand cost a long comment and depended on the Owner knowing the Skill names.

## 5. Scratch runs (not committed; commands and outputs)

Setup: a copy of this repository's `.kaal`, a throwaway Change allocated with `next-change --date 2030-01-01`, a deliberately flawed Intent file (`We want X, and we want it built with tool Y, in three phases.`), the repository's scripts for `kaal-intent`, `kaal-review` and `kaal-changing`. `R` is the repository root.

```
node $R/packages/kaal-intent/skills/kaal-intent/scripts/intent.mjs check work/01-intent.md            # exit 0
node $R/packages/kaal-intent/skills/kaal-intent/scripts/intent.mjs identity work/01-intent.md         # c5719966…1f49
node $R/skills/kaal-changing/scripts/change-state.mjs <kaal> <change>                                  # WORK OPEN, next: Reviewer writes review/01.md naming work c0443034…c9baf

# a targeted lens round, outside review/
node $R/packages/kaal-review/skills/kaal-review/scripts/review.mjs write lenses/intent-adequacy/01.md \
  --of Intent --identity c5719966…1f49 --outcome findings \
  --reviewer "…holds no Reviewer seat. Information only." --findings "…"                              # exit 0
review.mjs check lenses/intent-adequacy/01.md                                                          # exit 0 ("01.md says findings")
review.mjs converged lenses/intent-adequacy c5719966…1f49                                              # exit 1 (findings)
change-state … (again)                                                                                  # output identical to the first run

# the same kind of round, placed in review/
review.mjs write review/01.md --of Intent --identity c5719966…1f49 --outcome converged --reviewer "…"   # exit 0
change-state …                                                                                          # problem: review/01.md is malformed: it needs exactly one "Work: <identity of work/>" line…
```

Read as: Review writes a round for any named result and identity; a round outside `review/` does not change the Change's compass; a round inside `review/` for another result is rejected by the compass, not by Review. The separation of a targeted review from the authorized independent review is already structural.

**Not run:** `check-kaal-admission` on a closed Change that holds a directory other than `work/`, `review/` and the retros; any closing or sealing; any Process statement as a Node (none exists); any lens against a subject other than an Intent; any run in Embed or External mode.

## 6. A proposed trial for what is unproven (not run)

To separate U1 and U6 from explicit instruction. It is for the Owner to assign; a Worker-side run is a probe, not evidence of independence, and does not substitute for an assigned Reviewer.

- **Host.** A scratch KAAL with `kaal-intent` and `kaal-review` installed (they are optional), a `work/01-intent.md` containing a how-leak, no Skill names in any prompt.
- **Trial A, no Process statement.** Prompt: *"Review this Intent."* Record, per run: did the Agent reach `kaal-intent`'s Way of Working; did it use `kaal-review`'s form; did it state its authority and position; did it cite a standard other than its own taste.
- **Trial B, an illustrative Process statement installed** (the Option 1 shape in the Architecture, in the scratch host only). Same prompt, same four observations, plus whether it cited the Process.
- **Three runs per trial,** ideally with a second provider, since one run proves nothing about variance.
- **A pass for the model** is B reaching all four where A reaches fewer, on the same prompt. **A fail** is no difference, or B citing the statement while ignoring the standard. **What it cannot show:** independence, correctness of findings, or any mode but the one the host is in.

## 7. Provenance and limits

- `work/01-intent.md` is the Owner's briefing in his wording, with markdown headings added and the two heading lines combined into a title. It was checked with `intent.mjs` (exit 0, identity `b3f9b6bd…8f45`). It has not been established by the Owner through `kaal-intent`, which records nothing; the identity is what a round would measure against.
- It contains an `Expected Work` section and a "Prepare a PR" instruction. The lens the Codex trial used would flag the same pattern here; see Question 11 in the Architecture.
- Reading of #72 is as of 2026-10-09 07:08 UTC; #72 is in review and may change. Nothing here depends on it being accepted.
- Change number: `09/01` is the next free number on `kaal/genesis` today (`next-change`, no `09` exists there). Open #70 and #72 hold `08/04`. If another PR also takes `09/01` before this lands, the later one renumbers whole; the address is not part of a Change's identity.
- I read the repository at `kaal/genesis` 752db5e. I did not run `npm test`; this Change adds only files under its own `work/`.
