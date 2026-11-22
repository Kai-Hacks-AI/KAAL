# Known failures: Requirements

Each Requirement names, in brackets, the Intent it serves. All answer testing/I42.

## Functional

- **testing/F149** [testing/I42]: **Compare a run with a register.** `compareExpectations(report, register)` is exported from `kaal-testing/expectations`. It takes a run report (`kaal-testing/run-report@1`) and a register, and returns `{ schema: 'kaal-testing/expectations@1', register: { count }, held, notHolding, unconfirmed, absent, unexpected, counts }`. It is pure: it does not change its inputs, does no I/O and gives equal output for equal input. An invalid register makes it throw. The register is `{ schema: 'kaal-testing/expected-failures@1', expected: [{ id, reference? }] }` with unique ids; `reference` is an opaque string that is echoed and never read.
- **testing/F150** [testing/I42]: **Strict states.** For a registered id: observed RED is `held`; observed GREEN is `notHolding` (the entry no longer describes the test and its owner removes it); observed UNKNOWN is `unconfirmed`, never `held`; an id that is not in the report is `absent`, marked `provisional` with a reason when its file was not run or its execution had problems. A RED that no entry lists is `unexpected`. A held entry never changes the report's own counts.
- **testing/F151** [testing/I42]: **The command.** `kaal-testing run --expect <register.json> <files>` adds the result of F149 to the run report under `expectations` and leaves the rest of the report as it is. It exits 0 whenever a report was produced, as before. A register that cannot be read or is invalid makes it exit 2 without a report.

## Non-functional

- **testing/N33** [testing/I42]: **Abstract and without a verdict.** The new module, the command's text and the Skill and README text about expectations name no concrete owner or consumer of a register (no Defect, review, Guard, kaal-change, Change, hotfix, merge, release or person), only the register, its owner and the consumer. The output has no field that decides (`pass`, `fail`, `blocked`, `allowed`, `verdict`): Testing lists, the consumer judges.
