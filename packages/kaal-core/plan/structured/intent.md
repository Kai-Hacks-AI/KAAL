# Structured Frontmatter Values: Intent

This is `core/C27`, a PLAN Change. It ships no code. Its DO, `core/C27` DO, turns the planned tests GREEN, as `core/C24` plans it ("PLAN and DO").

`core/C24` (#518, approved) plans a Registration whose frontmatter is nested. That frontmatter holds:
- `kinds`, a mapping from each kind's name to its rule;
- `instances`, a list of mappings;
- trace targets that are either an identity or a `{ scope, id }` pair.

`core/C6`'s value kinds hold only scalars, lists of scalars, and one fixed mapping, the `ref`. So the Registration cannot be validated today, and `core/C24` names this Change as `core/C26`'s dependency (`core/A25`).

- **core/I19.** Nested frontmatter is as deterministic and as closed as flat frontmatter.
  - A Capability can declare a structured value, and every machine decision still rests on the frontmatter alone (`I1`).
  - Every part of a structured value is declared: there is no undeclared field and no prose field.
  - A broken part is named by where it is, not just by its top-level key (`I2`).
  - There is still no free-text value kind.

`core/C24`'s shapes and its planned tests are not changed here. This Change adds what is needed to declare them, and nothing that would let a schema describe less exactly.
