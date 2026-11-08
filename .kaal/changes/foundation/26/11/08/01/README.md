# Foundation: the declaration acceptance scenario stops importing Hosting by name

Capability owner: Foundation. Provisional Change number (rejudge against the collector when integrated).

The planned scenario `test/plan/declaration-acceptance.test.mjs` (foundation/T51) imported `execute`, `kind` and
`readFile` from Hosting by its old package name. With `main` carrying Hosting 0.0.1 as `@kaihacksai/kaal-hosting`,
`hosting/T22` fails any file that still names the old package, so the SYNC of `main` into `kaal/foundation` cannot
pass its Hosting check. A SYNC may not carry its own fix, so this lands first.

The scenario now uses Node's own `child_process` and `fs/promises`, and runs npm through `npm_execpath`, as the
other Foundation tests do (foundation/N7: no platform is consulted and no shell is chosen). Its assertions are
unchanged. The Change works under both Hosting names, so it passes before and after the SYNC. No shipped file,
package version, manifest or Foundation 0.0.2 candidate byte (#838) changes, apart from this planned test, which
#838 moves to `test/acceptance/`.

No merge, SYNC, promotion or publication is authorized by this record.
