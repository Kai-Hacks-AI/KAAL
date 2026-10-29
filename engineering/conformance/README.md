# Installation Contract conformance

> PLAN (engineering/C4): nothing below exists yet. This PLAN is the `engineering/C…` step that Core's `core/A8`, Guard's `guard/N12` and Architecture's LOVE plan (`architecture/A1`) each leave to Engineering: Core's conformance Test Cases run against every Capability's Installation Contract instance. Its DO waits for a synchronization of `main` into `kaal/engineering`, because `kaal/engineering` carries neither Guard's `contract.json` nor the Installation Contract format that `main` has.

Core owns the Installation Contract: its Definition, its schema and its conformance Test Cases, core/T10–core/T13 (`core/C3`). Each Capability owns its instance, `contract.json`, and imports nothing of Core to conform. Engineering runs the Test Cases against each instance at engineering time, so no package gains a dependency. The evidence is the Capability's, and the Test Case definitions stay Core's.

## What runs

A new Engineering test, `engineering/conformance/installation.test.mjs`, joins `npm run test:engineering`. It reads every tracked `contract.json` under `packages/` through Hosting and gives each instance its own test, titled by the Capability it names, so each Capability's evidence is a line of its own. It uses only `kaal-core/installation`'s public interface, `installationFormat` and `checkContract`.

| Core Test Case | Applied to an instance |
| --- | --- |
| core/T10 | The instance has no findings, and its `format` is Core's current `installationFormat()` |
| core/T11 | Copies of the instance with an extra member, without `record`, with a `version` of the wrong kind, and with another `format` id are each refused, and the finding names that member |
| core/T12 | Copies with the first asset's `target` outside the repository, with a catalogue entry for no asset, and with a digest that is not SHA-256 are each refused |
| core/T13 | A copy whose `provides` names a location instead of a Skill is refused |

The core/T11–core/T13 rows show that the conformance check discriminates on this instance's own members, so a clean core/T10 result is not vacuous. Each mutation is derived from the instance, not from Core's sample contract.

The instances today are Guard's (`packages/kaal-guard/contract.json`, on `main`) and Architecture's (`packages/skills/kaal-architecture/contract.json`, on `kaal/architecture` since #485). Discovery is by file, so Architecture's instance is covered as soon as it reaches `kaal/engineering`, with no further Change. Any Capability that adds an instance later is covered the same way.

**Observed for this PLAN.** With the Core on `main` and `kaal/architecture` (format id `20c46d8e…`), `checkContract` gives no findings for either instance, and every mutation in the table is refused with its member named, for both. With the older Core on `kaal/engineering` today (format id `16a1fe8e…`), both instances would fail core/T10 on `format`. That is why the DO waits for the synchronization.

## RED first

Each behavioural case is first observed RED against a deliberately wrong fixture. A RED that shows only that a module or file is missing counts as blocked, not as evidence.

- An instance with an unknown member makes its core/T10 case RED, naming the Capability and the member.
- A tracked `packages/<x>/contract.json` that does not name the Installation Contract format is RED, never skipped.
- A tree with no instance at all makes the run RED, so the test cannot pass by finding nothing.

## Not in this Change

- **The catalogue against the shipped bytes.** It is each Capability's own: guard/T58 and architecture/T2.
- **Realization.** Realizing Guard's instance through Core and then running Guard's own `upgrade` and `remove` on the result is the second half of Guard's Engineering step. It needs `guard/C16` and `core/C4` and gets a Change of its own.
- **The installation record.** `checkRecord` is Core's realization behaviour, covered by `core/C4`'s Code tests.

## Owner decision

**How the Test Cases are not copied.**
- **A (recommended).** Engineering applies Core's public check to each instance as the table above shows, citing each Core Test Case by id. Nothing in Core changes.
- **B.** Core exports its conformance Test Cases parametrised by an instance, and Engineering only runs them. This is a Core Change, owned by Core, and the DO waits for it.

Approving this PLAN authorizes the engineering/C4 DO only, after `main` is synchronized into `kaal/engineering`. It authorizes no synchronization, promotion or publication.
