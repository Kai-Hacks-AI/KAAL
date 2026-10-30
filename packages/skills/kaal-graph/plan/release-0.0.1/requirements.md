# Graph 0.0.1: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **graph/F5** [graph/I4]: The package carries `docs/` with Intent, Requirements, Architecture, Operations, Limitations and Testing, and the README links each of them.
  - The documents state what `.`, `./form` and the CLI promise, including graph/N2's cost bound for `reach`, `reverse` and `cycles`.
  - They link only files that ship, and send no consumer to a plan or an Engineering path.
  - Every identifier a delivered case cites is defined there.
- **graph/F6** [graph/I4]: `npm test` is the consumer's entry, and it builds nothing. It runs `test/verify.mjs`, which:
  - checks the installed files against the shipped manifest, `test/verify.json`;
  - runs every delivered case (`test/consumer/`);
  - ends in exactly one result: verified (exit 0), failed (exit 1) or unknown, printed as "cannot verify" (exit 2).

  A changed or missing shipped file is failed. Fewer cases run than declared, or none, is unknown, never verified. This realizes testing/F13 in Graph's own code, cites it, and depends on no Testing package.
- **graph/F7** [graph/I4]: Today's tests become `test:publisher`. They need the checkout, so they do not ship, and neither do `plan/` or `test/plan/`. The delivered cases cover:
  - the Form and identity of a Node;
  - Edge checks and traversal;
  - `reach`, `reverse` and `cycles`;
  - the CLI.
- **graph/F8** [graph/I5]: The package is named `@kaihacksai/kaal-graph`. Its runtime dependencies are `@kaihacksai/kaal-hosting`, once Hosting's rename lands, and `yaml@2.9.1`. All of them can be installed from the public registry.
- **graph/F9** [graph/I4, graph/I5]: Release acceptance. The packed tarball, together with its packed runtime dependencies, installs into a clean directory with no checkout. There:
  - the installed files are exactly the ones `docs/operations.md` lists;
  - `npm test` is verified;
  - a corrupted shipped file is never verified;
  - an empty case inventory is unknown;
  - the CLI runs.

## Nonfunctional

- **graph/N5** [graph/I6]: Additive. Every export, Node id and CLI behaviour is unchanged, and graph/T1–graph/T7 and Graph's existing tests stay GREEN.
- **graph/N6** [graph/I4]: Platforms. It behaves the same on Linux, macOS and Windows, under Node 24 or later.
- **graph/N7** [graph/I6]: Copyable Form. `form.mjs` and `node.mjs`, with `form.d.ts` and `node.d.ts`, import only `yaml`, `node:` built-ins and each other. Core's build copies these four files byte for byte (core/C32), so they must work on their own, with no other Graph file beside them.
