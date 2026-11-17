# C62 change

## PLAN

1. Add the drafts in `interface.md`.
2. Add the Cases T810 and T811, both RED (`evidence.md`).
3. Observe the expected RED, and that each Case can pass with the DO's content.
4. The PLAN changes no finder, no control and no Case of another Change.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C62`, Cases T810 to T819 (two used). No gap id.

## DO

On the merged PLAN, into the collector of this Change, apply `controls/C12-status-on-main.patch` as the controls thread delivered it (the diff of main to the finished tree of controls/C12, 33 files, in `/mnt/project-files/controls/`): the finder, the Skill pointers and `check-controls.mjs`, the amended old Cases, and the status of release/CTL1, CTL2, CTL7, CTL8 and CTL9 with T540, T600 and T750 to T752 ignoring the status line. Rename T810 and T811 from `.red.mjs` to `.test.mjs` when green.

Any file this Change changes is changed identically in controls/C12, or its SYNC stops being a pure merge.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Where this DO sits (architecture)

Engineering is the X+1 lab; the Package (`packages/kaal-controls`) is the consumer-agnostic product and owns `AGENTS.md`, `SKILL.md`, references and scripts; `.kaal/` is the operational copy of a published package and stays on the released version until a new package reaches npmjs. This DO changes only the Package (the finder, `check-controls.mjs`, the Skill and two references) and Engineering's own controls and Cases. It does not touch `.kaal/`. The Package depends on nothing in Engineering, and the finder names no consumer.

The four ways to reach the same Controls framework, and where each stands:

| Way | What it is | Where it stands |
| --- | --- | --- |
| SCRIPT | deterministic discovery and validation of declared controls, reproducible findings with a recovery line, no agent judgement | this DO: the finder lists every declared control, complete or not, with `valid`, `problems` and `rank`; `check-controls.mjs` validates and exits 1 on a problem |
| SKILL | an agent guided by `SKILL.md`, references and scripts; judges what a script cannot, such as the status from evidence | exists, and this DO adds `judging-status.md` and the status in `declaring-controls.md`; undeclared candidates are not yet investigated |
| AGENT | an agent guided by a package `AGENTS.md` that knows when and how to use the framework and the Skill | not yet: the Package has no `AGENTS.md`; a later Change |
| BARE | an unguided prompt, the last resort when KAAL offers no help | stays the fallback |

SKILL and AGENT are guided entry points into the same framework, not competing implementations. BASS (script, skill, agent, bare) is a general KAAL concept, not specific to Controls.

Deferred, each its own Change: finding possible undeclared controls (`list-candidates`) and controls without coverage (`list-uncovered`), the Package `AGENTS.md`, and recovery that an agent can begin. Deployment into `.kaal/` follows only a publication on npmjs.

Incomplete declarations stay visible: before, a control with a missing field or an unknown type was dropped into `refused` and was not in `controls`; now it is in `controls` with `valid:false` and each problem names its field, reason and recovery. Consumers of the finder stay compatible: nothing is removed, `refused` is kept with the first reason as before, and the new fields are additive. The one behaviour that changes is for a consumer that read `controls` as only the valid ones. In this repository those are the release control Cases (T540, T600, T750 to T752) and the Package's own Cases, which this DO amends for `status`. This file is not part of the patch of controls/C12, so the pure SYNC is not affected.

## Left open

- Whether the status of a control is checked at a gate: controls/C12 and the Owner decide, not this Change.
