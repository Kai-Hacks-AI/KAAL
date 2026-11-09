# Foundation's ownership claim: Testing

## Publisher's planned cases

`test/plan/ownership.test.mjs` holds these planned cases. The DO moves the file unchanged to `test/publisher/` and runs it in `test:publisher`.

| Test | Checks | The fixture it must fail, naming the cause |
| --- | --- | --- |
| foundation/T35 | F20, F21: `capability/Foundation.md` is named `Foundation` and typed by KAAL Capability under Core's type reference. `ownership.kaal.json` is exactly `{ owner: { kind: "capability", name: "Foundation", id }, paths: ["packages/kaal-foundation/"] }`, where `id` is Foundation's own `sha256` of the Node's bytes | Today's package, which has no Node and no claim |
| foundation/T36 | N11, N12: neither file is in the packed file list or in `test/verify.json`. Every claim path lies under `packages/kaal-foundation/`, and none names `package.json` or `package-lock.json` at the root | A claim that adds the root files, or a `files` entry that ships `capability/` |

## RED evidence

Run against today's package:
- **Behavioural.** T35 fails because `capability/Foundation.md` does not exist.
- **Blocked.** T36's claim assertions cannot run without a claim. Its packing assertions pass today and must stay GREEN through the DO.
