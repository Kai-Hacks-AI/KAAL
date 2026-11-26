# C37 change

## The inventory: what already defines a pull request type

| Where | Owner | What it defines | Direction |
| --- | --- | --- | --- |
| `.github/PULL_REQUEST_TEMPLATE/{plan,do,act,sync,promotion,hotfix,wire}.md` | Release (installed by WIRE) | the chapters of each TYPE, as installed | installed copy of a source; plan and do have no source |
| `05-src/wiring/templates/{act,hotfix,promotion,sync,wire}.md` | Release (sources, C138 declares their TYPE) | the chapters of five TYPEs, with `HOW TO WORK` on four | source of the installed copies |
| `05-src/plan-body/templates.mjs` `readTemplates` (A40, F17) | Release | derives the registry TYPE to chapters from the templates' `KAAL-PR-template` declarations; admits DEFAULT as a TYPE (F19) | reads the templates; C138 returns it to the definition |
| `05-src/plan-body/envelope.mjs` `ROUTE`, `HOTFIX_CHANGE`, `IDENTITY`, `SHAPE` | Release (`verify Envelope`, CTL11) | recognition by base and head for six TYPEs (WIRE has none), identity and shape rules per TYPE | judge; keeps its rules, loses its TYPE and route tables |
| `05-src/plan-body/check.mjs` | Release (A16) | the PLAN body contract | judge; stays |
| `05-src/promotion-raise/final-step.mjs` `CLASSES`, `stepOf`, `wireTarget` | Release (Dispatcher, C93; C136 replaces `stepOf`) | recognition by branch (`kaal/…`, `hotfix/…`, `wire/…`) and, today, by chapters | the Dispatcher; C136 already stops reading text |
| `05-src/show-wip/show-wip.json` | Release | the list of six types, the stations and the places (`hotfix/*`, `wire/*`, `kaal/*`) | duplicate list |
| `05-src/sync-review/verify.mjs` `LANES` (`verify Sync`, CTL7) | Release | the three lanes a SYNC may go into | duplicate of the branch classes |
| `05-src/stages/stages.json`, `wiring/rulesets/*.json` | Release (rulesets) | which branch pattern each ruleset targets (`kaal/**`, `hotfix/**`, `wire/**`) | enforcement; stays, not derived |
| `05-src/delivery/locations` (A67) | Release | the delivery locations a WIRE may write | a WIRE's contract; referenced |
| `kaal-change/plan/levels/README.md` | Change | the PR, promotion, synchronization and emergency transitions; the `hotfix/*` route is "Engineering's route; Owner and Engineering to settle" | semantics; referenced |
| **Template generator** | **nobody** | none exists. The templates are written by hand (sources in release's `05-src/wiring/templates`, installed under `.github` by a WIRE). Release's intents and requirements (I2, I5, I6, I9, I10, F16) claim the templates and their interfaces, not their generation; Backlog's fast-lane assessment names "generated from the same truth as the API body builder" (B2) as a prerequisite no capability has taken; Hosting's `hosts.md` is a per-host guide, not a renderer | missing |
| `write-areas.json` `pullRequests` (C36) | Engineering | for each of the seven TYPEs, the areas it may carry, and `recognised` for HOTFIX and WIRE | the one thing that is already ours |

## Decisions (the approval of this pull request is the go for the DO)

1. **One file, Engineering's:** `skills/kaal-engineering/references/pull-request-types.json`, beside `package-layout.json` and `write-areas.json`. For each TYPE: its `chapters` in order, and how it is recognised (`base` and `head` branch patterns, `*` for one segment). The TYPEs are the seven: PLAN, DO, ACT, SYNC, PROMOTION, HOTFIX, WIRE. A list `invalid` names DEFAULT: the fallback template is not a type and a pull request that falls back to it is an invalid route (Owner and CPO, via release C138).
2. **Chapters are the sources where a source exists, and the installed template otherwise.** ACT, SYNC, PROMOTION and HOTFIX take release's sources (with `HOW TO WORK`), WIRE its three chapters, and PLAN and DO the installed ones (`Change`, `From`, `To`, `Because`; `Change`, `Implement`, `Refactor`). Whether PLAN and DO gain `HOW TO WORK`, and what the chapters mean, stay release's decisions on the templates; the file holds the result. A chapter is a name only: the text, the HTML comments and the `KAAL-PR-template` line are generator output, not part of the definition.
3. **Recognition moves into the file, from where it stands.** The rows come from release's `ROUTE` and `CLASSES` (PLAN, DO and ACT into `kaal/*`; SYNC into `kaal/`, `hotfix/` or `wire/`; PROMOTION into `main` from `kaal/` or `hotfix/`; HOTFIX into `hotfix/` from a head that is not under it; WIRE into `wire/`). Release's WIRE row is the one release must confirm; the envelope has none today. C36's `recognised` and `elsewhere` fields on HOTFIX and WIRE move here and leave `write-areas.json`, which keeps only the areas; T1553 is amended in the DO for that.
4. **What the file references and does not copy:** the areas of a type (`write-areas.json`), the branch patterns a ruleset targets (release), the delivery locations of a WIRE (A67), the rules of a HOTFIX's validity, the identity and shape rules of the judge, and the semantics of a transition (kaal-change). A type's row names them; it does not restate them.
5. **Who changes what, each in its own Change after this.** Engineering owns the definition, which is KAAL data and knows no host. **Hosting owns the generator**, as the GitHub adapter: only GitHub needs pull request templates (Kai, 26 Nov), so rendering the definition into `.github/PULL_REQUEST_TEMPLATE/*.md` and into the API body builder is the host's adapter concern, and a second host would add its own renderer without touching the definition. This Change asks Hosting to take that ownership; it does not authorize its implementation. Release's `readTemplates`, `ROUTE`, `CLASSES`, `show-wip.json` and `LANES` read the definition instead of keeping their own tables, each in release's own Change. C138's DO reads the file and fixes no name or path of its own.
6. **Overlaps, stated, not hidden:** `show-wip.json` and `LANES` repeat the type and branch lists, `readTemplates` and `ROUTE` repeat the type list, and C36's rows repeat the recognition. The definition makes one of them the source and the others consumers; until each consumer migrates, a Case in its own Change holds the two equal.

## What this Change pins (Cases, plain `.test.mjs`)

- T1560: the file holds exactly the seven TYPEs, each with a non-empty `chapters` list (WIRE: Source, Target, Verification; every other TYPE opens with Change), and names DEFAULT under `invalid`, never as a TYPE.
- T1561: each TYPE has recognition rows, and they read as release's rows do: PLAN, DO and ACT into `kaal/`; PROMOTION into `main`; HOTFIX into `hotfix/` from a head not under it; WIRE into `wire/`; SYNC into `kaal/`, `hotfix/` and `wire/`.
- T1562: one truth: `write-areas.json` carries no `recognised` or `elsewhere` and lists the same TYPEs as the definition.

All three are RED against `main`: the file does not exist, and `write-areas.json` still carries the recognition (T1553 pins it).

## Questions for the CPO

0. **The generator's owner.** Kai's reasoning places it with Hosting, the GitHub adapter; Hosting is asked and has not yet answered. If Hosting declines, it falls back to Engineering.
1. WIRE's recognition (a base under `wire/`) is taken from the Dispatcher's classes, not from the envelope, which has no WIRE row. Release confirms it.
2. Chapters for PLAN and DO come from the installed templates, which have no source yet. Release decides whether they gain `HOW TO WORK`; the file follows.

## Not in this Change

No template, generator (Hosting's, if it accepts), body builder, workflow, ruleset, WIRE or change to what the judges check. No change to the DEFAULT file itself; it is only named invalid.
