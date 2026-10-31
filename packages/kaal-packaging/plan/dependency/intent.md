# Dependency traces: Intent

packaging/C10 is this PLAN. It answers prerequisite P2 of engineering/C11 (`engineering/change-isolation/traceability.md`, "Prerequisites, each its owner's"), which the Owner chose by approving Option B on #716. Engineering computes a Change's impact by following incoming traces through Graph's `traverse(id, { direction: "in" })`. One of those traces is Packaging's: **a realization's dependency on another package's identity** (packaging/F7). Today it exists only as text in each `package.json`, so Graph cannot follow it.

- **packaging/I8.** A package's dependency on another KAAL package is a trace that Graph can traverse. Packaging derives it from the manifests that already declare it, and from nothing else. It never asks anyone to restate a dependency, and it keeps no list of packages, dependents or capabilities of its own.

What Packaging does not do here:
- It does not compute impact, judge selection or isolation, or decide anything about a Change. Those are Engineering's (engineering/F25–F27).
- It does not attribute a path to an owner. That is the ownership claims' (`kaal-testing/attribution`).
- It does not give `Depends on` any meaning beyond packaging/F7's: the named package must be installed for this one to be the package it states.
- It adds no trace from code imports, scripts or workspace selectors such as `-w kaal-hosting`. Those are not manifest dependencies, and their owners are named in `architecture.md`.

This PLAN changes no product. It authorizes only packaging/C11 as its DO, after the Owner approves it.
