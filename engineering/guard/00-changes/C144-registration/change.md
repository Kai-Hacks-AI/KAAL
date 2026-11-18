# C144 change

**Headline principle: kaal-guard is opt-in.** Guard guards only folders that declare themselves; this Change makes a declaration mean what it says and nothing more.

## PLAN

1. Adds F49 (`requirements.md`), the gap G63 (`gap.md`) and the Cases T217 to T221.
2. The Cases are RED on the C143 collector (evidence in the last section). They run the Guard of the checkout in a scratch repository, as the C143 Cases do, through the helpers in `packages/kaal-guard/test/acceptance/discovery-support.mjs`.
3. The PLAN changes no behaviour and touches no hook, workflow or ruleset.

## Cases

| Case | Obligation | Judges |
| --- | --- | --- |
| guard/T217 | F49 | inside a declared folder a changed file that no check covers is a fail naming it and where to register, the selected checks still run, and files in folders with no declaration (`.github`, `.githooks`, an Engineering area, a package, the root) are neither judged nor refused |
| guard/T218 | F49, F43 | a nested declaration (a Change's) judges its own files against its own checks, never the enclosing package's |
| guard/T219 | F49, F45 | a repository with no `kaal-guard.json` behaves as before; an unknown selection runs everything and prints that registration was not judged |
| guard/T220 | F49, F43 | a path that no longer exists is not judged: a deleted file and a closed Change's folder are never failed |
| guard/T221 | F49 | no empty registrations: a `kaal-guard.json` with no check is a fail naming the file, for a changed file in its folder and for a full run |

## Routes and boundaries (CPO review, #1949)

- This PLAN goes into the collector `kaal/guard/registration`; its DO and ACT go to the same collector. SYNC brings main into the collector and PROMOTION brings the collector into main, each separately authorized. A WIRE targets `wire/*` and is the only way a Delivery asset changes. A HOTFIX is a different route. None is authorized here.
- Collectors deliver developed implementations with their declarations and Cases to main; they do not deploy. Guard's own package is a capability, and its Engineering development is not its deployed instance.
- **Not Guard's run, and separate controls:** that every capability, Engineering area and Change has a declaration, and that a PR changes Solution or Delivery, never both.

## Open for the CPO

- **Declared folders only (Owner, 15:21).** This replaces the earlier drafts that made Guard fail files with no declaration and carried a Delivery declaration. Guard names no Delivery location, so the first CPO question about how it learns them goes away.
- **Covered by coverage.** A package that narrows every check with `when` has files its checks do not cover; they fail. An explicit "this folder is mine" member would be a larger model, which the CPO asked not to add.
- **Verdict.** `fail` (exit 1), not `cannot judge` (exit 2), because the repository can fix it by registering.
- The always-run file `.kaal/kaal-guard.json` and the name `kaal-guard.json` stay built in from C143 and are not touched here.

## DO

Not authorized. On the CPO's approval: build F49 in `lib/discovery.mjs`, amend F44, rename the Cases to `.test.mjs` when green, regenerate `test/verify.json`, add the docs. No hook or workflow is rewired and Any required check is a separate WIRE decision.

## ACT

A 4L retrospective in `act.md`.

## RED evidence

Run from the repository root on the collector at 8335545 with Node 24:

`node --test engineering/guard/00-changes/C144-registration/*.red.mjs`

See the PR description for the output.
