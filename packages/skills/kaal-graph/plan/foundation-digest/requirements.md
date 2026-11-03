# One SHA-256 for Graph: Requirements

Each Requirement names, in brackets, the Intents it serves.

- **graph/F16** [graph/I12]: `node.mjs` imports `sha256` from `@kaihacksai/kaal-foundation/sha256` and computes no digest itself. The shipped scripts name no `node:crypto`. Graph's public `sha256` export stays, with the same signature and result, and is Foundation's function re-exported.
- **graph/F17** [graph/I12]: No Node id changes. For every byte string, `identify(bytes).id` is what it was before the change. graph/T19 holds fixed vectors, including the empty input, and is GREEN before and after.
- **graph/N11** [graph/I12]: Dependencies. `@kaihacksai/kaal-foundation` joins Graph's runtime dependencies beside `@kaihacksai/kaal-hosting` and `yaml`, as the Embedded rule allows. Foundation has no dependencies, so no cycle arises. Graph takes the version that C5 pins.
- **graph/N7 (amended, Owner-confirmed 3 Nov)** [graph/I12]: `form.mjs`, `node.mjs` and their declarations import no other Graph file, and from outside only `yaml`, `node:` built-ins and `@kaihacksai/kaal-foundation/sha256`. The allowed externals follow the EEE rule (Foundation and Hosting only; Hosting is not needed by these files). A byte copy works wherever Foundation and `yaml` are installed, which is true of Core (core/C32).
- **graph/Q3** (answered, Owner, 3 Nov): Graph may use Foundation's `sha256`; N7 is amended as above, not retired, because its "no other Graph file beside them" half is not covered by the EEE rule. Core's byte copy carries the same specifier, and Core reviews as importer owner.
- **graph/Q4** (open): Release slot. Graph publishes after Hosting, and Foundation precedes Core, so Foundation is on the registry before Graph needs it. Confirm there is no earlier constraint.
