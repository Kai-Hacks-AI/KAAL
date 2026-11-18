# C71 inventory

What the repository holds on `main` at c8291dbd (18 Nov 2026), read, not inferred. Counts are of Markdown files with front matter under `engineering/`, `packages/` and `.kaal/` (138 files), and of recorded Cases.

## Objects and their identities

| Object | Where it lives | Count / example |
| --- | --- | --- |
| Intent | `01-intent/I<n>-<slug>/I<n>.md`, front matter `id` | 20; `release/I35` |
| Requirement | `02-requirements/F<n>-<slug>/F<n>.md`, `kind: functional` or `nonfunctional`, `serves: [Intent]` | 32 F, 5 N; `release/F22` serves `release/I4` |
| Architecture | `03-architecture/A<n>-<slug>/A<n>.md`, `addresses: [Requirement]`, optional `parent` | 31; `release/A47` addresses `release/F22`; 16 files carry `parent` |
| Defect | `06-defects/D<n>-<slug>.md` in Packaging's layout, a JSON record with `id`, `context`, `expected`, `observed`, `where`, `status`, `tests` | `hosting/D10`; none in release management |
| Case | a file exporting `id`, `tests`, `title`, `run`: `T<n>.test.mjs` (GREEN) or `.red.mjs` (RED) | `release/T511` tests `release/C37` |
| Change | a Change Node `C<n>.md` with `implements` and `closes`, in `00-changes/C<n>-<slug>/` beside `change.md`, `gap.md`, `evidence.md`, `act.md`, Cases | 44 ids; 37 of 40 folders have the Node |
| Control | `04-controls/CTL<n>-<slug>/CTL<n>.md`, front matter `id`, `title`, `description`, `type`, `has: [Intent]` | 6; `release/CTL1` has `release/I27` |
| Gap | a row of `gap.md`, `release/G<n>`; a Change `closes` it | 40 `closes` keys; `release/G93` |
| Stage | `05-src/stages/stages.json`, described in `strategy.md`: Developing, Integrating (Collecting, Hotfixing, Wiring), Promoting, Publishing | 4 |
| Change Record | `.kaal/changes/<capability>/YY/MM/DD/CC/` by Change's Definition; release management keeps `00-changes/C<n>-<slug>/` | |
| Evidence | `evidence.md`, `act.md` (the 4L), Case results, CI checks, the Review judgment | |
| PR | title `<TYPE>: <description>`, body in the envelope of the template of its TYPE | |

## Relationships in use

| In the files | Meaning | Observed | Owner's word |
| --- | --- | --- | --- |
| `implements` (Change Node) | Change to Intent | 32 | delivers |
| `serves` (Requirement) | Requirement to Intent | 33 | answers |
| `addresses` (Architecture) | Architecture to Requirement | 31 | answers |
| `export const tests` (Case) | Case to the ids it tests | Change, Intent, Requirement, Control | tests |
| `has` (Control) | Control to Intent | 6 | none |
| `closes` (Change Node) | Change to Gap | 40 | none |
| `parent` (Architecture) | Architecture to Architecture | 16 | none |
| `tests` (Defect record) | Defect to its Cases | in the Defect record | none |
| Delivers, Succeeds (kaal-change Definitions) | Change to Intent, Change to Change | no instance found in `main` front matter | delivers |

## Targets of `export const tests`

Among the Cases that declare it, the most frequent targets are Changes (`release/C39`, `C37`, `C58`, `C35`, `C65`, ...), then Requirements (`release/F22`), Controls (`release/CTL5`) and Intents (`release/I35`). Cases are not limited to the Owner's four targets.

## PR templates under `.github`

| Template | TYPE | Chapters |
| --- | --- | --- |
| `pull_request_template.md` | DEFAULT | Intent, Design, Verified by, Validated by |
| `PULL_REQUEST_TEMPLATE/plan.md` | PLAN | Change, From, To, Because |
| `PULL_REQUEST_TEMPLATE/do.md` | DO | Change, Implement, Refactor |
| `PULL_REQUEST_TEMPLATE/act.md` | ACT | Change, Records |
| `PULL_REQUEST_TEMPLATE/promotion.md` | PROMOTION | Change, Why now |
| `PULL_REQUEST_TEMPLATE/hotfix.md` | HOTFIX | Change, Defect, Urgency, Approach (and the cue) |
| `PULL_REQUEST_TEMPLATE/sync.md` | SYNC | Change, Reason |

Types seen in recent merged PRs: PLAN, DO, ACT, PROMOTION, SYNC, WIRE. WIRE has no template on `main` (release/A47 plans one).

## Lifecycle and classification (kaal-change Definitions)

Proposed, Accepted, Withdrawn, Promoted; read from facts and never stored. Classes Normal, Standard, Emergency. Approval, verification and validation are not states.

## Layout

Packaging's layout numbers the folders in GLUE order: `01-intent`, `02-requirements`, `03-architecture`, `04-test`, `05-src`, `06-defects`. Release management has `04-controls` where Packaging has `04-test`, and keeps its Cases beside the objects they test.

## Not found

Delivers and Succeeds instances; an Architecture that addresses a Defect; a Defect in release management; a Requirement or Architecture for release/I35; a Change Node for release/C37; a WIRE template; a `G<n>` object definition beyond the `gap.md` rows.
