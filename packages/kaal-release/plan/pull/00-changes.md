# Pull Promotion: Change (A to B)

This is `pull/C1`, a PLAN Change. It ships no code and changes no repository state. It adds one read-only script to the `kaal-release` Skill, `pull-promotion.mjs`: for one named collector it says whether the collector is READY, BLOCKED or NOT JUDGED for promotion, which control owns each judgment, what evidence is missing, and what to do next. It authorizes nothing and acts on nothing. Its ids are in the scope `pull/`, so they collide with neither `coordination/` (analyze Flow) nor `release/`.

Authorized by the Owner (12 Nov 2026) for a PLAN only. The DO needs the CPO's review of this PLAN first.

## A: the present

- Engineering decides by hand which collector is promoted next. Analyze Flow (`coordination/C1`, #1446, merged into this collector) lists the next actions of a flow whose pairs are declared, but it does not say whether a collector is fit to be promoted: it reads pieces, not evidence from Testing, Guard, Review or the Change.
- The Owner's hypothesis of readiness is "PLAN, DO, Check and ACT done; nothing red; everything landed in the collector". The Owner's decision of 12 Nov makes it precise: a Change is scoped to one collector and driven there through its own PLAN, DO, Check and ACT; the ACT must land in that collector before the Change is eligible for promotion. Work spanning collectors is decomposed into separate Changes, each with its own identity, evidence and closing ACT, related by explicit dependencies. It has not been tested against a real collector.
- Some legacy records predate that rule and spread one Change over several collectors (release/C14: the `.github` DO in `kaal/release/wire-fallback-template`, the PLAN and the engineering part in `kaal/release/fallback-template`; release/C10: its `.github` half and its engineering half travelled as a pair). They are identified in this PLAN, not retroactively treated as compliant.

## B: the target

One deterministic script in the Skill turns Analyze Flow's facts and findings, the consumer's declaration and the evidence of the participating controls into a verdict for one collector, traceable judgment by judgment to the control that owns it. It composes: Analyze Flow keeps the flow, the lane and the actions; each control keeps its own authority; the Script only combines their answers and never lets missing evidence pass. See [requirements.md](requirements.md) and [testing.md](testing.md). The four questions of the handover are answered in [analysis.md](analysis.md).

## The route

1. This PLAN, with its recorded real evidence and RED Cases, into the `kaal/release/plan` collector after CPO review.
2. DO (not authorized yet): the Script and its CLI. T1 to T13 go GREEN; T13 runs on evidence recorded from the real repository.
3. ACT, on the collector once everything is green (Owner, 12 Nov). The Script judges the same rule of the Changes it judges.
4. Only then the host integration, `pull/C2` ([../pull-integration/](../pull-integration/00-changes.md)): the read-only adapter and command that obtain the facts from the real host for KAAL. It is its own PLAN, with its own collector, and lands after this Change is done (Owner, 12 Nov): the core reason is to prevent cheating, since an integration that lands first lets the contract be weakened until it goes green. Wiring in the KAAL sense, a hook or CI trigger that runs the command automatically, is a further Change that is not planned here (CPO, 12 Nov).

The DO is accepted on T1 to T13, which include the recording of a real collector (T13). The live proof on the real host belongs to the integration Change, `pull/C2` (T14).

## Constraints kept

Promotion WIP stays one (the Script cannot make a second promotion ready). No change to checks, rulesets, hooks, Guard, CI or retirement of any control. No PR creation, auto-merge, scheduling or approval. No bypass of protected `main`. The promotions of C10, C9 and C11 are not touched.

## What the first experiment will not prove

- That the allocation of judgments to controls is right; it is a candidate allocation the CPO verifies.
- Selection among collectors: it judges one named collector and reads whose turn it is from Analyze Flow.
- Any Change that spans collectors: such work is decomposed into separate dependent Changes, and a legacy record is only identified and reported incomplete.
- That READY is safe: no collector has been READY yet on real evidence. The recorded real collector is BLOCKED.
- That the Script can read the host itself: the Engineering adapter that gathers the facts is the integration Change `pull/C2`.
- That the checks' conclusions say why they failed (see analysis.md, M2).
- Anything about publishing, hotfix routes, DO or ACT proposals, scheduling or automation.

## Out of scope

Any write; changing Analyze Flow's Script or contract (the four additions are requested of its owner, not made here); retiring track Work or any control.

## ACT: retrospective (4L)

Written by the agent that carried the Change.

### Liked

- Writing each Case as a runnable RED file before any code made the DO mechanical: the reference script went green on T1 to T13 unchanged, and the later reviews added Cases, never rewrites.
- Using a real recorded collector (T13) kept the model honest: the verdict BLOCKED came from the repository's own state, not from a fixture I could tune.
- The CPO's findings were all about a boundary, never a detail: an Owner hold must never recommend a proceed action, a missing fact must never read as unrelated, a prose gap is not a structured gap. Each became a Case that fails on the earlier script.

### Learned

- The data an upstream script emits is part of its contract even when its contract text says nothing about the shape. Analyze Flow's gaps are prose, and I first read them as objects because my own fixtures were. The Case that uses the upstream wording found it at once.
- Missing evidence needs a rule for relevance, not a flag: a gap is relevant when it names something the judgment reads, unrelated only when it names only things outside the collector or the consumer's declaration says so, and anything undecidable fails safe.
- A phase that moves a script into a package touches the package's own claims. "One hosted Script" in the README and in release/T9 had to change, and the PLAN had not said so.
- A DO may start when its PLAN is merged into the collector. I waited for a separate go because the handover said PLAN only, and the Owner said a merged PLAN is the allowance.

### Lacked

- Analyze Flow's Script in the package, so no Case runs both scripts end to end on one real collector. The two meet in data, and the data shape was only checked against recorded wording.
- A fixture of the real host's gaps in the string form. T17 uses the wording of Analyze Flow's own Cases, not captured output.
- Knowledge up front that `pull/T14` and F14 to F18 belong to the wiring PLAN, so the DO's new Cases are T15 to T17 and the Case numbering has a hole.

### Longed For

- Analyze Flow giving each gap a machine-readable subject, so relevance is read, not matched on prose.
- The wiring Change (`pull/C2`) running the Script on the real repository, which is the only proof that READY can ever be reached.
- A KAAL declaration with `gapRules` for the known limitations, so a verdict on a real collector can be anything but NOT JUDGED for want of a classification.
