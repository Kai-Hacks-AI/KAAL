# Pin-behind in the acceptance evidence: Architecture

- **testing/A34** [testing/F117–testing/F121, testing/N25]: `findings` in `lib/acceptance.mjs` gains one classification step for a held entry that differs from the packed integrity. `at` (the key in npm's `packages` map) gives the depth (the number of `node_modules/` segments) and the consumer (the name before the last `node_modules/`); `entry.version` gives the held version; `manifest[name].version` gives the packed one. The comparison is of plain `x.y.z` only; anything else is not comparable and is a failure. Testing has no dependency on Foundation or Engineering and reads no policy.
- **The split.**

| Concern | Owner |
| --- | --- |
| The facts: held entry differs, nested or top-level, older or not, `pin-behind` finding with its members | Testing |
| Recording `version` in the manifest | Engineering (`engineering/delivery/pack.mjs`, one line) |
| What may be nested, floors (`foundation/F32`), what a `pin-behind` gates | Engineering and Foundation (the classifier, the lane) |

- **Not decided here.** Whether the CI summary shows `pin-behind` (`foundation/F31`) is the lane's.
