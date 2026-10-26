# Contract Evidence from Observed Runs: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A5** [testing/F7, testing/F8]: `accept` runs the scenarios with a test reporter of Testing's own, a module in `lib/` that uses `node:test`'s reporter interface. The reporter turns each `test:pass` and `test:fail` event (and `skip` and `todo`) into one line in the run directory, with the event's file, nesting and name. From those lines `accept` rebuilds each test's full suite path, which is the path the mappings already use. It hashes each scenario file when the run starts.
  - **The run object.** `acceptance.mjs` keeps a module-private `WeakMap` from each run object it returned to a private snapshot of what it observed: the per-test outcomes, the records, the findings and the manifest. Only `kaal-testing/contracts` reads the map, through a function it does not export. `classify` reads only the snapshot and never the fields of the object it is given. So a run counts only when it is the very object `accept` produced in this process, and changing that object's fields afterwards changes nothing. A copy or a deserialized run is just data that names a result, the same kind of claim the README already refuses.
  - **Hosting.** Commands, reads and paths stay Hosting's, as today.
- **testing/A6** [testing/N3, testing/F9]: The split with Core and Engineering is the one `core/A17` draws:
  - **Core:** what LOVE asks.
  - **Testing:** what independent evidence is, and its classification.
  - **Engineering:** when a run happens, which packages it packs, and what a result gates.

  Testing's classification never decides whether a package meets LOVE, and nothing in Testing names LOVE. Core's evaluation of a package reads Testing's classification of that package's own mapping. Packing, the manifest and the choice of `cwd` (the repository root, so scenario paths match the mapping's repository paths) stay the caller's.

## Options considered for establishing a run's provenance

| Option | What counts as a run | Cost |
| --- | --- | --- |
| **A. The run object `accept` returned, in this process, read through its private snapshot** (recommended) | Only what Testing itself executed and observed, as it observed it. | A classification and its run must happen in the same process. A CI job does both in one step. |
| B. A run file written by `accept`, pinned by its SHA-256 | Anything that matches the hash. | Anyone can write a file and its hash. That is the claim the README already refuses. |
| C. A signed run record | What a key signs. | It needs key management that KAAL does not have, and that is not Testing's to own. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C7` PLAN, this Change | Testing | none, in parallel with `core/C16` |
| `testing/C8` DO: the reporter, `accept`'s per-test outcomes, `classify` with a run | Testing | `testing/C7` |
| `testing/C4` PLAN: RED evidence (#385) | Testing | none. This Change touches neither RED classification nor `todo` and `skip` policy. It only records those outcomes. |
| Core's contract evidence mapping | Core | `testing/C8`, `core/C16` |
| Engineering's run of `accept` and `classify` in CI | Engineering | `testing/C8` |
