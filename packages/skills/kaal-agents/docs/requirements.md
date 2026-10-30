# Agents: Requirements (what)

Each Requirement names, in brackets, the Intents it serves. The Intents are in [Intent](intent.md).

**Core's package.** Core is published as `@kaihacksai/kaal-core`. Until Core carries that name, `kaal-agents` also accepts the name it carries today, `kaal-core`. Below, "Core's package" means either name, scoped first.

## Functional

- **agents/F1** [agents/I1]: `kaal-agents orient [<dir>] [--json]` reports what can be discovered about the operating context of `<dir>`, which defaults to the working directory. It reads durable sources only.
  - **setting:**
    - `engineered` when `<dir>` carries KAAL's own source (`packages/kaal-core/package.json`, naming Core's package);
    - otherwise `embedded` when it holds a `.kaal/` Engine;
    - otherwise `outside`.

    Each setting is reported with its evidence paths.
  - **repository:** the Git HEAD commit (or `null` on a branch with no commit yet), the branch (or `null` when detached), and the upstream with its ahead and behind counts (or `null` when there is no upstream). `repository` is `null` outside any repository.
  - **inFlight:** every path Git reports as changed, staged or untracked. It is `null` when Git cannot read the status, or outside any repository.

  A value Git does not have is `null`. A value Git failed to give is `null` as well, and its failure is listed under `unresolved`, so a failed read never looks like an absent value or a clean tree.
  - **instructions:** whichever of `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` and `.agents/skills/*/SKILL.md` exist and are readable files. They are listed, not interpreted.
  - **owners:** every `ownership.kaal.json` claim outside `node_modules/` and `.git/`, each with its path, its `owner` and its `paths`.
  - **catalog:** with an Engine, the Capabilities, Agents, Skills and Extensions that Core's `catalog` lists for it. The status is `listed`, `unresolved` or `not applicable`.
  - **unresolved:** every discovery part that could not be established, each with `what` and `reason`. Examples:
    - no Git repository, or a Git read that failed;
    - no Core's package installed, or something installed under its name that does not provide Core's `catalog`;
    - an instruction file that cannot be read;
    - a claim that is not valid JSON.
- **agents/F2** [agents/I2]: **Discovery is not authorization.** The repository state, the instruction files and ownership claims found, and the catalog are each a source an Agent may read. None of them, alone or together, establishes the authority to act.
  - `orient` reports `authority` separately from discovery, always with `status: "unresolved"`. It lists the discovered `sources`, or none, with the reason that `orient` discovers and does not authorize.
  - `orient` never reports authority as established, verified or granted.
  - Establishing authority is the Agent's work under PREACH: read the sources, and where they do not settle it, consult the accountable person.
- **agents/F3** [agents/I1, agents/I4]: `orient` exits with:
  - 0 when every discovery part was established;
  - 2 when it reported, but a discovery part is unresolved;
  - 1 on a usage error, such as `<dir>` not being a directory.

  Authority is unresolved by design (agents/F2), so it does not decide the exit status. The human-readable output opens with `authority: unresolved (orient discovers; it does not authorize)`. An error names its cause and prints no stack trace.
- **agents/F4** [agents/I3]: `kaal-agents preach check <report.json>` checks a PREACH report's **structure** against the PREACH Definition. It is explicitly structural:
  - It never decides meaning.
  - It never verifies that an authority grants what is claimed.
  - It never reports anything as semantically resolved.

  The report:
  - `finding` is the program's report, carried verbatim and never interpreted;
  - `reportedBy` names the program;
  - `candidates` lists one or more entries, each with `term`, `scope`, `owner` and `definition`;
  - `resolution` is either `{ status: "unresolved", consult, question }` or `{ status: "resolved", chosen: { scope, term }, authority }`.

  A structurally valid report exits 0 and prints one line:
  - `PREACH report structurally valid: unresolved, consult <consult>: <question>`, or
  - `PREACH report structurally valid: resolution claimed under <authority>: <scope>/<term> (authority not verified)`.

  An invalid report exits 1 and names each problem:
  - no candidates;
  - a candidate without a scope;
  - two candidates with the same scope and term;
  - a resolution claimed with no authority, or an empty one;
  - a choice without a scope, which is ambiguous when candidates share its term;
  - a choice that is not among the candidates;
  - an unknown member.

  A file that is unreadable, or is not JSON, exits 2. Candidates that share a term in different scopes are valid and stay distinct.
- **agents/F5** [agents/I1, agents/I2, agents/I3]: The package carries `skills/kaal-agents/SKILL.md`, named `kaal-agents`. It instructs an Agent to:
  - run `orient` when it starts work;
  - read the instruction files it lists;
  - treat those files and the ownership claims as sources, not as authority: act only where the authority they state is clear, and otherwise consult the accountable person;
  - handle what is unresolved through PREACH, consulting a person when no authority covers it.

  The Skill takes its form from the Engineer Skill.
- **agents/F6** [agents/I4]: The package carries `docs/` with `intent.md`, `requirements.md`, `architecture.md`, `operations.md`, `limitations.md` and `testing.md`, and the README links each of them. `docs/operations.md` is the authoritative Operations document. This is Agents' realization of KAAL's generic package documentation (packaging/F8).
  - Every identifier a delivered case cites is defined there.
  - No document cites a path of the publisher's repository or a Change as its authority.
- **agents/F7** [agents/I4]: `test/verify.mjs` is Agents' Embedded verification: it verifies the installed package from the installed copy alone. It runs directly with `node` from the consumer's project, and is the command an installation's `npm test` will run (packaging/F9; see [Limitations](limitations.md) for this version).
  - It checks the installed files against the shipped manifest, `test/verify.json`, which lists every other shipped file with its SHA-256 and every delivered consumer case by name (packaging/F11).
  - It runs exactly the declared cases, in a scratch directory it removes afterwards, and checks that the consumer's project, the installed copy included, is unchanged by the run (packaging/N7).
  - It checks coverage: each identifier the documents define is covered by delivered cases that passed in this run, allocated to the publisher, or named as verified by no Test Case, as the manifest declares (packaging/F13). It names those this run did not verify.
  - It ends in exactly one result: verified (exit 0), failed (exit 1) or cannot verify (exit 2), Testing's unknown.
    - **failed:** a declared case failed, or the consumer changed during the run.
    - **cannot verify:** a prerequisite is missing; the manifest is absent or cannot be read; it declares no cases; an installed file differs from the manifest, is missing or is not in it; a declared case was skipped, marked todo or did not run; a case ran that the manifest does not declare; or a defined identifier has no declared coverage.
    - **verified:** none of these.
  - Its last line is the summary: `kaal-agents-verification ` followed by JSON with `result`; when not verified, `cause`, `evidence` and `next { kind, step }`; `package { name, version, location }`; `platform`; `node`; `digest`, the SHA-256 of one line `<path>\0<sha256>\n` per installed file other than the manifest, in path order; `cases`, each `{ name, outcome }` with outcome `pass`, `fail`, `skipped`, `todo` or `not run`; and `coverage`.

  It realizes Testing's consumer-verification semantics (testing/F11–testing/F17) in Agents' own code, and depends on no Testing or Packaging package (packaging/N8).
- **agents/F8** [agents/I4]: The publisher's own tests are outside the package's `files`, because they need the KAAL checkout. `test/consumer/`, `test/verify.mjs` and `test/verify.json` ship.
- **agents/F9** [agents/I5]: The package keeps delivering `capability/Agents.md`, `NEW.md` and `PREACH.md`. Admission still requires only Core's KAAL Capability.

## Nonfunctional

- **agents/N1** [agents/I4, agents/I5]: No runtime dependency. `bin/`, `lib/` and the consumer tests import only Node built-ins and the package's own files.
  - Core's `catalog` is reached only through the consumer's own installation of Core's package, resolved from `<dir>`.
  - When it is absent, the catalog is unresolved and names the package names it looked for.
- **agents/N2** [agents/I1]: Determinism. The same repository state gives the same report, byte for byte. Paths are relative, with forward slashes, and sorted.
- **agents/N3** [agents/I2, agents/I3, agents/I4]: Honesty. Absence, failure, and authority that is missing or unverified are reported as unresolved, failed or cannot verify, never as success.
- **agents/N4** [agents/I2]: Read-only. `orient` and `preach check` write nothing, in `<dir>` and its `.git/` included, and use no network.
- **agents/N5** [agents/I4]: Platforms. It behaves the same on Linux, macOS and Windows, under Node 24 or later.
- **agents/N6** [agents/I5]: Boundary.
  - The package declares no KAAL element beyond its three Nodes and its Skill.
  - It writes no registry or state of its own.
  - It never reads an Engine's files except through Core.
- **agents/N7** [agents/I5]: Additive. The ids of `Agents`, `NEW` and `PREACH` are unchanged, and the existing tests stay GREEN.
