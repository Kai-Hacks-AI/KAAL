# One SHA-256 for Graph: Requirements

Each Requirement names, in brackets, the Intents it serves.

- **graph/F16** [graph/I12]: `node.mjs` imports `sha256` from `@kaihacksai/kaal-foundation/sha256` and computes no digest itself. The shipped scripts name no `node:crypto`. Graph's public `sha256` export keeps its declared signature `(bytes: string | Uint8Array): string` and its behaviour (graph/F18). It is a thin input adapter over Foundation's `sha256`, not a digest.
- **graph/F17** [graph/I12]: No Node id changes. For every byte string, `identify(bytes).id` is what it was before the change. graph/T19 holds fixed vectors, including the empty input, and is GREEN before and after.
- **graph/F18** [graph/I12]: Public `sha256` compatibility, found while checking the CPO's question. Foundation's `sha256` throws a `TypeError` for anything but a `Uint8Array`, but Graph's today (via `createHash`) also accepts a string (hashed as UTF-8; `node.d.ts` declares `string | Uint8Array`) and any other `ArrayBufferView`, such as a `DataView` or a `Uint16Array`. A plain swap would therefore change Graph's public behaviour. The adapter keeps it:
  - a string is hashed as its UTF-8 bytes;
  - an `ArrayBufferView` is hashed as the bytes it views;
  - anything else throws a `TypeError`, as today. The `ERR_INVALID_ARG_TYPE` code and message of Node's error are not promised and may become Foundation's.
- **graph/N11** [graph/I12]: Dependencies. `@kaihacksai/kaal-foundation` joins Graph's runtime dependencies beside `@kaihacksai/kaal-hosting` and `yaml`, as the Embedded rule allows. Foundation has no dependencies, so no cycle arises. Graph takes the version that C5 pins.
- **graph/N7 (amended, Owner-confirmed 3 Nov; wording per the CPO review)** [graph/I12]: `form.mjs`, `node.mjs` and their declarations import no other Graph file. It says nothing else: what they may import from outside is the package's declared dependencies, limited by the EEE rule, which stays the one policy. A byte copy works in Core (core/C32), which has Foundation and `yaml`.
- **graph/Q3** (answered, Owner, 3 Nov): Graph may use Foundation's `sha256`; N7 is amended as above, not retired, because its "no other Graph file beside them" half is not covered by the EEE rule. Core's byte copy carries the same specifier, and Core reviews as importer owner.
- **graph/Q4** (open): Release slot. Graph publishes after Hosting, and Foundation precedes Core, so Foundation is on the registry before Graph needs it. Confirm there is no earlier constraint.
