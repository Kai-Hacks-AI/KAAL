# Contract Evidence from Observed Runs: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **testing/N3** [testing/I4]: Testing's judgment depends on nothing it judges:
  - **Runtime dependencies:** kaal-testing's runtime dependencies stay `c8` and `kaal-hosting`.
  - **Imports:** nothing it delivers imports `kaal-core`, `kaal-graph` or any other capability's package.
  - **Inputs:** a mapping, a tree's bytes and a run are data.

  Testing may consume Core's types and admission in its own tests. That dependency runs from Testing to Core, never back (`core/N11`).

## Functional

- **testing/F7** [testing/I5]: `accept` observes each test its runner executes. Its result lists one entry for each test. An entry carries:
  - the scenario file, as a `/`-separated path relative to `cwd`;
  - the SHA-256 of that file's bytes as run;
  - the test's full suite path;
  - its outcome: `pass`, `fail`, `skip` or `todo`.

  Testing reads the outcomes from the runner it started, never from a file a scenario or anyone else writes. The result also carries the manifest it ran with.
- **testing/F8** [testing/I5]: `classify(mapping, files, run)` takes an optional third argument: a run that `accept` returned in this process. With it:
  - **Observed:** an offered acceptance test is `observed` when the run executed that exact file, with the pinned bytes and the full suite path, and it passed.
  - **Verified failure:** an offered test is a `verified failure`, naming the test, when it ran so and failed.
  - **Unknown:** anything else stays `unknown`, with its reason.
  - **Statement:** a statement is `observed` when every offered test is, and a `verified failure` when any is. Otherwise it stays `unknown`. Its inference is reported as before ("proposed, not reviewed" or a declared review), never as verified.
  - **Run provenance:** only a run that `accept` produced in this process counts. A copy of it, or one read back from JSON, is a claim and counts as no run. Classification uses what `accept` observed, as it observed it, so changing the run's fields afterwards changes no classification. Observed evidence does not outlive that process: no other process, job or machine can use it. Conformance evidence, which `accept` does not run, stays unknown, as does every statement classified without a run. Nothing here is a percentage, a ratio or a gate.
- **testing/F9** [testing/I4, testing/I5]: Evidence is independent only when it comes from the package as delivered. An offered acceptance test counts only when both of these hold:
  - its scenario installed, through `install()`, a tarball the run's manifest packed;
  - the run found no verified failure in its provenance: foreign bytes, a package the run did not pack, a host holding a package from elsewhere, a shared host or an unreadable host record.

  Otherwise its outcome stays unknown, even when it passed. A scenario that installed nothing exercised no package.
