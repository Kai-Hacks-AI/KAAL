# Structured Frontmatter Values: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A29** [core/F57–core/F61, core/N17]: The three value kinds are added to `kaal-core/frontmatter`'s `checkSchema` and `validate`.
  - **What stays.** There is no new export, and the `Finding` shape only gains the optional `at`. Reading the YAML stays Graph's (`A2`). `kaal-graph/form`'s `readFrontmatter` already returns nested mappings and lists, so Graph needs no Change.
  - **What a Capability writes.** It declares a structured value in the JSON schema it already supplies. For example, `core/A25`'s trace target is `{ value: "either", of: [ <identity>, { value: "record", fields: { scope: <identity>, id: { …, required: true } } } ] }`.
  - **Identities.** A scope, an identity or a kind name is a `parameter` whose pattern requires one line of non-empty text, with no leading or trailing whitespace: `^\S(?:.*\S)?$`. That is opaque text, as `core/F48` requires, with nothing prose-shaped in it.
- **core/A30** [core/F57–core/F59]: Who uses it.
  - The Registration Type's schema is `core/C26`'s, written with these kinds, and `core/C26` tests it with a Registration Node passing `verify`.
  - Any Capability may use the kinds for its own Types (`F8`).
  - A Capability that validates its own Types without Core is never looser than `core/F57`–`core/F61` for a structured value it declares.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C27` PLAN, this Change | Core | `core/C24` (approved), `core/C6` |
| `core/C27` DO: `record`, `map` and `either` in `kaal-core/frontmatter`, with core/T60–core/T66 GREEN | Core | `core/C27` PLAN |
| `core/C26` DO: the Registration Type and `kaal-core/registration` | Core | `core/C24`, `core/C11`, `core/C27` DO, `graph/C3` |

`core/C24`'s Change graph is unchanged: it names `core/C27`, PLAN and DO, and plans a record kind. This PLAN adds `map` and `either` to it, because `core/A25`'s `kinds` is keyed by kind name and its rules and targets each take two forms, as core/T50–core/T59's fixtures show.
