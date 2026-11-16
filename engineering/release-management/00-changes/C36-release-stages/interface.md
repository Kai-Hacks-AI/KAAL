# C36 interface

## Draft of a Stage file

```
---
type: Release/Stage
order: 3
name: Promotion
subject: collector
gates: [Promotion-Source, Engineering]
authority: owner-approval
transition: merge
target: main
routes: [Hotfixing, Wiring]
---
What this Stage is for in this repository.
```

`routes` lists existing Stage names that name the routes allowed to enter. A consumer declares as many Stage files as it has Stages, in `order`.

## Draft of the judge result

```
{ "valid": true, "findings": [], "stages": ["Development", "Integration", "Promotion", "Publishing"], "bindingCoverage": "UNKNOWN" }
```

`bindingCoverage` is always UNKNOWN: a binding is judged by its own Change.

## Draft of the Skill vocabulary reference

```
# Release stages

A release process is an ordered pipeline of Stages.

- A **Stage** is a step the Subject passes on its way to release.
- A **Subject** is what moves through a Stage: a change set, a collector or an artifact.
- A **gate** is a named check a Subject must pass to enter or leave a Stage.
- **Evidence** is what a gate judges, with a verdict of PASS, FAIL or UNKNOWN. UNKNOWN never passes.
- The **authority** of a Stage says who may pass it.
- The **transition** says how the Subject leaves the Stage.
- A **route** is an urgent or install path that enters the pipeline at a later Stage and passes the same gates there.
- A **binding** realizes a declared pipeline on a platform. It reads the declaration and adds no Stage and changes no gate.

A consumer declares and configures its Stages in `.kaal/config/release/`, one file per Stage. Scope completeness, product verification and publication readiness are separate gates.
```
