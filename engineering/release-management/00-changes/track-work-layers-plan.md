# track Work in three layers (PLAN)

Change: release-management/C15

PLAN, nothing is built. It falls forward from `track Work` as C7 built it (`--role cto|cpo`, KAAL's stations and check names in the code) and separates three layers, so that the part worth reusing can move into `kaal-release` 0.0.1 as it is. Owner direction (Kai, 10 November): the purpose stands, that we know where each Change is on the release; CTO and CPO are KAAL's current consumers, not universal concepts; the stations and controls differ by consumer; the capability discovers and classifies Work from observable facts, the consumer decides what matters to it, and the configuration defines the roles, responsibilities and views. The Cases are written inside this PLAN, carried unwired (`04-test/track-work-layers.red.mjs`, T67 to T77); the DO wires them.

`track Work` is the detective control F23 under Operations (proposed in `control-overview-plan.md`, the Owner's "potentially" reservation on 10 November); the capability is its reusable part. The envelope verdict it reads is `verify Envelope` F19 (C8), not yet built.

## The three layers

| Layer | What it is | Knows about | Where it lives |
| --- | --- | --- | --- |
| **Capability** | Discovers and classifies Work from observable facts, selects it, renders it, and reports what it could not read | facts (branches, pull requests, checks, reviews, threads, merge state, releases) and a *model* handed to it; no role, no KAAL name | `05-src/track-work/`, a directory that moves as it is |
| **Consumer** | Binds the capability to one consumer: reads that consumer's configuration, expands its views into selectors, runs it | the capability and the configuration | KAAL's own: `05-src/track-work-kaal/` |
| **Configuration** | The consumer's data: its default branch, how it names its integration branches, its stage and station names, how its titles name a Change, the name of its envelope check, its forms of promotion and synchronization, and its **views** (a named set of selectors, for example what the CPO asks and what the CTO asks) | nothing else | `05-src/track-work-kaal/config.json`, one data file |

KAAL's configuration stays in KAAL when the capability moves. Another consumer brings its own configuration and its own stations and controls.

## Intent

Where the release stands is common knowledge (TRACK) and who acts follows from what a piece of Work waits for (WORK). A role fixed into the tool answers one consumer's question and cannot be reused; the observable facts and their classification can.

## Requirements

- **L1. Facts and classifications are kept apart.** The capability reads *facts* and derives *classifications* from them by the consumer's policy. Facts are observable and each carries its provenance (the source it was read from and the head it was read at): a branch has no pull request, CI of the head is red or pending, the branch is behind its base, N conversations are unresolved, the head has an approval, auto-merge is on, the verdict of the envelope check. Classifications are derived: `waitingFor`, position, stage, station, and a Change's roll-up. A classification is a judgment by policy, reported as derived, and is tested as one (L11).
- **L2. The capability names the position of each Change, the configuration names its stage and station.** This is the core of the capability: for every Change, where it is on the release. The capability knows four positions by what they are: `branch` (pushed, no pull request), `change` (a pull request into an integration branch), `promotion` (a pull request into the default branch, or an integration branch ahead of it with none open), `release` (the default branch ahead of its last Release). The configuration gives each position the consumer's own stage and station names (KAAL: `Development`; `Integration` at `12-collectors`; `Promotion` at `11-main`; `Publishing` at `10-npmjs`, a station being the control target of a stage and a position possibly having none). Every piece of Work carries its Change id, position, stage, station, collector, full head SHA and what it waits for, as role-free facts; consumers only filter and present them.
- **L3. The capability is handed a model and has no defaults.** The default branch, the ordered `waits` (below), the `order` of positions, the conditions it tolerates as provisional, the integration-branch prefix, the stage and station of each position, the pattern that reads a Change id from a title, the envelope check name and the promotion and synchronization forms come from the model; a call without a model is refused. Nothing of KAAL (`kaal/`, `main`, `verify Envelope`, station or role names, `Promote`, `SYNC`, the repository) appears in the capability's source.
- **L4. Selectors `--stage`, `--station`, `--collector`, `--waiting-for`,** each a comma-separated list: any-of within a selector, all-of between them, none lists everything. An unknown value is refused and the known ones are named (stages and stations from the model).
- **L5. The capability needs no role and names none** in its interface, output or usage. What could not be read prints as `incomplete:` lines whatever is selected.
- **L6. The consumer owns views.** `--view <name>` expands a view defined in the configuration into selectors. KAAL's configuration defines the views its two consumers use today; an unknown view is refused and the configured ones are named. The view names are configuration, not code.
- **L7. The boundary holds by test:** the capability imports only itself and Node built-ins and nothing from the consumer; the consumer imports the capability.
- **L8. Each pull request carries its record.** The capability reads the changed paths of a pull request and returns, as a fact, the ones that match the pattern the model names (KAAL: the Change record folder `.kaal/changes/<capability>/YY/MM/DD/CC`), so that what makes up one Change can be composed from facts it did not have to discover itself. Composition (which pull requests or fragments make one Change) and a Change's lifecycle state are not the capability's: they are pure functions over these facts that `kaal-change` owns, and the position of each piece stays the capability's.
- **L9. The roll-up of a Change is the capability's mechanism, its ranking is the model's policy.** `kaal-change` hands over composition only: for a record folder, the pieces (pull request number or branch) that belong to it, and the Change's lifecycle state. The capability returns the Change's position derived from its pieces by the one rule it defines, *least advanced*, where advanced is the model's `order` of positions. The order is required and has no default, and nothing in the capability treats it as universal: another consumer orders its positions otherwise. The wait of the Change is the wait of the piece it took the position from; a tie takes the first wait in the model's `waits` order. A piece named in a composition that is not among the facts, or whose classification is `unknown`, makes the Change `unknown` and is reported, never ignored.
- **L10. Policy is the model's, and the mechanism is fixed.** The capability defines a fixed vocabulary of *conditions* over facts (`noPullRequest`, `ciRed`, `ciPending`, `behind`, `unresolved`, `envelopeFails`, `notApprovedAtHead`, `autoMergeOff`, `approvedAtHead`) and evaluates each as true, false or unknown. The model gives `waits`: an ordered list of `{ name, any: [conditions] }` where the first wait with a true condition is the piece's wait (the priority is the order), and a last wait with no conditions that always applies. KAAL's `fix`, `approval` and `merge` are KAAL's configuration of this mechanism, not the capability's meaning; a fixture model with other wait names and groupings classifies the same facts differently.
- **L11. Nothing is reported with confidence from missing facts.** A condition whose fact could not be read is `unknown`. If no higher-priority wait is already true and an `unknown` condition could change the answer, the piece's `waitingFor` is `unknown`, with `missing` naming the facts and an `incomplete:` line. The model may list conditions as `provisional` (KAAL: `envelopeFails`, until `verify Envelope` F19 exists): they never make a piece `unknown` but are shown on the piece as provisional. Each classification is tested as a derived judgment against facts and a model.
- **L12. It writes nothing and authorizes nothing.** Reading is not judging, but classification and roll-up are derived judgments by the consumer's policy, which is what a detective control (F23) does: it detects and reports, and it does not gate or approve.

## Moving to kaal-release 0.0.1

The capability is one directory with no KAAL dependency and an injected `gh`, so it moves into the Skill by directory, with its generic Cases (a fixture model, not KAAL's). Whether the Skill ships it as a deterministic Script (BASS) and under which package name is the release Skill's PLAN, not this one; this Change only keeps the boundary clean enough for it.

## How it replaces C7

This Change openly changes the Cases of C7, traced here: T38 to T42, T44 and T45 keep their intent and receive the model as an argument (KAAL's model for the consumer's Cases, a generic fixture model for the capability's); T43's role filtering is replaced by T69 and T73. The states about to open, in stock, about to close and queued become `waiting for` `pull-request`, `fix`, `approval` and `merge`. `WORK.md` is reworded here so that the definition names no role.

## Sequence

1. This PLAN (`release-management/C15 PLAN`) with T67 to T77 unwired.
2. DO (`release-management/C15 DO`) after the PLAN is approved: the capability made model-driven, the consumer and the configuration, the Cases moved and wired, the README.

## Open for the Owner and CPO

- The name of the consumer component and of its views file; this PLAN uses `track-work-kaal` and `config.json`.
- Whether a view may also carry a station list (a consumer that wants only its own stations), or only waiting-for and collector.
- Package name and shape in `kaal-release` 0.0.1 (a separate PLAN).
- The priority of KAAL's waits (`pull-request`, then `fix`, `approval`, `fix` for auto-merge off, `merge`) and the order of its positions are KAAL's policy in `config.json`, proposed here for the Owner and CPO to confirm; nothing in the capability depends on them.
- Which of KAAL's conditions are provisional: this PLAN lists only `envelopeFails`.

## Not in this Change

Any new source of facts, any workflow, check, ruleset or gate, and the C7 history.
