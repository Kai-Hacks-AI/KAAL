# Ownership Claim: Architecture

Each element names, in brackets, the Requirements it realizes.

- **hosting/A22** [hosting/F56]: **Where the claim lives.** The claim sits at the root of Hosting's tree, beside `package.json`, as every other owner's does (`packages/kaal-core/`, `packages/skills/kaal-graph/`, `packages/skills/kaal-testing/`). Its scope is the directory holding it, so it can claim only Hosting's tree. It is read by Testing's attribution and Engineering's measurement, never by Hosting's runtime, and it is outside `files`.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C24` PLAN: hosting/I13, hosting/F56, hosting/A22; hosting/T70 | Hosting | engineering/C11's P3 (#716) |
| `hosting/C24` DO: `ownership.kaal.json`, and hosting/T70 in Hosting's lanes | Hosting | `hosting/C24` PLAN |
| engineering/C11 DO: Change Isolation by traced ownership | Engineering | P1–P3, Hosting's claim among them |
