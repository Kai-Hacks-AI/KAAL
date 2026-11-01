# kaal-core: Requirements

Each Requirement is summarized in one line, with the Intents it serves in brackets (see [Intent](intent.md)). `core/F…` is functional and `core/N…` nonfunctional. Numbers that do not appear here are not used. [Testing](testing.md) says which test checks each one.

## Frontmatter

- **core/N1** [core/I1]: KAAL's collaborative artifacts are Markdown whose YAML frontmatter is validated against the schema of the artifact's Type.
- **core/N2** [core/I1]: Validation is deterministic: the same bytes and schema give the same result on every supported host.
- **core/N3** [core/I1]: Machine contracts and machine-owned state stay JSON, outside core/N1.
- **core/F1** [core/I1]: A schema lists every key its Type allows, each with one value kind: `id`, `name`, `enum`, `ref`, `path`, `boolean`, `number` or `parameter`, optionally as a list or required. There is no free-text kind.
- **core/F2** [core/I2]: An undeclared key makes the artifact invalid, and the finding names it.
- **core/F3** [core/I1, core/I2]: Prose keys such as `description`, `summary` and `notes` are invalid in an artifact and in a schema.
- **core/F4** [core/I2]: A value of the wrong kind, a missing required key, or an undeclared list is invalid, and the finding names the key and the rule.
- **core/F5** [core/I1]: The result depends only on the frontmatter and the supplied Types. The body never changes it.
- **core/F6** [core/I2]: An artifact names its Type in `type` as `<Capability>/<Type>`. An artifact with no Type, or one the mapping does not hold, is `unknown`, never `valid`.
- **core/F7** [core/I1]: A `SKILL.md` follows the Agent Skills standard, is not a KAAL Node, and is deployed unchanged.
- **core/F8** [core/N1]: Each Capability owns its Types and schemas. Core owns only the generic machinery, and no Capability validator is looser than core/F1–core/F6.
- **core/N17** [core/I19]: Structured values are validated purely and deterministically, as deep as the schema is written.
- **core/F57** [core/I19]: `record` is a closed mapping of declared `fields`.
- **core/F58** [core/I19]: `map` is a mapping whose keys match a `parameter` declaration and whose values conform to `of`.
- **core/F59** [core/I19]: `either` conforms when any of its two or more alternatives does.
- **core/F60** [core/I19]: Declarations nest by the same rules, and a declaration breaking them makes the schema invalid.
- **core/F61** [core/I19]: A finding inside a structured value names where it is, with a JSON Pointer in `at`.

## Installation Contract and Agent Realization

- **core/N4** [core/I3]: The contract format, conformance checking and realization planning are pure. Hosting performs every read and write.
- **core/N5** [core/I3]: A contract is JSON. Conforming to the format is data and adds no runtime dependency on Core.
- **core/N6** [core/I4]: One placement table maps providers to Core's deployment locations, and it governs only Core's own deployments.
- **core/N7** [core/I3]: The runtime prerequisite is Node.js 24 or later.
- **core/F9** [core/I3]: A contract names its format by reference, its Capability and its version.
- **core/F10** [core/I3, core/I5]: It lists its assets (name, source, repository-relative target, kind). The lifecycle rules are the format's and the same for every asset.
- **core/F11** [core/I3]: Its catalogue lists, for each target, the SHA-256 of every content that target has had in a published version.
- **core/F12** [core/I3, core/I5]: It names the path of its installation record.
- **core/F13** [core/I3]: It states its lowest Node major version.
- **core/F14** [core/I4]: `provides` names the Skills an agent must reach, never a supplier location.
- **core/F15** [core/I3]: Conformance is decided by Core's conformance cases. Each finding names its member.
- **core/F16** [core/I4]: A repository declares its agent providers in `.kaal/config/core/agents.json`. Without it, a Skill goes only to `.agents/skills/<name>/`.
- **core/F17** [core/I4, core/I5]: The realization plan names each provider's deployment, copied from the canonical source. An unknown provider is reported, and no path is guessed.
- **core/F18** [core/I5]: Core keeps its own record of what it deployed. It keeps and reports a modified or foreign file and prunes only its own unmodified files.
- **core/F19** [core/I5]: Realizing a Capability's contract also writes the entries that Capability's own record needs.
- **core/F20** [core/I5]: Core never writes `AGENTS.md`, `CLAUDE.md` or any instruction file. Where a provider needs one, the plan proposes a pointer.
- **core/F21** [core/I4, core/I14]: Every deployed Skill file has the canonical source's bytes, everywhere.
- **core/F22** [core/I3, core/I4]: A plan lists what is written, kept, pruned and proposed, and which providers are unknown.
- **core/N10** [core/I3]: The record format, its check and registration in it are pure.
- **core/F33** [core/I3, core/I5]: A record maps each owned path to `{ sha256, version }`. Other members belong to the Capability and are kept byte for byte.
- **core/F34** [core/I5]: Core registers each asset file it writes in the contract's record and changes no other entry.
- **core/F35** [core/I5]: Core registers only what it wrote, even when a present file matches catalogued bytes.
- **core/F36** [core/I3, core/I5]: Every file has one owner and one record. Core's own record holds only its provider deployments of a contracted Skill.
- **core/F37** [core/I3, core/I5]: An asset marked `surface` is installed only by the Capability's own opt-in command, never by Core.
- **core/F38** [core/I3]: `checkRecord` returns a record's findings, each naming its member.
- **core/N18** [core/I20]: The conformance cases stay out of Core's runtime, import no test harness, and are pure.
- **core/F62** [core/I20]: Core states core/T10–core/T13 as cases over any contract instance, each returning its id, whether it holds, and what failed.
- **core/F63** [core/I20]: A case is judged against the instance. Each failure names the mutation that was not refused.
- **core/F64** [core/I20]: A mutation that cannot be applied is a failure, never a pass.
- **core/F65** [core/I20]: Core runs the same cases against its own sample contract.

## Typed artifacts

- **core/N8** [core/I6, core/I8]: Recognition, resolution and Type states are deterministic and pure.
- **core/N9** [core/I8]: Core never writes, rewrites or moves a typed artifact.
- **core/F23** [core/I6]: A file whose frontmatter `type` is a `<Capability>/<Type>` string is a typed artifact, wherever it is. Any other file with frontmatter must be a Node in Form.
- **core/F24** [core/I6]: Any other string `type` is rejected as not in Form.
- **core/F25** [core/I6, core/I7]: The Engine reports each typed artifact with its path, Type and state, never as a Node.
- **core/F26** [core/I7]: A Type Definition is a Node typed by `KAAL Definition`, named `<Capability>/<Type>`, whose `capability` reference names its owning Capability.
- **core/F27** [core/I7]: **Registered**: exactly one Type Definition of that name, owned by the Capability the prefix names.
- **core/F28** [core/I7]: **Unregistered**: no Node of that name. The finding gives the next step.
- **core/F29** [core/I7]: **Unknown**: identity or ownership cannot be established.
- **core/F30** [core/I7, core/I8]: **Invalid**: a supplied schema fails. This takes precedence over every other state.
- **core/F31** [core/I8]: The state depends only on the admitted Nodes, the frontmatter and the supplied Types.
- **core/F32** [core/I7]: `kaal verify` lists each typed artifact with its state, fails on an unknown one (and an invalid one when Types are supplied), and never on an unregistered one.

## Core as a package

- **core/N11** [core/I9, core/I11]: Core depends on no discipline. It declares no KAAL package beyond Graph (build only), Hosting and Foundation.
- **core/F39** [core/I10]: The payload carries a `LOVE` Definition beside `CASE`, with no change to the Kernel or any existing id.
- **core/F40** [core/I9, core/I10]: Core is a Capability of its own, with a `Core` Node and an ownership claim kept as repository data.
- **core/F41** [core/I10]: Every entry point and exported value is named in the README, and nothing else resolves.
- **core/N12** [core/I12, core/I13]: Every lifecycle step is planned by Core and applied by Hosting in one guarded reconciliation. A refused step changes nothing.
- **core/F42** [core/I13]: kaal-core ships its own Installation Contract, `installation.kaal.json`, for its payload.
- **core/F43** [core/I12]: `kaal init` records each file it writes, and `kaal version` prints the running and recorded versions.
- **core/F44** [core/I12, core/I5]: `kaal upgrade` installs, replaces, adopts, keeps or removes each file by the format's rules, refuses a result that would not verify, and is idempotent.
- **core/F45** [core/I12, core/I5]: `kaal remove` removes every unmodified file Core's record holds, then the record, and keeps and reports the rest.
- **core/F46** [core/I12]: The lifecycle acts on `./.kaal`. With `--engine`, `upgrade` and `remove` are refused.
- **core/N13** [core/I14]: Core states no Skill format and never parses or rewrites a `SKILL.md`.

## Standalone

- **core/F76** [core/I24]: kaal-core has no runtime dependency on Graph's package.
- **core/F77** [core/I24]: No source file imports Graph's package. Core's lookups by name and id are its own index of admitted Nodes.
- **core/F78** [core/I24]: Installed in a clean directory with no Graph, kaal-core imports and admits its own payload.
- **core/F79** [core/I24]: kaal-core ships Graph's Node Form and identity as byte-identical copies with a provenance manifest, checked at build and when installed.
- **core/F80** [core/I24]: Registration admission needs no Graph. Graph's reach, incoming views and cycles are an optional complement, unavailable without Graph, and never a reason to fail.
- **core/N20** [core/I24]: When Graph is absent, what only Graph gives is unavailable and says so. It is never a false GREEN.

## Registration

- **core/N14** [core/I17]: Assembly is deterministic and pure, in any order.
- **core/N15** [core/I16]: A relationship is stored once, with the instance it goes out from.
- **core/N16** [core/I18]: Registration is optional, and an Engine with no registrations verifies as before.
- **core/F47** [core/I15, core/I16]: A registration states its holder, the scope it claims, the kinds it defines with their outgoing rules, and the instances it holds with their traces.
- **core/F48** [core/I15]: An instance's identity is non-empty opaque text, unique in its scope. Core prescribes no grammar.
- **core/F49** [core/I15]: Two claims of one scope are a collision finding, and one identity stated twice is a finding.
- **core/F50** [core/I15, core/I16]: A kind belongs to its owner's scope. A reference that resolves to no kind is a finding that lists its candidates.
- **core/F51** [core/I16]: A kind's outgoing rule is its owner's alone: a list of kinds or `any`. Core builds in no rule and no acyclicity requirement.
- **core/F52** [core/I16, core/I17]: A trace is permitted only when its target resolves and the source kind's rule permits the target's kind.
- **core/F53** [core/I17]: With Graph present, cycles are observed and reported, never judged by Core.
- **core/F54** [core/I16]: Incoming views are derived. A registration that states an incoming trace is refused.
- **core/F55** [core/I16]: An instance with no trace is reported as untraced, and no trace is inferred.
- **core/F56** [core/I17, core/I18, core/I21]: The result reports claims, findings, cycles (unavailable without Graph), untraced instances and shared terms. `kaal verify` fails only on a collision or a finding.
- **core/F66** [core/I21]: A term defined in two or more scopes is reported as a shared term, unaligned, with nothing merged.
- **core/F67** [core/I21]: A bare kind name resolves only in its own scope. Otherwise the finding lists the candidates, and Core chooses none.

## Release

- **core/N19** [core/I22]: No delivered document refers a consumer to a file that does not ship.
- **core/N23** [core/I22, core/I23]: The installed verification writes only in a scratch directory it removes, and leaves the consumer's project as it was.
- **core/F68** [core/I22]: 0.0.1 contains the Kernel and foundational Nodes, admission, frontmatter validation, the Installation Contract and its conformance cases, Agent Realization, the lifecycle commands, `kaal verify` and registration. See [Limitations](limitations.md) for what it leaves out.
- **core/F69** [core/I22, core/N19]: The package ships these six documents, and the README links each.
- **core/F70** [core/I22]: `npm test` in an installation runs the delivered tests against the installed copy and ends in exactly one result: `verified`, `failed` or `cannot verify`.
- **core/F71** [core/I22]: [Testing](testing.md) separates delivered tests from the publisher's and states coverage.
- **core/F72** [core/I23]: The packed artifact is accepted in a clean installation: the installed files are exactly the manifest's, `npm test` ends in `verified`, and damage is never `verified`.
- **core/F73** [core/I23]: Every runtime dependency is installable by a consumer at release.
- **core/F74** [core/I23]: kaal-core publishes as `@kaihacksai/kaal-core`, and its KAAL runtime dependencies under `@kaihacksai/kaal-*`.
- **core/F75** [core/I22, core/I23]: `npm test` is comprehensive in the source workspace and runs only the consumer verification in an installation. The place is detected explicitly.
- **core/F85** [core/I22, core/I23]: The package ships one manifest, `test/verify.json`, with each shipped file's SHA-256 and each required test case with the `core/…` identifiers it tests.
- **core/F86** [core/I22]: The package declares Node.js 24 or later and names Linux, macOS and Windows as supported platforms.
- **core/F87** [core/I22, core/I23]: Each run emits one execution record naming the candidate and each required case's outcome. Core stores no evidence in the consumer's environment.
- **core/F88** [core/I22, core/I23]: No operating-system decision is made outside Hosting, test implementations included.
