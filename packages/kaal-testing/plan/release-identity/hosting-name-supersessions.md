# Hosting package name in planned Cases: before and after

Hosting 0.0.1 is `@kaihacksai/kaal-hosting`. Under the Owner's ruling that a planned Case may change in its name or path clause only, each clause below changes and nothing else in these Cases does.

| Case | Before | After |
| --- | --- | --- |
| testing/T18 (`test/plan/consumer.test.mjs`) | `{ "kaal-hosting": "0.0.1" }` | `{ "@kaihacksai/kaal-hosting": "0.0.1" }` |
| testing/T13 (`test/plan/evidence.test.mjs`) | `["kaal-hosting"]` and `name !== "kaal-hosting"` | the same two clauses with `"@kaihacksai/kaal-hosting"` |

Host-fact identities such as `kaal-hosting/special-entries` are opaque ids, not package specifiers, and stay as they are.
