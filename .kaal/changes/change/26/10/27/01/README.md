# Change Classification: Normal, Standard and Emergency

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

In the Project contract review (KAAL #279, comment 6449834529), the Owner placed the Normal, Standard and Emergency classification and its governance semantics in kaal-change, as a separate Change-owned Definition. Project references a Normal Change as its eligibility boundary and does not implement the classification.

## How

- `capability/Change-Classification.md` is a new `KAAL Definition`. It defines the three classes and states three limits:
  - The class is not a lifecycle state.
  - A class preserves control objectives and their evidence, not identical mechanisms: verification stays Testing's, validation and approval stay Review's, and gates stay Engineering's.
  - Each embedding repository chooses which classes it applies, their governance rigor and their realization (Owner review 5695772463).
- An Emergency Change may reorder its controls and retime its authorization, keeping their assurance and accounting afterwards. Urgency never silently discards a required control.
- `capability/Change.md` now provides it. `ownership.kaal.json` carries the Capability Node's new id, `README.md` lists it, and `test/classification.test.mjs` covers it.

## Linked, not repeated

- Project (#279) adds governance over one or more Normal Changes, where warranted.
- Engineering's Branching hotfix route is one realization of an urgent correction.

## Evidence

`npm test -w kaal-change` checks that the Definition is typed and provided, and that its statements hold as written.
