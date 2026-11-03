# Agent Skills specification conformance

Evidence that `kaal-engineer-skill` conforms to the [Agent Skills specification](https://agentskills.io/specification), from shared fixtures judged by KAAL's validator and by the reference validator, [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref). The specification is the authority. skills-ref is a second implementation of it, not a higher one.

| File | What it is |
|---|---|
| [cases.mjs](cases.mjs) | 82 fixtures, each tied to a specification section, with the specification's verdict, both validators' recorded verdicts and, where they differ, the classification and why |
| [fixtures.mjs](fixtures.mjs) | writes the fixtures through kaal-hosting and reads KAAL's verdict the way `check-skill` reaches it |
| [../conformance.test.mjs](../conformance.test.mjs) | re-observes KAAL on every fixture and on the packaged skill, and holds the record to its classification rules. It runs in the package's tests, so in the Workspaces lane, and needs no skills-ref |
| [compare.mjs](compare.mjs) | re-observes both validators and writes [results.md](results.md) |
| [results.md](results.md) | the observed verdicts and findings of both, case by case |

## Compared

- **Specification**: the text of https://agentskills.io/specification, taken from its source, `docs/specification.mdx` in [agentskills/agentskills](https://github.com/agentskills/agentskills) at `69ef37e9424c0a7ea9dd2293b559e43ec8176379` (SHA-256 `b9079c0c10b7930e8c6a20ff2bc10cda2a3343c55185120e3f1116a1a529b220`, also recorded in results.md). The site itself was not reachable from the environment that produced this evidence; the page is built from that file.
- **skills-ref 0.1.1** from PyPI (wheel SHA-256 `d35db5bb8de71ae301daf5ca9cb71f8a555e8c6f83a6d40e46a5bc09f8f461b5`), which parses with StrictYAML 1.7.3. It matches `skills-ref/src` at the commit above, except that it reads `SKILL.md` as UTF-8 explicitly. Its command is named `agentskills`.
- **kaal-engineer-skill 0.0.1** as merged into `kaal/engineer-skill` by #70, with the compatibility correction that followed #71: yaml 2.9.1 and commonmark 0.31.2.

## Reproduce

```sh
npm test -w kaal-engineer-skill        # KAAL's verdicts, as CI runs them

python3 -m venv .venv && .venv/bin/pip install skills-ref==0.1.1
node packages/skills/kaal-engineer-skill/test/conformance/compare.mjs \
  --skills-ref .venv/bin/agentskills --spec <path>/docs/specification.mdx --write
```

`compare.mjs` exits 1 if either validator gives a verdict other than the recorded one, so a new skills-ref or a change in KAAL shows up as a mismatch rather than a silent drift. skills-ref is evidence only: nothing in the package or CI depends on it or on agentskills.io.

## Coverage matrix

Mandatory requirements are what the specification states with "must", "required" or a hard limit. Recommendations are its "should", "recommend" and "keep". Each row names the fixtures in cases.mjs that exercise it.

| Specification | Requirement | Kind | Fixtures | KAAL | skills-ref |
|---|---|---|---|---|---|
| [Directory structure](https://agentskills.io/specification#directory-structure) | A skill is a directory containing `SKILL.md`; any other files are allowed | mandatory | `dir-skill-md-missing`, `dir-lowercase-skill-md`, `dir-any-other-files` | enforced | enforced, also accepts `skill.md` |
| [SKILL.md format](https://agentskills.io/specification#skill-md-format) | YAML frontmatter followed by Markdown | mandatory | `fm-absent`, `fm-unclosed`, `fm-not-first`, `fm-closing-trailing-space`, `fm-crlf`, `fm-bom`, `fm-empty`, `fm-sequence`, `fm-no-body` | enforced | enforced |
| [Frontmatter](https://agentskills.io/specification#frontmatter) | The frontmatter is YAML | mandatory | `fm-invalid-yaml`, `fm-duplicate-key`, `fm-comments`, `fm-quoted`, `fm-block-scalars`, `fm-flow-mapping`, `fm-anchor-alias`, `fm-explicit-tag`, `fm-dashes-in-value` | full YAML 1.2 | StrictYAML subset |
| [Frontmatter](https://agentskills.io/specification#frontmatter) | The fields are those of the table | mandatory (inferred) | `fm-unknown-field`, `fm-field-case`, `dir-every-field` | enforced | enforced |
| [name field](https://agentskills.io/specification#name-field) | Required; 1-64 characters | mandatory | `name-missing`, `name-empty`, `name-null`, `name-one-char`, `name-64`, `name-65` | enforced | enforced |
| [name field](https://agentskills.io/specification#name-field) | Lowercase alphanumerics and hyphens; no leading, trailing or consecutive hyphen | mandatory | `name-valid-*`, `name-uppercase`, `name-leading-hyphen`, `name-trailing-hyphen`, `name-double-hyphen`, `name-underscore`, `name-dot`, `name-quoted-digits`, `name-plain-digits`, `name-unicode-lowercase`, `name-fullwidth`, `name-padded` | enforced, ASCII | enforced, Unicode, NFKC, stripped |
| [name field](https://agentskills.io/specification#name-field) | Matches the parent directory name | mandatory | `name-dir-mismatch` | enforced | enforced |
| [description field](https://agentskills.io/specification#description-field) | Required; 1-1024 characters; non-empty | mandatory | `description-missing`, `description-empty`, `description-whitespace`, `description-one-char`, `description-1024`, `description-1025`, `description-1024-astral`, `description-number` | enforced | enforced |
| [description field](https://agentskills.io/specification#description-field) | Says what the skill does and when to use it, with keywords | recommendation | `description-poor` | not judged | not judged |
| [license field](https://agentskills.io/specification#license-field) | Optional; a license name or a bundled file; keep it short | recommendation | `license-name`, `license-empty`, `license-sequence`, `dir-every-field` | requires a non-empty string | not checked |
| [compatibility field](https://agentskills.io/specification#compatibility-field) | Optional; 1-500 characters if provided | mandatory | `compatibility-500`, `compatibility-501`, `compatibility-empty`, `compatibility-whitespace`, `compatibility-number` | enforced | upper bound only |
| [metadata field](https://agentskills.io/specification#metadata-field) | Optional; a map from string keys to string values | mandatory | `dir-optional-example`, `metadata-empty-map`, `metadata-unquoted-number`, `metadata-number-key`, `metadata-nested`, `metadata-scalar`, `metadata-sequence`, `metadata-null` | enforced, YAML 1.2 types | not checked |
| [allowed-tools field](https://agentskills.io/specification#allowed-tools-field) | Optional; a space-separated string (experimental) | mandatory | `allowed-tools-example`, `allowed-tools-sequence`, `allowed-tools-empty` | enforced, non-empty | not checked |
| [Body content](https://agentskills.io/specification#body-content) | No format restrictions | mandatory | `fm-no-body` and every body | not restricted | not restricted |
| [Optional directories](https://agentskills.io/specification#optional-directories) | `scripts/`, `references/`, `assets/` conventions | recommendation | `dir-any-other-files` | not judged | not judged |
| [Progressive disclosure](https://agentskills.io/specification#progressive-disclosure) | `SKILL.md` under 500 lines | recommendation | `body-499-lines`, `body-500-lines` | warns | not checked |
| [Progressive disclosure](https://agentskills.io/specification#progressive-disclosure) | Body under 5000 tokens | recommendation | none | not judged | not judged |
| [File references](https://agentskills.io/specification#file-references) | Relative paths from the skill root; one level deep | recommendation | `ref-example-present`, `ref-example-absent`, `ref-outside`, `ref-absolute`, `ref-url-and-anchor`, `ref-image-present`, `ref-two-levels` | KAAL rule: references resolve inside the skill | not checked |

## Differences, classified

There are 29 cases where the verdicts differ from each other or from the specification. Each is classified in cases.mjs, with its reason.

**Specification violation (0).** #71 found one: KAAL rejected `compatibility: "   "`, because it trimmed before counting, while the specification's only requirement on compatibility is 1-500 characters and, unlike description, adds no "Non-empty". KAAL now counts compatibility untrimmed, so `compatibility-whitespace` passes and `compatibility-empty` still fails. KAAL accepts nothing the specification rejects and rejects nothing it requires accepting.

**KAAL-specific rule (3).** `ref-example-absent`, `ref-outside`, `ref-absolute`: every relative file reference in `SKILL.md` must name a file the skill carries. The specification recommends relative paths but does not make other references invalid. KAAL reports these as kind `kaal`, never `standard`, as it should.

**Advisory guidance (1).** `body-500-lines`: KAAL warns at 500 lines and passes; skills-ref is silent. Neither validator judges description quality, directory conventions, reference depth or the token budget, which is right for recommendations.

**Reference-validator difference (25).** These fall into four groups.

- *skills-ref departs from a definite requirement that KAAL follows (8):* it accepts a lowercase `skill.md`, an empty compatibility, a padded name (it strips it), and a nested, scalar or sequence metadata and a sequence allowed-tools (it checks no type for either). And `fm-dashes-in-value`: it finds the closing delimiter by splitting on the first `---` anywhere, so a quoted value containing `---` fails, and an unquoted one passes with a truncated description.
- *YAML dialect (5):* skills-ref parses with StrictYAML, which refuses flow style, anchors, aliases and tags, all of which are valid YAML (`fm-flow-mapping`, `fm-anchor-alias`, `fm-explicit-tag`, `metadata-empty-map`), and it does not accept a byte order mark (`fm-bom`). The specification asks for YAML; KAAL reads YAML.
- *Which YAML values are strings (7):* StrictYAML reads every scalar as a string, so `name: 123`, `description: 42`, `compatibility: 3`, metadata `version: 1.0` and a numeric metadata key pass skills-ref, while KAAL, reading YAML 1.2, reports them as not strings and tells the author to quote them. `license-sequence` and `metadata-null` are the same question for non-scalars. The specification's example quotes `"1.0"`, which supports KAAL's reading, but it never names a YAML schema.
- *Where the specification's text is open (5):* `name-unicode-lowercase` and `name-fullwidth` ("unicode lowercase alphanumeric characters (`a-z`, `0-9`)": skills-ref takes the words, KAAL the parenthesis); `fm-closing-trailing-space` (the delimiter lines are defined only by example); and `license-empty`, `allowed-tools-empty`, which the specification neither requires nor forbids, while KAAL reports them as `standard`.

## The packaged Engineer Skill

`skills/kaal-engineer-skill`, the Agent Skill the package ships (its `files` carry `skills/` unchanged), passes KAAL with no findings or warnings and passes skills-ref, as recorded in results.md and re-checked by `conformance.test.mjs`. Its frontmatter uses only plain ASCII strings for the six standard fields, so its verdict depends on none of the open questions above. The existing acceptance test also passes it installed from the packed tarball, wherever a host places it.

## Conclusion

KAAL's validator meets every mandatory requirement of the specification that a validator can check. It never accepts what the specification rejects, and since the compatibility correction it never rejects what the specification accepts. Its one rule beyond the specification, that references resolve inside the skill, is reported as `kaal` as it should be. Every other difference from skills-ref is either skills-ref departing from the specification, StrictYAML's subset of YAML, or a point the specification leaves open.

Unresolved, for the Owner:

1. **`standard` findings where the specification is open.** An empty `license` or `allowed-tools`, a non-string `license`, an empty `metadata`, and a non-ASCII lowercase name are reported as violations of the standard, but its text does not settle them. Each is a reasonable reading. The Owner's ruling that the standard governs what is valid means each should either stay as KAAL's reading of the standard, become a `kaal` rule, or be accepted.
2. **The YAML schema question.** KAAL's YAML 1.2 typing and skills-ref's all-strings reading differ on unquoted numbers and booleans. The specification's quoted `"1.0"` sides with KAAL; it would be settled upstream, not here.
