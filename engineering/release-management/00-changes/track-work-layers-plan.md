# track Work in three layers (PLAN)

Change: release-management/C15

PLAN, nothing is built. This Change moves `track Work` from what C7 built to the target the root documents now describe, and says why and how. The target itself is described once, in the root, and is not repeated here:

- Intent: `release-management/I8` (`01-intent`).
- Requirement: `release-management/F23`, with its three layers (`02-requirements`, the section "Across the stations: track Work").
- Architecture: the components `track-work/` and `track-work-kaal/` and the layer table (`03-architecture`).
- Cases: T38 to T42, T44, T45 and T67 to T77 (`04-test/testing.md`). The new Cases T67 to T77 are carried unwired in `04-test/track-work-layers.red.mjs` and the DO wires them.

It is a Delivery element: `release-management` is Delivery, so these are the Delivery scope's target descriptions, owned by Engineering for now (Owner and CPO, 10 November; Engineering owns the KAAL-specific target descriptions until the Owner settles a longer-term semantic owner, which does not make Engineering the permanent owner of reusable semantics).

## Why

Owner direction (Kai, 10 November): the purpose of `track Work` stands, that we know where each Change is on the release; CTO and CPO are KAAL's current consumers, not universal concepts, and the stations and controls differ by consumer. C7 built the reporting with the two roles and KAAL's station and check names in the code, so the reporting cannot be reused by another consumer and the roles cannot change without editing it. The CPO's review of this PLAN added that the capability must separate facts from policy-derived classifications, never report with confidence from missing facts, and not treat the model's orders as universal.

## What moves

| From (C7) | To (target, root documents) |
| --- | --- |
| `--role cto\|cpo` in the entry | selectors by stage, station, collector and what is waited for; views in the consumer's configuration |
| KAAL's station numbers, the `kaal/` prefix, `main`, `verify Envelope`, the forms `Promote` and `SYNC` in the code | the model in `track-work-kaal/` (one data file); the capability has no defaults |
| states about to open, in stock, about to close, queued, owned by a role | what is waited for (`pull-request`, `fix`, `approval`, `merge` in KAAL's configuration), from the model's ordered waits |
| a verdict inferred from the checks, envelope unknown shown as text | conditions true, false or unknown; unknown is named and listed, provisional conditions are marked |
| one directory | `track-work/` (capability) and `track-work-kaal/` (consumer and configuration) |

KAAL's two views are configured as waits across all stations: the CPO's is `waitingFor: approval`, the CTO's is `waitingFor: fix, pull-request`, neither with a station or stage selector (T72).

This Change openly replaces Cases of C7, traced here: T43 (role filtering) is replaced by T69 and T73; T38 to T42, T44 and T45 keep their intent and receive the model as an argument (KAAL's model for the consumer's Cases, a fixture model for the capability's). `WORK.md` is reworded so that the definition names no role.

## Sequence

1. This PLAN (`release-management/C15 PLAN`) with the root target descriptions and T67 to T77 unwired.
2. DO (`release-management/C15 DO`) after the PLAN is approved: the capability made model-driven, the consumer and its configuration, the Cases moved next to their components and wired, the README.
3. Later and separately: packaging the capability into the `kaal-release` 0.0.1 Skill (a separate PLAN, as a deterministic Script under the BASS distinction), and the roll-up fed by `kaal-change`'s composition (a separate PLAN of the Change thread, against the fact shape of F23: a piece id and its record folder).

## Open for the Owner and CPO

- The priority of KAAL's waits and the order of its positions are KAAL's policy in `track-work-kaal/`; proposed there for confirmation, with nothing in the capability depending on them.
- Which of KAAL's conditions are provisional: only the envelope's, until `verify Envelope` (F19) reports.
- Whether a view may also carry a station list (a consumer that wants only its own stations).
- The package name and shape in `kaal-release` 0.0.1.

## Not in this Change

Any new source of facts, any workflow, check, ruleset or gate, retiring a control, promotion or publication, and the C7 history.
