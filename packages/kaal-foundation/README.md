# kaal-foundation

KAAL Foundation: the shared, pure and deterministic primitives any KAAL Capability can build on without a dependency cycle. Foundation is a sibling of Hosting and depends on nothing.

Foundation is also a deliberate collector for shared concerns whose eventual specialized home is not yet known. That ownership is explicit and provisional. Each concern below is reviewed here, and it moves by a reviewed Change once its specialized home is known.

| Concern | Subpath | Ownership |
| --- | --- | --- |
| SHA-256 (`foundation/C1`, `foundation/C2`) | `@kaihacksai/kaal-foundation/sha256` | Provisional. Foundation owns it until a specialized home is reviewed. |

```js
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

sha256(new TextEncoder().encode("abc")); // "ba7816bf…15ad"
```

`sha256(bytes)` takes a `Uint8Array` (a `Buffer` is one) and returns its FIPS 180-4 SHA-256 as 64 lowercase hexadecimal digits. It refuses anything else with a `TypeError`, so a caller that has text encodes it as UTF-8 first. The module imports nothing and touches no host global.

## Command and skill

```sh
npm install @kaihacksai/kaal-foundation
node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs sha256 <file>…   # "<digest>  <file>"; no file or - reads standard input
node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs verify           # verify this installed copy
```

Run the scoped package's own bin by its path, as above. Never run `npx kaal-foundation` or `npm exec … kaal-foundation`: `kaal-foundation` is only the bin's name, so they run whichever installed package owns `node_modules/.bin/kaal-foundation`, and where this package is not installed npx may fetch an unrelated unscoped package.

An agent's guide ships as [the skill](skills/kaal-foundation/SKILL.md): when to use Foundation's SHA-256, how to hash text, how to read a verification, and where a new shared concern belongs.

## Install, verify, read

```sh
npm install @kaihacksai/kaal-foundation
npm explore @kaihacksai/kaal-foundation -- npm test
```

`npm test` in the installed package checks the installed files against the shipped manifest (`test/verify.json`) and runs the shipped cases. It ends in `verified`, `failed` or `cannot verify`, on the line `kaal-foundation-verification {json}`.

- [Intent](docs/intent.md): why Foundation exists.
- [Requirements](docs/requirements.md): what `sha256` guarantees.
- [Architecture](docs/architecture.md): the package's layout and position.
- [Limitations](docs/limitations.md): what it does not do.
- [Operations](docs/operations.md): installing, using, verifying and removing it.
- [Testing](docs/testing.md): the tests that ship and what they check.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
