# Structured Frontmatter Values: Requirements

Each Requirement names, in brackets, the Intents it serves. `core/F1` (`plan/frontmatter/`) gains the three value kinds below. Its other kinds, and `core/F2` to `core/F8`, are unchanged.

## Nonfunctional

- **core/N17** [core/I19]: Structured values keep `N2`. Validation is pure and deterministic, and the same bytes and schema give the same result on every supported host. A schema is finite JSON, so a declaration nests only as deep as it is written.

## Functional

- **core/F57** [core/I19]: `record`: a mapping whose fields are declared in `fields`, each with its own declaration.
  - A record is closed. An undeclared field, a missing required field, and a field whose value does not conform each make the artifact invalid.
  - A prose field name (`core/F3`'s list) is invalid in an artifact, and in a schema.
  - A value that is not a mapping does not conform.
- **core/F58** [core/I19]: `map`: a mapping whose keys are data rather than declared fields.
  - It declares `key`, a `parameter` declaration every key must match, and `of`, the declaration every value must conform to.
  - A key that does not match, or a value that does not conform, makes the artifact invalid. An empty mapping conforms.
- **core/F59** [core/I19]: `either`: a value that conforms to at least one of the declarations listed in `of`, two or more.
  - A value that conforms to none is invalid.
  - `either` adds no kind of its own: each alternative is one of `core/F1`'s kinds.
- **core/F60** [core/I19]: Declarations nest.
  - `fields`, `of` and `key` hold declarations, checked by the same rules as a top-level one.
  - `list` may be declared at any level. `required` may be declared only on a top-level key or a record field, where it means present.
  - `fields`, `of` and `key` are allowed only with their own kind, and each is required with it. `fields` must declare at least one field.
  - A declaration breaking any of these rules makes the schema invalid.
- **core/F61** [core/I19]: Every finding inside a structured value names where it is.
  - `key` stays the top-level key.
  - `at` is added: the JSON Pointer (RFC 6901), within that key's value, of the part at fault, or within its declaration for a schema finding. Inside a list of structured values, it starts with the item's index.
  - A finding on a whole top-level value has no `at`. A value of `core/F1`'s other kinds, a list of them included, is named as today, by its key alone, so every existing finding is unchanged.
