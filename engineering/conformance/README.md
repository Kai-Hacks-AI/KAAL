# Installation Contract conformance

> PLAN (engineering/C4): nothing below exists yet. This PLAN is the `engineering/C…` step that Core's `core/A8`, Guard's `guard/N12` and Architecture's LOVE plan (`architecture/A1`) each leave to Engineering: Core's conformance Test Cases run against every Capability's Installation Contract instance. Its DO waits for Core's parametrized cases and for a synchronization of `main` into `kaal/engineering`, which today carries neither Guard's `contract.json` nor the Installation Contract format that `main` has.

Core owns the Installation Contract: its Definition, its schema and its conformance Test Cases, core/T10–core/T13 (`core/C3`). Each Capability owns its instance, `contract.json`, and imports nothing of Core to conform. Engineering runs the Test Cases against each instance at engineering time, so no package gains a dependency. The evidence is the Capability's, and the Test Case definitions stay Core's.

## What runs

Engineering discovers and orchestrates. Core is the authority on what an Installation Contract is and on its conformance Test Cases, and the Test Cases run as Core defines them (the Owner's direction on #607, option B).

- **Core's part, a Core Change.** Core offers core/T10–core/T13 as reusable cases parametrized by an instance: given an instance, each case states what it checks and gives a verdict with its findings. Core owns that interface: its name, its shape, and how its own `test/plan/installation.test.mjs` runs the same cases on its sample contract. It must not put a test harness into Core's production runtime: no runtime entry point imports it, and it imports no `node:test`. Core plans it in `core/C31` (#611): `kaal-core/conformance`, `installationConformance(instance)`, giving each case's `id`, `holds` and `failures`. This DO waits for it.
- **Engineering's part, this Change.** A new Engineering test, `engineering/conformance/installation.test.mjs`, joins `npm run test:engineering`. It reads every tracked `contract.json` under `packages/` through Hosting, and runs each of Core's cases against each instance under `node:test`, one test per Capability and case, so each Capability's evidence is a line of its own. It asserts nothing about the format itself. A finding is Core's finding, reported as Core gives it.

The instances today are Guard's (`packages/kaal-guard/contract.json`, on `main`) and Architecture's (`packages/skills/kaal-architecture/contract.json`, on `kaal/architecture` since #485). Discovery is by file, so Architecture's instance is covered as soon as it reaches `kaal/engineering`, with no further Change. Any Capability that adds an instance later is covered the same way.

**The instances stay JSON.** Core's `Installation Contract` Definition specifies an installer-neutral JSON document, and `contract.json` is machine-to-machine input (Core's frontmatter `N3`). This Change does not convert it.

**Observed for this PLAN.** With the Core on `main` and `kaal/architecture` (format id `20c46d8e…`), `checkContract` gives no findings for either instance. Copies of each instance with an extra member, without `record`, with a wrong-kind `version`, with another `format` id, with a target outside the repository, with a catalogue entry for no asset, with a digest that is not SHA-256, and with `provides` naming a location are each refused, with the member named. So Core's check discriminates on both real instances. With the older Core on `kaal/engineering` today (format id `16a1fe8e…`), both instances would fail on `format`. That is why the DO also waits for a synchronization.

## RED first

Each behavioural case is first observed RED against a deliberately wrong fixture. A RED that shows only that a module or file is missing counts as blocked, not as evidence.

- An instance with an unknown member makes Core's core/T10 case RED for that Capability, with Core's finding naming the member. This shows the orchestration passes the real instance to Core's case.
- A tracked `packages/<x>/contract.json` that does not name the Installation Contract format is RED, never skipped.
- A tree with no instance at all makes the run RED, so the test cannot pass by finding nothing.

## Not in this Change

- **The catalogue against the shipped bytes.** It is each Capability's own: guard/T58 and architecture/T2.
- **Realization.** Realizing Guard's instance through Core and then running Guard's own `upgrade` and `remove` on the result is the second half of Guard's Engineering step. It needs `guard/C16` and `core/C4` and gets a Change of its own.
- **The installation record.** `checkRecord` is Core's realization behaviour, covered by `core/C4`'s Code tests.

## Order

1. `core/C31` (#611), PLAN and DO: the parametrized conformance cases. Core's thread owns them.
2. A synchronization of `main` into `kaal/engineering` that carries them, separately authorized.
3. The engineering/C4 DO: discovery and orchestration, RED first as above.

Approving this PLAN authorizes the engineering/C4 DO only, after steps 1 and 2. It authorizes no Core interface, synchronization, promotion or publication.
