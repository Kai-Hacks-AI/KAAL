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

The package is not published. Its name is provisional until its package and delivery contract is reviewed.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
