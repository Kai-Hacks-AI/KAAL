# hosting/C112 DO record

## Delivered
`list(dir, options?)` takes `skip` and `links`, with `ListOptions` exported, in `05-src/skills/kaal-hosting/scripts/index.ts`: the options are validated once (`leaving`, a `TypeError` before anything is read) and passed into the shared `walk`, which skips a name before it reads or follows anything and, with `links: "skip"`, passes over a link to a directory. `read` passes none, so it is unchanged. Intent I20, Requirements F90–F92, Architecture A40, the operation guide row, and the allocation in `04-test/package-check/testing.md`.

## Test Case ids
The drafts T297–T302 became `04-test/package-check/list-options.test.mjs`, unchanged in substance. The link targets are made absolute (a Windows junction resolves them from anywhere), and the titles carry no bracketed ids, as the allocation in `testing.md` requires. Ids T297–T302 are free on main and every remote branch (checked 21 November 2026).

## Evidence
- `list-options.test.mjs`: 6 of 6 pass, the five RED Cases now GREEN, T297 still GREEN.
- `npm run test:publisher`: the same 5 failures as on the unmodified collector (hosting/T71, T79, `Hosting release interoperability`, `verification cannot discard runner failures` and a parent: sandbox dependency set, see hosting/C111); the existing listing Cases (C106) and the allocation and manifest checks pass.
- Linux only; not run on Windows or macOS.

## Not done
Testing's catalog (its C74). No npm publish, no pin moves, `.kaal/hosting` untouched.
