---
title: ACT view
---
# ACT view of the KAAL object metamodel

Template: `.github/PULL_REQUEST_TEMPLATE/act.md`. Global model: [metamodel.md](../metamodel.md). This view selects from the model and defines nothing.

An ACT adds the records that close the Change in its collector, today the 4L retrospective.

**Purpose.** This view anchors semantic reasoning about a ACT pull request, both when it is written and when it is understood afterwards, along the INFORMED chain, Intent, Requirement, Architecture, Control, Case, then code or ruleset. **In the chain:** the whole chain, afterwards: the ACT records what the Change taught about it, for the next reader.

```mermaid
flowchart LR
  Change -->|records| ChangeRecord
  ChangeRecord -->|references| Evidence
  PR -->|realizes| Change
```

## Objects
Change, Change Record, Evidence, PR.

## Relationships
records, references, realizes.

## Information the template expects
The Change line; the records the ACT adds, named and not repeated.

## What the reviewer should be able to verify
That the record the ACT names exists in the Change Record and belongs to the Change (Q6); that nothing else changed (Q1).

## Outside this template
What the retrospective concludes (Review judges it); the Intent, Requirements and Cases (unchanged by an ACT); delivery to `main`.
