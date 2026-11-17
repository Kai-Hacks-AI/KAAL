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
- It stores no state and no pointer to its test. A Case that tests the control points back to it with a first line `// Case <id> tests: <control id>`, and sits beside the control, as `CTL<n>-<slug>/CTL<n>.md` and `T<n>.test.mjs`.
- Ids are unique. A Change id such as `<capability>/C8` is not a control.

## Finding

To list every control in a directory, run `node scripts/find-controls.mjs <directory>` from this Skill. It lists **every** control, complete or not, so an incomplete declaration never disappears from the inventory. Each control carries its fields, its `status` as declared, a `rank` from 1 (`designed`) to 4 (`tested`) when the status is valid, `valid`, and `problems`. A problem names the `field`, the `reason` and a `recovery`. `refused` is the view of the controls that fail validation, except a control that only lacks a `status` line: that one is listed with `valid: false` and its recovery. It only finds: it does not resolve an Intent, walk to Requirements or Architecture, run a Case or check a gate, so a listed control is not a checked one.

## Checking

`node scripts/check-controls.mjs <directory>` prints every control it found with its status and whether it is valid, prints each problem with its recovery on stderr, and exits 1 if any control is invalid. Fix an invalid control by editing its declaration as the recovery says. The check never writes a declaration and never chooses a status: choose the one the evidence supports.
