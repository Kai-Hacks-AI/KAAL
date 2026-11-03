# Core/C52 PLAN amendment: bounded change to core/T40

Proposal under the CPO-approved C52 PLAN (`README.md` here). Independent PLAN review is required before the hunk becomes
a live test. The patch is review material only: this Change does not apply it, edit a live test, or change runtime or
package bytes.

## Why

C52, approved for Core 0.0.1, ships `capability/Core.md` and `capability/Registration.md` in the package as an
unregistered contribution, so an installed Core can register itself with `kaal register capability core <dir>`. The
existing immutable core/T40 (core/C16, F40/A18) asserts that `capability` and `ownership.kaal.json` are "repository data,
not delivered", so it fails exactly on this. Found while building the DO: with `capability` in the package `files`, T40 is
the only existing test that fails (the whole Core suite otherwise passes, including the Hosting boundary test).

## Change

| Part of T40 | Amendment | Preserved |
|---|---|---|
| Core is a Capability Node typed by KAAL Capability, named Core | unchanged | the identity and type assertions |
| `ownership.kaal.json` claim, owner and paths | unchanged | exact deep equality |
| `ownership.kaal.json` is not delivered | unchanged | the claim stays repository data |
| `capability` is not delivered | **replaced**: `capability` is in the package `files` | the Node is still Core's own, authored once |
| (new) no automatic registration | the Installation Contract has no asset whose source is under `capability/` or whose target is under `.kaal/capabilities/` | `kaal init` cannot register or copy it; registration stays explicit (C52 T119) |

Only the `capability` half of the delivery assertion and the title change; no assertion is weakened, and one is added so
the Owner's rule (init never registers) is held at the contract as well as in behavior.

## Not changed

`kaal init`, the Installation Contract, `ownership.kaal.json`'s delivery, and every other test. No promotion or
publication.

`t40-amendment.patch` is the complete proposed hunk against `test/plan/love.test.mjs`.
