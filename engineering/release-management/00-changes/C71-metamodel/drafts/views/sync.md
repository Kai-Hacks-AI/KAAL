---
title: SYNC view
---
# SYNC view of the KAAL object metamodel

Template: `.github/PULL_REQUEST_TEMPLATE/sync.md`. Global model: [metamodel.md](../metamodel.md). This view selects from the model and defines nothing.

A SYNC brings a newer `main` into a collector and claims no Change Record of its own.

**Purpose.** This view anchors semantic reasoning about a SYNC pull request, both when it is written and when it is understood afterwards, along the chain Intent, Requirement, Architecture, Control, Case, then code or ruleset. **In the chain:** none: a SYNC carries chains already accepted elsewhere and adds no link to any chain.

```mermaid
flowchart LR
  Change -->|succeeds| Change
  PR -->|realizes| Change
```

## Objects
Change, PR.

## Relationships
succeeds, realizes.

## Information the template expects
The primary incoming Change that drives the synchronization; the reason it is needed now.

## What the reviewer should be able to verify
That the primary Change named is already accepted elsewhere and is the driver (Q2, Q6); that the pull request adds no new work of its own (Q1).

## Outside this template
Any new Intent, Requirement or Case; the content of the incoming Changes, judged where they were accepted.
