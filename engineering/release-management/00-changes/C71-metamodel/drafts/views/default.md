---
title: DEFAULT view
---
# DEFAULT view of the KAAL object metamodel

Template: `.github/pull_request_template.md`. Global model: [metamodel.md](../metamodel.md). This view selects from the model and defines nothing.

The fallback envelope, used only when no specialized TYPE fits. Its chapters are Intent, Design, Verified by and Validated by.

**Purpose.** This view anchors semantic reasoning about a DEFAULT pull request, both when it is written and when it is understood afterwards, along the chain Intent, Requirement, Architecture, Control, Case, then code or ruleset. **In the chain:** Intent to Case: the Verified by and Validated by chapters say how the Intent is to be shown met.

```mermaid
flowchart LR
  Change -->|delivers| Intent
  Case -->|tests| Intent
  ChangeRecord -->|references| Evidence
```

## Objects
Change, Intent, Case, Change Record, Evidence.

## Relationships
delivers, tests, references.

## Information the template expects
The Intent the Change must achieve; optionally a Design that belongs to the Change contract; the deterministic evidence required (Verified by); the judgment required (Validated by).

## What the reviewer should be able to verify
That the Change named by the body delivers the stated Intent (Q2), that the Verified by evidence is a Case result or a check that tests that Intent (Q4), and that the judgment asked for is one an independent reviewer or the Owner can give (Q6).

## Outside this template
Which Requirements and Architecture support the Intent (the Change Record holds them); the lifecycle state of the Change; any control or stage.
