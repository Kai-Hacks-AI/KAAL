# Coverage Script: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/coverage.test.mjs`. Each title names the contract it checks. They are immutable to DO and CHECK. The DO of `testing/C23` turns them GREEN and adds them to Testing's `npm test`.

Each test builds a fixture npm workspace in a fresh temporary directory. Its `test` script fails and executes nothing, and its `test:publisher` script exercises the delivered file and passes, so the result shows which script ran.

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T42: cover runs the script the caller names, and `test` when it names none | testing/F34 | Requirements |
| testing/T43: a named script the workspace does not declare is a failed measurement, never a passing run | testing/F34 | Requirements |
| testing/T44: a script option that is not a script name is refused before anything runs | testing/F34 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/coverage.test.mjs`, outside Testing's `npm test` until the DO. At `testing/C23`, all three are RED as **discriminating behavioural** REDs, not blocked ones. Today's `cover` ignores `script`, so:
- T42 runs the failing `test` and reports `fail`;
- T43 runs `test` and passes;
- T44 runs instead of refusing.

They were checked against an uncommitted throwaway implementation: all three pass, and Testing's existing coverage tests stay GREEN. Five mutants of it each turn at least one planned test RED:
- `script` ignored (T42, T43);
- a named script run `--if-present` (T43);
- no validation of the name (T44);
- a missing script not reported as failed (T43);
- `test:publisher` run when no script is named (T42).
