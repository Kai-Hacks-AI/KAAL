# Ownership Claim: Testing

The planned outer test lives in `packages/extensions/kaal-hosting/test/plan/ownership.test.mjs`. Its title names what it checks, and it is immutable to DO and CHECK. Run it with `node --test packages/extensions/kaal-hosting/test/plan/ownership.test.mjs`. The `hosting/C24` DO adds it to `test:publisher`, so it runs in the Linux, Windows and macOS Hosting lanes.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T70: Hosting's claim reads as exactly `owner` and `paths`; `owner` is exactly `{ kind: "extension", name, id }` with `name` and `id` those of `payload/Hosting.md` (its name, and the SHA-256 of its bytes), and that Node is typed `KAAL Extension`; `paths` is exactly Hosting's tree; the claim is not in `files` | hosting/I13, hosting/F56, hosting/A22 | Requirements |

**RED evidence.** At this PLAN, hosting/T70 is RED, blocked before behavioural assertion: `ownership.kaal.json` does not exist. It is not yet in `test:publisher`, so Hosting's `npm test` stays GREEN. Against a claim whose `id` is one byte off, whose `kind` is `capability`, or whose `paths` adds `packages/` or narrows to `packages/extensions/kaal-hosting/src/`, it is RED, as each assertion states.
