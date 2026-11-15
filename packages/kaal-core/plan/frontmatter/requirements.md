# Deterministic Frontmatter: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **N1** [I1]: KAAL's collaborative human and Agent artifacts are Markdown whose YAML frontmatter is validated against the schema of the artifact's Type. This holds KAAL-wide, for every Capability's artifacts.
- **N2** [I1]: Validation is deterministic: the same bytes and the same schema give the same result on every supported host.
- **N3** [I1]: Machine-to-machine contracts and machine-owned state stay JSON. N1 does not apply to them.

## Functional

- **F1** [I1]: A schema lists every key its Type allows. Each key has exactly one value kind:
  - `id`: a qualified identifier, `<capability>/<letters><number>` with an optional lowercase suffix, such as `core/C5` or `guard/F23`;
  - `name`: a Node name, as the Kernel defines it;
  - `enum`: one of the values the schema lists;
  - `ref`: a reference, a mapping of exactly `name` and `id`, as the Kernel defines it;
  - `path`: a repository-relative path, written with `/`, with no empty, `.` or `..` segment;
  - `boolean`;
  - `number`;
  - `parameter`: a string matching the pattern the schema declares for that key.
  
  A key may be declared as a list of its value kind, and as required. There is no free-text value kind.
- **F2** [I2]: A key the schema does not declare makes the artifact invalid, and the finding names the key.
- **F3** [I1, I2]: Prose keys are forbidden: `description`, `summary`, `rationale`, `instructions`, `prompt`, `notes`, `comment` and `explanation`. An artifact carrying one is invalid. A schema declaring one is itself invalid, as is a schema declaring a value kind not listed in F1.
- **F4** [I2]: A value that does not match its key's value kind, a missing required key, and a list where none is declared each make the artifact invalid, and the finding names the key and the rule.
- **F5** [I1]: The result depends only on the frontmatter and the supplied Types. Changing the body never changes it.
- **F6** [I2]: An artifact names its Type in its `type` key, as `<Capability>/<Type>` in the owning Capability's Business Language, such as `Requirements/Functional` or `Testing/TestCase`. The Type selects the schema; it is not an identity, and an artifact's own `id` stays a qualified identifier such as `requirements/F12`. `type` is the discriminator for every schema, so no schema declares it. An artifact with no `type`, or with a Type the supplied mapping does not name, is `unknown`: it is never `valid`. A Type name that is not `<Capability>/<Type>` makes the mapping invalid.
- **F7** [I1] (amended by `core/C22`): The Agent Skills standard governs `SKILL.md`, including its prose `description`. The canonical Skill format is Engineer Skill's (`core/N13`), and Core deploys a `SKILL.md` unchanged (`core/F21`). A `SKILL.md` is a standard artifact, not a KAAL Node, and is outside N1.
- **F8** [N1]: Each Capability owns the Types it defines, their schemas, and their type-specific validation. Core owns only the generic machinery. A Capability can validate its own Types without Core, as Guard does when it is Embedded or External; such a validator is never looser than F1–F6.
