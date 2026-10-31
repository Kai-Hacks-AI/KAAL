# Installation Contract Conformance Cases: Intent

This is `core/C31`, a PLAN Change. It ships no code. Its DO keeps the id: `core/C31` DO turns the planned tests GREEN.

`core/A8` says that Engineering runs Core's conformance Test Cases, core/T10–core/T13, against each Capability's Installation Contract instance. Nothing does yet. Engineering's PLAN for that run, `engineering/C4` (#607), asked the Owner to choose between Engineering reimplementing the cases' assertions and Core offering them for reuse. The Owner chose reuse, option B (2026-10-29, on #607): Core owns parametrized conformance cases, and owns any new interface for them. A test harness must not enter Core's production runtime.

- **core/I20.** Core's conformance cases for the Installation Contract are defined once, by Core, and run against any instance:
  - Engineering discovers the instances and runs Core's cases against each one. It reimplements no assertion.
  - Core runs the same cases against its own sample contract.
  - A case reports what it did not refuse, and what it could not apply. It never holds silently.
  - Using the cases changes nothing in Core's production runtime.
