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
| **Template generator** | **Hosting** (Kai, 26 Nov: hosting owns GitHub, so the generator belongs there and the other capabilities use it) | none exists yet; templates are written by hand (sources in release's `05-src/wiring/templates`, installed under `.github` by a WIRE) | to be built by Hosting; not authorized here |
| `write-areas.json` `pullRequests` (C36) | Engineering | for each of the seven TYPEs, the areas it may carry, and `recognised` for HOTFIX and WIRE | the one thing that is already ours |

## Decisions (the approval of this pull request is the go for the DO)

Kai's ruling (26 Nov): Hosting owns GitHub, so the template generator belongs there and is not optional. The chapters and content of each type are owned by different capabilities, which declare them through Hosting. **Engineering therefore owns no central definition of the content.** It owns only the KAAL adaptation.

1. **What Engineering holds:** `skills/kaal-engineering/references/pull-request-types.json`, beside `write-areas.json`. It lists the TYPEs this consumer uses (PLAN, DO, ACT, SYNC, PROMOTION, HOTFIX, WIRE), for each the capability that owns its content, and `invalid`: ["DEFAULT"] (this consumer never routes by the fallback template; Owner and CPO, via release C138). The areas of a TYPE stay in `write-areas.json` (C36). The file holds no chapter, no text and no recognition rule.
2. **Content owners (named, each declares through Hosting):** `kaal-change` for PLAN, DO, ACT and HOTFIX (the PDCA and change types); `kaal-release` for SYNC, PROMOTION and WIRE (the routes and gates). Their chapters, fixed text and recognition are declared in their own packages, in the form Hosting defines, each in its own Change.
3. **Hosting owns the generator and the declaration form.** Hosting asked for a versioned shape, a stable TYPE order, fixed text, recognition as data, DEFAULT invalid with its message, and no GitHub words in what owners declare. Those conditions are for Hosting's own PLAN; this Change does not decide them.
4. **C36's `recognised` and `elsewhere`** on HOTFIX and WIRE stay in `write-areas.json` until the owners declare recognition through Hosting; then that Change removes them. C37 does not touch them.
5. **Release's answers, recorded:** a WIRE is a head `wire/<name>` into `main`; a base under `wire/` receives SYNC. PLAN and DO do not gain `HOW TO WORK`; release removed it from the templates as decoupled. These belong in release's declaration, not here.
6. **Overlaps, stated:** the inventory above lists where the TYPEs, chapters and recognition are repeated today. Each owner migrates its own part into its declaration, and until then a Case in its own Change holds the copies equal.

## What this Change pins (Cases, plain `.test.mjs`)

- T1560: the file holds exactly the seven TYPEs, each with an `owner`, names DEFAULT under `invalid` and never as a TYPE, and carries no chapter or recognition key.
- T1561: the owners are as ruled: `kaal-change` for PLAN, DO, ACT, HOTFIX; `kaal-release` for SYNC, PROMOTION, WIRE.
- T1562: the file and `write-areas.json` list the same TYPEs.

All three are RED against `main`: the file does not exist.

## Questions for the CPO

1. Is the split of owners right, with HOTFIX content under `kaal-change` as the PDCA and change types owner, and WIRE under `kaal-release`?

## Not in this Change

No template, generator (Hosting's), declaration form, body builder, workflow, ruleset, WIRE or change to what the judges check.
