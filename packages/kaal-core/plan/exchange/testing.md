# Exchange: Testing

The planned outer tests live in `packages/kaal-core/test/plan/exchange.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN, adds them to Core's `npm test`, and may add Code tests of its own. It also updates the pinned ids in `core.test.ts`, `love.test.mjs` and `verify.json`, visibly, as the table there asks.

No test reads the wording of a Definition. Each checks the stated criterion: what Core carries, registers, lists and refuses.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T98: the payload carries a `KAAL Exchange` Definition typed by `KAAL Definition`, and no `KAAL Extension` | core/F89, core/A45 | Requirements |
| core/T99: an Exchange contribution registers and is listed as exchanges; `extension` is not a kind; an Exchange and a Skill do not mix in one contribution | core/F90, core/A46 | Requirements |
| core/T100: the kinds Core registers are exactly the four CASE Definitions, each typed by `KAAL Definition` | core/F91, core/A45 | Requirements |
| core/T101: an Exchange registers whatever its body says, and registering it again is a no-op | core/N24, core/A47 | Architecture |
| core/T102: an Engine without the `KAAL Exchange` Definition does not verify | core/F91, core/A45 | Requirements |

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/exchange.test.mjs`, outside Core's `npm test` until the DO. At `core/C51` all five are RED, blocked before behavioural assertion, because Core carries `KAAL Extension` and registers `extension`.
