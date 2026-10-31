# Acceptance Discovery of Shipped Cases: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A24** [testing/F76, testing/F77, testing/N16]: `lib/acceptance.mjs` gains one private check, `ships(location)`. It reads `<location>/package.json` through Hosting's `readFile` and parses it. It answers true only for a `files` array with a string entry matching `^(\./)?test(/acceptance)?(/|/\*\*)?$`. Any read or parse failure answers false. `discover` skips a workspace for which `ships` is true. Nothing else in the module changes.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | which workspaces' `test/acceptance/` are lane scenarios |
| Each product | what it ships, through its own `files`, and its own `npm test` |
| Engineering | the acceptance lane that calls `discover`, unchanged, and the consumer lane that runs each product's shipped cases |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C43` PLAN, this Change | Testing | none |
| `testing/C44` DO: `ships` in `lib/acceptance.mjs`, the README, testing/T88–testing/T90 GREEN and in the suite | Testing | `testing/C43` |
| hosting/C12 DO (#700) leaves draft | Hosting | `testing/C44` |
