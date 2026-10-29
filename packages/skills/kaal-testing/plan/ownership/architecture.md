# Ownership Claims as Markdown: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A16** [testing/F35–testing/F39]: `kaal-testing/attribution` reads Markdown claims through Graph and Core, and adds only what its Type means.
  - `CLAIM_FILE` becomes `ownership.kaal.md`. During the transition, `LEGACY_CLAIM_FILE` is `ownership.kaal.json`, and `isClaimFile` finds both.
  - `TYPES` exports Testing's Type, `{ "Testing/Ownership": { keys: { kind, owner, paths } } }`, in Core's schema format. The schema is Testing's (`core/F8`). Core only checks it.
  - `readClaim(path, bytes)` reads a Markdown claim in three steps. `kaal-core/frontmatter`'s `validate(bytes, TYPES)` decides `valid`, `invalid` or `unknown`. `kaal-graph/form`'s `readFrontmatter` gives the values. Testing then checks the scope. Testing parses no YAML of its own (`core/A2`), and so it is never looser than Core.
  - `attribute` applies each claim's own pattern rules: testing/F36 for a Markdown claim, and the trailing-`/` rule for a JSON one.
  - **Dependencies.** `kaal-core` and `kaal-graph` become runtime dependencies of kaal-testing, needed by `./attribution` and declared in testing/A8's dependency inventory. kaal-graph already depends on kaal-testing for its own tests, which is a dev-only cycle within the workspace. `./attribution`, and `./report` with it, then cannot ship in a dependency-free 0.0.1 surface. They stay KAAL-internal, as `./acceptance` and `./coverage` do, until Core and Graph are published. This is the consequence that release decision 2 on #601 weighs.
- **testing/A17** [testing/F38]: **Migration order.** Each step is its owner's Change, and none touches another owner's tree.

  | Step | Change | Owner | Depends on |
  | --- | --- | --- | --- |
  | 1 | `testing/C24` PLAN, this Change | Testing | none |
  | 2 | `testing/C25` DO: A16, testing/T45–testing/T49 GREEN, Testing's README and Skill describe the Markdown claim | Testing | 1, and `testing/C15` merged first (one Change at a time) |
  | 3 | `measure.mjs` finds either claim file | Engineering | 2 |
  | 4 | Testing's own claim becomes `ownership.kaal.md` | Testing | 3 |
  | 5 | Each other Capability moves its own claim, in its own Change. Core also amends `core/F40` and core/T40, which pin `ownership.kaal.json` | each owner | 3 |
  | 6 | `testing/C26` ends the transition: JSON claims are no longer read | Testing | every claim on `main` moved |

  Steps 4 and 5 can run in any order once step 3 lands. Step 3 comes first so that `measure.mjs` never loses a claim it reads today. A collector still holding a JSON claim keeps working until step 6, which waits for `main`.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the claim format, the `Testing/Ownership` Type and its schema, how claims read, resolve and attribute, and the migration's order |
| Each Capability | its own claim: what it claims, its body, and the Change that moves it |
| Core | the generic frontmatter rules and validator (`core/C5`, `core/C6`), and its own claim and `core/F40` |
| Graph | reading YAML frontmatter (`kaal-graph/form`) |
| Engineering | `measure.mjs`, which follows Testing's format (step 3) |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C24` PLAN, this Change | Testing | none |
| `testing/C25` DO | Testing | `testing/C24` |
| `engineering/C…` `measure.mjs` reads either claim file, numbered by Engineering | Engineering | `testing/C25` |
| `testing/C26` end of the transition | Testing | every claim on `main` moved |

## Where it sits on the road to 0.0.1

It is not on the 0.0.1 critical path. A16 keeps `./attribution` KAAL-internal, so the 0.0.1 consumer surface (`testing/C21`) does not wait for it. Its DO, `testing/C25`, comes after `testing/C15` (#630) and before `testing/C16`, so that Engineering and the other Capabilities can move their claims while the rest of 0.0.1 proceeds.
