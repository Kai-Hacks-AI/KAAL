# Control overview and vocabulary (PLAN)

Change `release-management/C9`. PLAN, nothing is built; the failing Cases (T56 to T58) are in `04-test/control-overview.red.mjs`, carried unwired. Proposed requirement `release-management/F22` (F21 is freeze Collector); it enters the root documents with the DO, not before. Until then the Cases trace to the intent they serve, `release-management/I1`.

## Intent (Owner, 10 November 2026)

"On all of this: we need to maintain 1. an overview of release controls, 2. clean domain language, 3. a clean vocabulary for preventive, detective and corrective controls (directive are in intent, requirements and architecture)." And: the verb of a control's name must match its class. Freeze is preventive, verify is detective, and clear, drain and retarget are corrective.

This Change holds the three, so they are maintained and not rediscovered each time a control is added.

## 1. The overview of release controls

One table, in `03-architecture/control-overview.md`, the single place that lists every control. A row is:

| Column | Meaning |
| --- | --- |
| Control | the name, `verb Object` |
| Id | the F-id (or the Change id for a control that is a read-only report) |
| Station | 10-npmjs, 11-main, 12-collectors, or root (spans stations), with in, out or stock |
| Class | `preventive`, `detective` or `corrective` (directive things are not controls with a row: they are the intent, requirements and architecture themselves, and the hooks' feedback) |
| Applied at | one or more of `hook` (feedback), `check` (evidence), `gate` (authorization), `setting` (a ruleset or environment setting) |
| Counterpart | the control of the neighbouring class that covers its failure, or `none: <reason>` |

The control is separate from where it is applied (the layering the Owner set for freeze Collector): the class says what the control does, `Applied at` says where it acts. The rows are derived from facts the repository already holds, not typed twice: the F-ids and stations from `03-architecture/architecture.md`, the names from the register and the plans. The DO adds the overview and a Case that fails when a control with an F-id is missing from it.

## 2. Clean domain language

The Definitions stay where the intent keeps them. This Change adds the words this setup now uses without a definition: **frozen collector**, **held**, **evidence**, **feedback**, **authorization**, **counterpart**, **envelope**, **station**. The DO adds each to the Definitions with one sentence and one owner document, and the documentation Cases already fail on a term defined twice.

## 3. Vocabulary per class

Each class has its own verb set; a control's verb must come from the set of its class (Owner).

| Class | What it does | Verbs |
| --- | --- | --- |
| Directive | tells people and agents what to do; can be skipped | in intent, requirements and architecture; hooks warn |
| Preventive | stops the wrong thing before it happens | freeze, approve, accept, bind, serialize, isolate, version |
| Detective | finds what is wrong, after or beside the act | audit, scan, test, verify, track |
| Corrective | restores a good state or limits the damage | clear, drain, retarget, retry, rotate, deprecate |

The existing classification (lifecycle assessment, "The four control types as a lens") stands: a detective control becomes preventive only through a gate, and each preventive control names its detective counterpart or why it needs none.

### Classifying the existing controls

| Class | Controls |
| --- | --- |
| Preventive | isolate Change F6, bind Merge F10, approve Promotion F11, serialize Promotion F13, accept Capability F14, approve Change F15, approve Publishing F1, version Package F3, freeze Collector F21 |
| Detective | audit Lineage F5, scan Vulnerabilities F8, scan Dependencies F9, test Candidate F12, test Integration F16, verify Package Promotion F2, verify Ancestry F7, verify Envelope F19, track Work (C7) |
| Corrective | the `Recovery:` lines of the verdicts, same-tag retry, the incident procedure, key rotation, deprecation of a burned version |

Mismatches the vocabulary shows, for the Owner (nothing is renamed by this PLAN):
- **verify Ancestry (F7) and verify Envelope (F19)** are classed detective by their verb, and they act preventively only because a gate reads them as required. The overview records that as class `detective`, applied at `check` and `gate`. The other option is to rename them with a preventive verb. Recommended: keep the names and record the gate; "a detective control becomes preventive only through a gate" is the rule already adopted.
- **isolate Change (F6)** is both a detective judgment and, through the gate, a preventive one; its verb `isolate` is kept in the preventive set because its target is the Change's shape, not the finding of a fault.
- **No control has a corrective verb as its name**; the corrective column is the thinnest (the assessment says so). `retarget` appears only as a recovery, never as a control.

## Cases (T56 to T58, unwired)

T56 every control in the architecture's table appears in the overview with station, class and applied-at, and a control missing from it fails. T57 the verb of each control belongs to the verb set of its class, and an unknown class or applied-at is refused. T58 each preventive control names a counterpart or a stated reason, and a counterpart is a control of another class that exists in the overview.

## Use or build

Use the commonmark and GFM-table parser the repository already depends on for the documentation Cases (no pattern over prose); build only the judgment `judgeOverview({controls, vocabulary, architecture})`, a pure function over facts the caller reads. Placement `05-src/overview/`, born in KAAL.

## Sequence

1. This PLAN, CPO review (the Cases are written here, unwired).
2. DO (`release-management/C9 DO`): `control-overview.md`, the vocabulary data, the Definitions, F22 in the requirements, and the judgment with its Cases wired in the same pull request.
3. ACT: what the first controls added teach (for example, whether `Applied at` needs a column for the earliest stage).

Nothing is wired, activated or renamed by this PLAN.
