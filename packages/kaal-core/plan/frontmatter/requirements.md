# Deterministic Frontmatter: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **N1** [I1]: KAAL's collaborative human and Agent artifacts are Markdown whose YAML frontmatter is validated against the schema of the artifact's kind. This holds KAAL-wide, for every Capability's artifacts.
- **N2** [I1]: Validation is deterministic: the same bytes and the same schema give the same result on every supported host.
- **N3** [I1]: Machine-to-machine contracts and machine-owned state stay JSON. N1 does not apply to them.

## Functional

- **F1** [I1]: A schema names one artifact kind and every key that kind allows. Each key has exactly one value type:
  - `id`: a qualified identifier, `<capability>/<letters><number>` with an optional lowercase suffix, such as `core/C5` or `guard/F23`;
  - `name`: a Node name, as the Kernel defines it;
  - `enum`: one of the values the schema lists;
  - `ref`: a reference, a mapping of exactly `name` and `id`, as the Kernel defines it;
  - `path`: a repository-relative path, written with `/`, with no empty, `.` or `..` segment;
  - `boolean`;
  - `number`;
  - `parameter`: a string matching the pattern the schema declares for that key.
  
  A key may be declared as a list of its type, and as required. There is no free-text type.
- **F2** [I2]: A key the schema does not declare makes the artifact invalid, and the finding names the key.
- **F3** [I1, I2]: Prose keys are forbidden: `description`, `summary`, `rationale`, `instructions`, `prompt`, `notes`, `comment` and `explanation`. An artifact carrying one is invalid. A schema declaring one is itself invalid, as is a schema declaring a type not listed in F1.
- **F4** [I2]: A value that does not match its key's type, a missing required key, and a list where none is declared each make the artifact invalid, and the finding names the key and the rule.
- **F5** [I1]: The result depends only on the frontmatter and the schema. Changing the body never changes it.
- **F6** [I2]: An artifact names its kind in its `kind` key. An artifact with no `kind`, or with a kind no schema is given for, is `unknown`: it is never `valid`.
- **F7** [I1]: The Agent Skills standard requires a prose `description` in a supplier's `SKILL.md`. KAAL's canonical Skill source carries typed frontmatter only. The supplier `SKILL.md` is a provider deployment that Core's Agent Realization renders (`core/C3`, `core/C4`), with its `description` copied verbatim from a designated section of the canonical source's body. A rendered supplier file is a generated provider artifact, outside N1. F7 is stated here; it is tested in `core/C3`.
