# Release management (Engineering)

PLAN, nothing here is built. The root holds the full loop for how a package moves from a working branch out to the world. The stations below it repeat the same loop, one station at a time. Each station has **in** (the receiver's check), **stock** (what holds while work sits at the station) and **out** (the sender's check), so what is out of one station and what is in to the next may be different controls.

| Folder | What it is | State |
| --- | --- | --- |
| `01-intent/` to `04-test/` | the overarching view of the root: Intent, Requirements, Architecture (the flow drawing), planned Cases | this PLAN |
| `05-src/` | the five shared controls directly, with the station components `npmjs/`, `main/` and `collectors/` beside them | planned; created by each Change |
| `00-changes/` | one planned Change per control: add job, move code to `05-src`, retire the old check | this PLAN |

Layout (Owner, 9 Nov): the folder is only the root loop, `00-changes` to `06-defects`, and it is traced as an element of the Delivery architecture (Delivery vs Solution placement). There is no named parent folder and no station folder at the root. The five controls that span stations (audit Lineage, isolate Change, verify Ancestry, scan Vulnerabilities, scan Dependencies) sit directly in `05-src/`; the station components sit beside them: `05-src/npmjs/`, `05-src/main/` and `05-src/collectors/` (the collector station is named `collectors`, so it is not confused with KAAL as a whole; its workflow is `release/collectors`). Controls are requirements and components realize them, so a component holds several controls, and a control may be realized by a native setting or a tool and have no source (listed in `03-architecture`). All requirements sit in the root `02-requirements`; Architecture allocates each to exactly one of the four components, which forces precise functional placement. Cases sit next to their component. Folders are created when they hold something, so `00-changes`, `05-src` and `06-defects` do not exist yet. Station `13-change-branch` is dropped for now (Owner, 9 Nov).

Existing controls (`engineering/controls/`), their checks and files, and the release engine (`engineering/release/`, `.github/workflows/release.yml`) are untouched by this PLAN; their checks are renamed later, one Change per control (`00-changes/`), add-new then remove-old. The names below are the Owner's, agreed 9 Nov 2026.
