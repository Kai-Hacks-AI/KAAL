# Foundation as a capability: Requirements

Each Requirement names, in brackets, the Intents it serves. Where another capability owns the meaning, the Requirement cites it and does not restate it.

## Functional

- **foundation/F10** [foundation/I7, foundation/I4]: **Dogfood: the generic contract.** Packed and installed alone in a fresh consumer, `@kaihacksai/kaal-foundation` is a KAAL package under packaging/F7–F14 and packaging/N7–N9. Run on that installed copy with Testing's model functions, Packaging's `conform` verifies every finding, and `conformSource` verifies packaging/F14 on the source workspace. The suite is Packaging's and Engineering runs it (packaging/A7). Foundation imports neither, and the DO reports the suite's result on its packed candidate as evidence.
- **foundation/F11** [foundation/I7]: **Shipped manifest.** The package ships `test/verify.json`, in the form packaging/F11 and packaging/A10 read:
  - `files`: every other shipped file, by path, with its SHA-256;
  - `cases`: every delivered case, by name;
  - `model`: the delivered cases as Testing's model, `{ cases: [{ id, tests }] }` (testing/F25, testing/F66).

  A script writes it from npm's own pack list, and Foundation's own `sha256` computes every digest. The committed file is that script's output. A stale one fails the publisher's tests, so a stale manifest never packs.
- **foundation/F12** [foundation/I7, foundation/I6]: **Verification by case.** This amends foundation/F8. The installed verification, `test/verify.mjs`:
  - compares every file `files` lists with the installed copy;
  - runs every case file in `test/embed/`;
  - matches the cases that ran, by name, against `cases`.

  Its last line is `kaal-foundation-verification {json}`. The JSON holds `result`, `exit`, `cases` and `causes`. `cases` lists each executed case as `{ name, outcome }`, and `outcome` is `pass` or `fail` (testing/C29, #639). The verification ends in one result:
  - `verified` (0): the manifest matches, every declared case ran exactly once, and all of them passed;
  - `failed` (1): a declared case failed;
  - `cannot verify` (2): the manifest is missing or unreadable, a listed file is missing or differs from it, a declared case did not run, a case ran that is not declared, or no case ran.

  A file that differs from the manifest gives `cannot verify`, never `failed` (testing/F43). Consistency with the manifest is not provenance (testing/F14).
- **foundation/F13** [foundation/I7]: **Traceability.** The shipped documents define, as bold identifiers, the Foundation identifiers a consumer relies on. Each delivered case is a `node:test` test titled `foundation/T<n> [<targets>]: <what it checks>`. Its name is its leading identifier, and its targets are the identifiers it tests. Every target is defined in the shipped documents. The model's Cases are exactly the delivered cases, and Testing's `check` finds nothing in it. Which targets are evidenced is Testing's to derive (testing/F40). Foundation declares no coverage, allocation or unverified state.
- **foundation/F14** [foundation/I7]: **Commands.** The package declares a `bin`, `kaal-foundation`, with two commands:
  - `kaal-foundation sha256 [<file>…]` prints `<digest>  <file>` for each file, as `sha256sum` does. With no file, or with `-`, it hashes standard input. An unreadable file, an unknown command or option, or no command at all is reported on standard error with a usage line, and the exit status is 2. Otherwise the exit status is 0.
  - `kaal-foundation verify` runs the installed verification of foundation/F12 and exits with its status.
- **foundation/F15** [foundation/I7, foundation/I3]: **Skill.** The package ships one skill, `skills/kaal-foundation/SKILL.md`, in the shared skill format, with `name` and `description` in its frontmatter. It tells an agent:
  - when to use Foundation's SHA-256 instead of a host hash or a new implementation;
  - how to hash text: encode it as UTF-8 first;
  - how to check a digest with `kaal-foundation sha256`;
  - how to verify an installation with `kaal-foundation verify`, and how to read the three results;
  - where a new shared concern belongs: not in Foundation, unless the Owner reviews it as a provisional concern (foundation/I3).

  Every Foundation identifier it cites is defined in the shipped documents.
- **foundation/F16** [foundation/I7]: **Agent instructions.** The repository's `AGENTS.md` has a Foundation section, as every capability does (packaging/F18). The section says when to use Foundation and names the skill's path and both commands. It also says that Foundation holds reviewed, provisional concerns and is not a utilities bucket.
- **foundation/F17** [foundation/I7, foundation/I6]: **A declared source Test Plan.** This amends foundation/F9. The source workspace declares its Test Plan as named suites:
  - `test:embedded` is `node test/verify.mjs`;
  - `test:publisher` is `node --test` with an explicit list of `test/publisher/` files;
  - `test:all` is `node test/run.mjs`, the shipped runner;
  - `test` is `npm run test:all`, so packaging/F14 can tell from outside which declared suite `npm test` runs.

  Installed, the runner runs `test:embedded` alone and exits with its result, so its last line is the verification line. In source, it runs every declared `test:<name>` suite once, in declared order, except `test:all`, which is itself. Today those are `test:embedded` and then `test:publisher`. It ends on one bare result line: `failed` if any suite failed, `cannot verify` if any could not verify, and `verified` otherwise. The source markers are `plan/` and `test/publisher/`, and neither ships. The runner's refusals are unchanged.

## Nonfunctional

- **foundation/N7** [foundation/I7]: **No OS knowledge, in tests either.** No file in Foundation, tests included, reads `process.platform`, names `win32`, writes or runs a `.cmd` launcher, or passes `shell`. npm runs as its CLI script under the running Node, named by `npm_execpath` (foundation/C6). The command reads files with `node:fs` only. Hosting is the only OS boundary (hosting/F36, testing/F67).
- **foundation/N8** [foundation/I7]: **Thin commands.** `kaal-foundation` decides nothing the library does not. Its digests are `lib/sha256.mjs`'s, and `verify` is `test/verify.mjs`. The command adds argument parsing, reading, printing and exit statuses only.
- **foundation/N9** [foundation/I7, foundation/I2]: **Nothing a consumer computes changes.** `lib/sha256.mjs` and `lib/sha256.d.ts` are byte for byte the ones `main` holds today. The package still declares no dependency of any kind (foundation/N2, foundation/N6).
- **foundation/N10** [foundation/I7]: **An independent check.** The installed verification checks the manifest with the host's SHA-256 (`node:crypto`), never with Foundation's own `lib/`. A broken library therefore cannot hide itself (testing/N12). Foundation writes the manifest, and the host checks it on every installation. The verifier keeps no SHA-256 implementation of its own.

## Not in this Change

- Publishing Foundation, and the promotion of `kaal/foundation`. Both are the Owner's, and the coordinator serializes promotions.
- The version, which stays `0.0.1`.
- Packaging's suite and Engineering's lane that runs it.
- Any rule that every identifier must be tested. That waits on the Owner's decision on Testing #667.

## Amendment by the Owner's review of foundation/C8 (#712, comment 6544398985)

- **foundation/F18** [foundation/I7]: **Safe acquisition.** `kaal-foundation` is only the bin's name; the published package is `@kaihacksai/kaal-foundation`. Every consumer-facing example (README, `docs/`, the skill, and the repository's `AGENTS.md`) runs the command as `npm exec --no --package=@kaihacksai/kaal-foundation -- kaal-foundation …` after `npm install @kaihacksai/kaal-foundation`, and none recommends `npx kaal-foundation`. Where the scoped package is not installed, the documented command fails and never runs another package.

## Amendment foundation/C9: what npm publication needs (review of #717, issuecomment-6544821400)

- **foundation/F14, corrected.** `kaal-foundation verify` loads no library code itself. Where the installed library is changed or cannot load, it reports the verification's own result, `cannot verify` with exit 2, and never crashes. The library loads lazily, in `sha256` only.
- **foundation/F19** [foundation/I5]: **Publishable as is.** `package.json` declares `publishConfig.access: "public"`, because a scoped package's first publish is otherwise restricted. It also declares `repository` (`git+https://github.com/Kai-Hacks-AI/KAAL.git`, directory `packages/kaal-foundation`), because a publish with provenance checks it against the source repository. Publication itself, and the release workflow, stay outside Foundation: the Owner's and the release engine's.
