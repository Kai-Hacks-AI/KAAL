# Installation Contract Conformance Cases: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N18** [core/I20]: The cases stay out of Core's production runtime.
  - No runtime entry point of `kaal-core`, its exports or its `kaal` bin, imports them.
  - They import no test harness: neither `node:test` nor any test runner.
  - They are pure and deterministic, and read and write nothing.

## Functional

- **core/F62** [core/I20]: Core states core/T10–core/T13 as cases parametrized by an Installation Contract instance. For a given instance, each case returns its result: its id, whether it holds, and what failed. The cases are:
  - **core/T10.** The instance has no findings.
  - **core/T11.** Each of these is refused and named by its member key:
    - an unknown member added;
    - `record` removed;
    - `version` of the wrong kind;
    - a `format` with another id;
    - the first asset with an unknown `kind`;
    - the first asset with an unknown member.
  - **core/T12.** Each of these is refused:
    - the first asset's `target` made absolute, parent-relative, drive-qualified or backslashed;
    - a catalogue entry for no asset;
    - a digest that is not SHA-256.
  - **core/T13.** `provides` naming a location instead of a Skill is refused.
- **core/F63** [core/I20]: A case is judged against the instance, not assumed from it.
  - core/T11–core/T13 hold only when core/T10 holds. On a non-conforming instance they do not hold, and they say so.
  - Each failure names the mutation that was not refused.
  - The conformance check the cases apply is `checkContract` unless another is given. That is how a case is shown to fail against a weaker check.
- **core/F64** [core/I20]: A mutation that cannot be applied to an instance is a failure naming its member key, never a pass. Under `checkContract` every conforming instance has an asset, so every mutation applies. Under a weaker check, one that admits an instance with no assets, the asset mutations fail as "cannot apply".
- **core/F65** [core/I20]: Core's own tests run the same cases against its sample contract, the one core/T10–core/T13 use. Core's planned tests in `test/plan/installation.test.mjs` stay unchanged.
