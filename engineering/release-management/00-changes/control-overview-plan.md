# Control overview and vocabulary (PLAN)

Change `release-management/C9`. PLAN, nothing is built; the failing Cases (T56 to T58 and T66) are in `04-test/control-overview.red.mjs`, carried unwired. Proposed requirement `release-management/F22` (F21 is freeze Collector); it enters the root documents with the DO, not before. Until then the Cases trace to the intent they serve, `release-management/I1`.

## Intent (Owner, 10 November 2026)

"On all of this: we need to maintain 1. an overview of release controls, 2. clean domain language, 3. a clean vocabulary for preventive, detective and corrective controls (directive are in intent, requirements and architecture)." And: the verb of a control's name must match its class. Freeze is preventive, verify is detective, and clear, drain and retarget are corrective.

This Change holds the three, so they are maintained and not rediscovered each time a control is added.

## 1. The overview of release controls

One table, in `03-architecture/control-overview.md`, the single place that lists every control. A row is:

| Column | Meaning |
| --- | --- |
| Control | the name, `verb Object` |
| Id | the F-id (or the Change id for a control that is a read-only report) |
| Stage | the domain stage the control belongs to (Owner, 10 November 2026, 13:28): `Development`, `Integration`, `Promotion`, `Publishing` or `Operations`. The overview is grouped by stage, in that order, one heading per stage |
| Station | 10-npmjs, 11-main, 12-collectors, or root (spans stations), with in, out or stock |
| Class | `preventive`, `detective` or `corrective` (directive things are not controls with a row: they are the intent, requirements and architecture themselves, and the hooks' feedback) |
| Applied at | one or more applications, each `<where>:<status>`: where is `hook` (feedback), `check` (evidence), `gate` (authorization) or `setting` (a ruleset or environment setting); status is `planned` (designed, not wired) or `active` (wired and observed running on a real pull request or merge group). An overview never claims protection through a `planned` application |
| Counterpart | the control of the neighbouring class that covers its failure, or `none: <reason>` |

**Planned is not active** (CPO review of #1368). `verify Envelope` today is `check:planned`, `gate:planned`: it is neither wired nor required. The class says what the control does when it acts; only an `active` `gate` or `setting` application is protection. Until then the overview says what is designed, not what protects. The control is separate from where it is applied (the layering the Owner set for freeze Collector): the class says what the control does, `Applied at` says where it acts. The rows are derived from facts the repository already holds, not typed twice: the F-ids and stations from `03-architecture/architecture.md`, the names from the register and the plans. The DO adds the overview and a Case that fails when a control with an F-id is missing from it.

## 2. Clean domain language

The Definitions stay where the intent keeps them. This Change adds the words this setup now uses without a definition: **frozen collector**, **held**, **evidence**, **feedback**, **authorization**, **counterpart**, **envelope**, **station**. The DO adds each to the Definitions with one sentence and one owner document, and the documentation Cases already fail on a term defined twice.

## 3. Vocabulary per class

Each class has its own verb set; a control's verb must come from the set of its class (Owner).

| Class | What it does | Verbs |
| --- | --- | --- |
| Directive | tells people and agents what to do; can be skipped | in intent, requirements and architecture; hooks warn |
| Preventive | stops the wrong thing before it happens | freeze, approve, accept, bind, serialize, isolate, version |
| Detective | finds what is wrong, after or beside the act | audit, scan, test, track, verify |
| Corrective | restores a good state or limits the damage | clear, drain, retarget, retry, rotate, deprecate |

**The verb is a naming discipline, not proof of effect.** A control's class is what it does when it acts, recorded in the overview with its active applications; the verb must be consistent with that class (a Case checks it), but a verb never proves a control protects. `verify Ancestry` and `verify Envelope` are detective; they protect only through an active gate.

The existing classification (lifecycle assessment, "The four control types as a lens") stands: a detective control becomes preventive only through a gate, and each preventive control names its detective counterpart or why it needs none.

### Reports are not controls, and track Work is a detective control

A read-only view that judges nothing and has no authority is a **report**, not a control: it has no row, class or verb, and the overview keeps a short **Reports** list (the report, its reader, the checks it reads). Promoting a report to a control needs a PLAN, an owner and an authority, with Cases.

`track Work` (C7) was listed here as a report. The Owner (10 November 2026, 13:29) reads it as **potentially a detective control, because it detects what is in flight**. This PLAN therefore classes it as the detective control **`track Work`, proposed F23** (the next free id; F22 is the overview, F21 freeze Collector, F20 the migration), stage Operations, station root. Its verb `track` joins the detective set. It is detective because it finds the state of Work in flight, per station, for the CTO and the CPO; its application is a run by hand (`run.mjs --role cto|cpo`) with no wired check or gate, so it records `check:planned` and claims no protection. It has no counterpart yet (`none: it only reports; the corrective act is the retarget or withdraw of freeze Collector`). Whether it stays a control or goes back to Reports is the Owner's call ("potentially"); the Reports rule above stays for any future view.

### Grouping by stage

| Stage | Controls |
| --- | --- |
| Development | isolate Change F6, verify Envelope F19 |
| Integration | bind Merge F10, verify Ancestry F7, approve Change F15, test Integration F16, scan Vulnerabilities F8, scan Dependencies F9, freeze Collector F21 |
| Promotion | accept Capability F14, approve Promotion F11, serialize Promotion F13, test Candidate F12 |
| Publishing | version Package F3, approve Publishing F1, verify Package F2 |
| Operations | audit Lineage F5, track Work F23, and the corrective gap (no control is named with a corrective verb yet) |

Correction (10 November 2026): test Integration F16 acts at the collectors (Integration) and test Candidate F12 at `main` (Promotion), as the requirements and the architecture table say; the first grouping had them the other way round. Both are detective (the verb `test`).

The stage says where in the lifecycle a control acts; the class says what it does. Both are columns, neither replaces the other. The stages are the Owner's domain language and the DO adds each to the Definitions.

### Classifying the existing controls

| Class | Controls |
| --- | --- |
| Preventive | isolate Change F6, bind Merge F10, approve Promotion F11, serialize Promotion F13, accept Capability F14, approve Change F15, approve Publishing F1, version Package F3, freeze Collector F21 |
| Detective | audit Lineage F5, scan Vulnerabilities F8, scan Dependencies F9, test Candidate F12, test Integration F16, verify Package F2, verify Ancestry F7, verify Envelope F19, track Work F23 |
| Corrective | the `Recovery:` lines of the verdicts, same-tag retry, the incident procedure, key rotation, deprecation of a burned version |

Mismatches the vocabulary shows, for the Owner (nothing is renamed by this PLAN):
- **verify Ancestry (F7) and verify Envelope (F19)** are classed detective by their verb, and they act preventively only because a gate reads them as required. The overview records that as class `detective`, applied at `check` and `gate`. The other option is to rename them with a preventive verb. Recommended: keep the names and record the gate; "a detective control becomes preventive only through a gate" is the rule already adopted.
- **isolate Change (F6)** is both a detective judgment and, through the gate, a preventive one; its verb `isolate` is kept in the preventive set because its target is the Change's shape, not the finding of a fault.
- **No control has a corrective verb as its name**; the corrective column is the thinnest (the assessment says so). `retarget` appears only as a recovery, never as a control.

## Cases (T56 to T58 and T66, unwired)

T56 every control in the architecture's table appears in the overview with stage, station, class and applied-at, and a control missing from it fails; a stage outside Development, Integration, Promotion, Publishing and Operations is refused. T57 the verb of each control belongs to the verb set of its class, and an unknown class or applied-at is refused. T58 each preventive control names a counterpart or a stated reason, and a counterpart is a control of another class that exists in the overview. T66 each application is `planned` or `active`, a control with only planned applications claims no protection, and a report is not a control row.

## Use or build

Use the commonmark and GFM-table parser the repository already depends on for the documentation Cases (no pattern over prose); build only the judgment `judgeOverview({controls, vocabulary, architecture})`, a pure function over facts the caller reads. Placement `05-src/overview/`, born in KAAL.

## Sequence

1. This PLAN, CPO review (the Cases are written here, unwired).
2. DO (`release-management/C9 DO`): `control-overview.md`, the vocabulary data, the Definitions, F22 in the requirements, and the judgment with its Cases wired in the same pull request.
3. ACT: what the first controls added teach (for example, whether `Applied at` needs a column for the earliest stage).

Nothing is wired, activated or renamed by this PLAN.
