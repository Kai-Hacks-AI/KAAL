---
name: Change
type:
  name: KAAL Capability
  id: 56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e
---

# Change

Change is the responsibility for orchestrating the work around a Change: what a Change is, what makes it self-contained, and how its distributed work is coordinated toward integration, independent of any technology that carries it. Its scope is that alone.

A Change coordinates the concerns of engineering, as Engineering's GLUE names them: Describe Intent, Define Requirements, Design Architecture, Develop Code, Do IT and Detect Defects. It coordinates them; it does not own their semantics, artifacts, implementations or tests, and they are not stages it must run in order.

It provides the Change Definition. For admission it requires Core's KAAL Capability and KAAL Definition, and nothing else.

Its functional relationships are uses, not ownership. A Change may realize an Intent, whose meaning and Outcome are Intent's; integrating a Change does not prove the Outcome. It uses Testing for verification and Review for validation, tracking their status and referencing their evidence and judgments without owning or repeating either. Filesystem access and containment are Hosting's. How a pull request realizes a Change is Engineering's Branching. Communication consumes the facts of a Change without owning them.
