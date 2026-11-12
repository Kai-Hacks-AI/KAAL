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
4. Only then the wiring, `pull/C2` ([../pull-wiring/](../pull-wiring/00-changes.md)): the part that reads the real host for KAAL. It is its own PLAN, with its own wiring collector, and lands after this Change is done (Owner, 12 Nov): the core reason is to prevent cheating, since a wiring that lands first lets the contract be weakened until it goes green.

The DO is accepted on T1 to T13, which include the recording of a real collector (T13). The live proof on the real host belongs to the wiring Change, `pull/C2` (T14).

## Constraints kept

Promotion WIP stays one (the Script cannot make a second promotion ready). No change to checks, rulesets, hooks, Guard, CI or retirement of any control. No PR creation, auto-merge, scheduling or approval. No bypass of protected `main`. The promotions of C10, C9 and C11 are not touched.

## What the first experiment will not prove

- That the allocation of judgments to controls is right; it is a candidate allocation the CPO verifies.
- Selection among collectors: it judges one named collector and reads whose turn it is from Analyze Flow.
- Any Change that spans collectors: such work is decomposed into separate dependent Changes, and a legacy record is only identified and reported incomplete.
- That READY is safe: no collector has been READY yet on real evidence. The recorded real collector is BLOCKED.
- That the Script can read the host itself: the Engineering adapter that gathers the facts is the wiring Change `pull/C2`.
- That the checks' conclusions say why they failed (see analysis.md, M2).
- Anything about publishing, hotfix routes, DO or ACT proposals, scheduling or automation.

## Out of scope

Any write; changing Analyze Flow's Script or contract (the four additions are requested of its owner, not made here); retiring track Work or any control.
