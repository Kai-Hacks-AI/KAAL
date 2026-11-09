# Release management (Engineering)

PLAN, nothing here is built. The root holds the full loop for how a package moves from a working branch out to the world. The stations below it repeat the same loop, one station at a time. Each station has **in** (the receiver's check), **stock** (what holds while work sits at the station) and **out** (the sender's check), so what is out of one station and what is in to the next may be different controls.

| Folder | What it is | State |
| --- | --- | --- |
| `01-intent/` to `04-test/` | the overarching view of the root: Intent, Requirements, Architecture (the flow drawing), planned Cases | this PLAN |
| `05-src/<control>/` | one component folder per control (15, kebab-case), with its Cases next to it | planned; created by each Change |
| `00-changes/` | one planned Change per control: add job, move code to `05-src`, retire the old check | this PLAN |

Layout (Owner, 9 Nov): the folder is only the root loop, `00-changes` to `06-defects`. There are **no station folders**. Each control is a **component folder inside `05-src`**, named in kebab-case after the control: `audit-lineage`, `isolate-change`, `verify-ancestry`, `scan-vulnerabilities`, `scan-dependencies`, `approve-publishing`, `verify-package-promotion`, `version-package`, `bind-merge`, `approve-promotion`, `test-candidate`, `serialize-promotion`, `accept-capability`, `approve-change`, `test-integration`. Stations (10 npmjs, 11 main, 12 kaal) exist only in the flow drawing in `03-architecture`; which control belongs to which station is traced by graph edges and not by path. All requirements sit in the root `02-requirements`, which forces each control's functional placement to be precise. Cases sit next to their component. Folders are created when they hold something, so `00-changes`, `05-src` and `06-defects` do not exist yet. Station `13-change-branch` is dropped for now (Owner, 9 Nov).

Existing controls (`engineering/controls/`), their checks and files, and the release engine (`engineering/release/`, `.github/workflows/release.yml`) are untouched by this PLAN; their checks are renamed later, one Change per control (`00-changes/`), add-new then remove-old. The names below are the Owner's, agreed 9 Nov 2026.
