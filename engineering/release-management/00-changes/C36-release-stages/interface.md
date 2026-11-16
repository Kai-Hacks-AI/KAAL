# C36 interface

## Draft of a Stage file (platform-neutral)

```
---
type: Release/Stage
order: 2
name: Integrating
subject: change-set
gates: [structure-verified]
authority: automatic
transition: integrate
destination: integration-line
parts: [Collecting, Hotfixing, Wiring]
---
What this Stage is for in this repository.
```

`parts` are alternate incoming paths into this Stage; each passes the Stage's gates. They are not Stages and not predecessors; predecessors follow from `order`. Gates and the destination are logical names the consumer chooses. A Stage file holds no branch, pattern, tag, check name, tool or platform.

## Draft of a binding (later Change, shown only to place platform data)

```
---
type: Release/Binding
platform: github
maps:
  destination:
    integration-line: "kaal/**, hotfix/**, wire/**"
    release-line: main
  gate:
    structure-verified: "Engineering / verify Stages (Integrating)"
    source-qualified: "Promotion Source"
---
```

This is where `main`, patterns and check names live. It reads the Stage files, adds no Stage and changes no gate. No binding is added by this PLAN.

## Draft of the judge result

```
{ "structure": "SOUND", "findings": [], "stages": ["Developing", "Integrating", "Promoting", "Publishing"], "authorization": "UNKNOWN", "readiness": "UNKNOWN", "bindingCoverage": "UNKNOWN" }
```

A sound structure is not an authorization and not readiness. There is no boolean to read either way.

## Draft of the Skill vocabulary reference

```
# Release stages

A release process is an ordered pipeline of Stages.

- A **Stage** is a step the Subject passes on its way to release.
- A **Subject** is what moves through a Stage: a change set, a collector or an artifact.
- A **gate** is a logical check identity a Subject must pass to enter or leave a Stage.
- **Evidence** is what a gate judges, with a verdict of PASS, FAIL or UNKNOWN. UNKNOWN never passes.
- The **authority** of a Stage says who may pass it.
- The **transition** says how the Subject leaves the Stage, and the **destination** says where it then stands, both by logical name.
- A **part** is an alternate incoming path into a Stage. It is not a Stage and not a predecessor, and it passes the same gates.
- A **binding** realizes a declared pipeline on a platform and holds all platform data. It reads the declaration and adds no Stage and changes no gate.

A consumer declares and configures its Stages in `.kaal/config/release/`, one file per Stage. A sound declaration is not an authorization and not readiness. Scope completeness, product verification and publication readiness are separate gates.
```
