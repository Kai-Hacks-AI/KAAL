# What a Change Changes, and Its Selected Scope: Testing

The planned outer tests live in `packages/skills/kaal-change/test/plan/scope.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO Change turns them GREEN and adds them to `kaal-change`'s `npm test`.

| Test | Checks | Loop |
| --- | --- | --- |
| change/T36: a Change states what it changes and its selected scope; the views and the exchange give both sorted, and nothing when not stated | change/I16, change/I17, change/F33, change/F34, change/F36 | Intent |
| change/T37: a malformed `alters`, whether empty, not a list, a path, a URL, a pull request or a repeat, is a finding, and the statement is withheld whole | change/F33, change/F35 | Requirements |
| change/T38: a scope entry that is a path, a pull request, a Change identity or a repeat, or an empty scope, is a finding, and the scope is withheld whole, never narrowed | change/I17, change/F34, change/F35 | Requirements |
| change/T39: Change neither resolves an element nor judges a scope; nothing in the result claims isolation or admission, and delivery is unchanged | change/F33, change/F34, change/F37, change/N8 | Architecture |
| change/T40: the exchange with `alters` and `scope` is byte-identical in any order, and its findings are sorted | change/F36 | Requirements |

change/A17 is validated by review at the DO Change, including that `assess` imports nothing new.

## RED evidence

At `change/C9`, all five tests are RED, and each is **blocked before behavioural assertion**, because `kaal-change` exports no `./delivery` on `kaal/change` until `change/C8` (#662) merges. Once it has, they are discriminating behavioural REDs: `assess` gives no `alters` or `scope` view, and no `malformed-alters` or `malformed-scope` finding. They run with `node --test packages/skills/kaal-change/test/plan/scope.test.mjs`, outside `kaal-change`'s `npm test` until the DO Change.
