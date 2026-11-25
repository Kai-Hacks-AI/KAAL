# Declaring and finding controls

A control a repository wants to manage is a Markdown file whose frontmatter holds exactly:

```
id: <capability>/CTL<n>
title: verify Stages (Developing)
description: One short sentence on what the control is for.
type: detective
status: designed
has: [<capability>/I3]
```

- `type` is mandatory and is one of `directive`, `preventive`, `detective` or `corrective`, in lower case. It says what the control does when the rule is broken (see the types in the Skill), not how it is built.
- `status` is mandatory and is one of `designed`, `implemented`, `running` or `tested`, in lower case. It says how far the control has come, and each value includes the ones before it: a tested control is also running, implemented and designed.
  - `designed`: declared, with its Intent, Requirements and Architecture saying what it does.
  - `implemented`: the mechanism exists, but does not yet run on the boundary it is meant for.
  - `running`: the mechanism runs on its boundary and reports.
  - `tested`: evidence shows the control works as intended.
  A status is a claim. The check below tests that it is declared, not that it is true: see `references/judging-status.md`.
- `has` lists the Intents the control has, at least one. The control names nothing else: the Requirements, the Architecture and the mechanism are reached from the Intent.
- `stations` is optional: `stations: [Integrating:preventive]`, a list of `<Station>:<mode>`, each station once. It says where the control is meant to judge and how. See `references/enforcing-controls.md`.
- `strategy: ratchet` is optional and only for a `preventive` control, with `baseline-source` (the path of its JSON baseline file, a list of unique names), `owner` and `exit`, all three. It says the control is a temporary ratchet, not a station mode. The three fields without it are listed as a problem. See `references/modes.md`.
- `evidence` is optional and says what the control needs before it may claim `tested`. Evidence is the control's own Test Cases run against an X, so it adds no new kind of test: `evidence: [fixture:3, merge:2, provoked:1:fail]` is a list of `<x>:<runs>`, each x once, runs from 1, and it reads: at least that many runs of the Cases of this control against that kind of X. An X is any lower-case word the control chooses for what a Case ran against: a fixture, a real merge or pull request, a provoked case, a before and after pair of trees. At least one entry ends `:fail`: an X that is a real failure, so a Case that is GREEN on it, where the same Case was RED on that failure without the control's mechanism, shows the control rightly caught it. See `references/judging-status.md`.
- It stores no state and no pointer to its test. A Case that tests the control points back to it with a first line `// Case <id> tests: <control id>`, and sits beside the control, as `CTL<n>-<slug>/CTL<n>.md` and `T<n>.test.mjs`.
- Ids are unique. A Change id such as `<capability>/C8` is not a control.

## Finding

To list every control in a directory, run `node scripts/find-controls.mjs <directory>` from this Skill. It lists **every** control, complete or not, so an incomplete declaration never disappears from the inventory. Each control carries its fields, its `status` as declared, a `rank` from 1 (`designed`) to 4 (`tested`) when the status is valid, `valid`, and `problems`. A problem names the `field`, the `reason` and a `recovery`. `refused` is the view of the controls that fail validation. It only finds: it does not resolve an Intent, walk to Requirements or Architecture, run a Case or check a gate, so a listed control is not a checked one.

## Checking

`node scripts/check-controls.mjs <directory>` prints every control it found with its status and whether it is valid, prints each problem with its recovery on stderr, and exits 1 if any control is invalid. Fix an invalid control by editing its declaration as the recovery says. The check never writes a declaration and never chooses a status: choose the one the evidence supports.
