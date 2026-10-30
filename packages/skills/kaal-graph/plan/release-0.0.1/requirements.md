# Graph 0.0.1: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **graph/F5** [graph/I4]: The package carries `docs/` with Intent, Requirements, Architecture, Operations, Limitations and Testing, and the README links each of them.
  - The documents state what `.`, `./form` and the CLI promise, including graph/N2's cost bound for `reach`, `reverse` and `cycles`.
  - They link only files that ship, and send no consumer to a plan or an Engineering path.
  - Every identifier a delivered case cites is defined there.
- **graph/F6** [graph/I4]: `npm test` is the consumer's entry, and it builds nothing. It runs `test/verify.mjs`, which:
  - checks the installed files against the shipped manifest, `test/verify.json`;
  - runs every embedded case (`test/embedded/`) against the installed copy;
  - ends in exactly one result: verified (exit 0), failed (exit 1) or unknown, printed as "cannot verify" (exit 2).

  A changed or missing shipped file is failed. Fewer cases run than declared, or none, is unknown, never verified. This realizes testing/F13 in Graph's own code, cites it, and depends on no Testing package.
- **graph/F7** [graph/I4]: Every case is placed by what it verifies, not by what it needs today.
  - **Embedded Tests** verify shipped Graph behaviour. They ship in `test/embedded/` and run in the installed `npm test`. They import only `node:` built-ins, the package itself by name, and its runtime dependencies. A case that reaches the checkout today is adapted to the installed artifact: the CLI case runs the installed `bin`, and paths come from the package's own location.
  - **Engineering Tests** verify Graph's repository, packaging, release or integration with other KAAL packages. They stay in the repository, in `test/publisher/` and `test/acceptance/`, and never ship. Neither do `plan/` or `test/plan/`.
  - **External Tests**, whose contract belongs to a consumer, are none of Graph's today.

  Every existing case is placed exactly once, as `testing.md` inventories, so no behavioural coverage is lost and no authoritative Test Case runs from two places.
- **graph/F8** [graph/I5]: The package is named `@kaihacksai/kaal-graph`. Its runtime dependencies are `@kaihacksai/kaal-hosting`, once Hosting's rename lands, and `yaml@2.9.1`. All of them can be installed from the public registry.
- **graph/F9** [graph/I4, graph/I5]: Release acceptance. The packed tarball, together with its packed runtime dependencies, installs into a clean directory with no checkout. There:
  - the installed files are exactly the ones `docs/operations.md` lists;
  - `npm test` is verified, having run every embedded case;
  - a corrupted shipped file is never verified;
  - an empty case inventory is unknown;
  - the CLI runs.

## Nonfunctional

- **graph/N5** [graph/I6]: Additive. Every export, Node id and CLI behaviour is unchanged, and graph/T1–graph/T7 and Graph's existing tests stay GREEN.
- **graph/N6** [graph/I4]: Platforms. It behaves the same on Linux, macOS and Windows, under Node 24 or later.
- **graph/N7** [graph/I6]: Copyable Form. `form.mjs` and `node.mjs`, with `form.d.ts` and `node.d.ts`, import only `yaml`, `node:` built-ins and each other. Core's build copies these four files byte for byte (core/C32), so they must work on their own, with no other Graph file beside them.
