# Cross-Platform Inventory Parity: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/parity.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C32` turns them GREEN and adds them to Testing's `npm test`. The verifier in them is a made-up one. Each platform's facts are given as plain data, and a Windows-only case is not applicable on Linux and macOS.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T70: parity needs exactly one run per supported platform of one candidate, each with the same declared cases; anything else is unknown, with a finding | testing/F56 | Requirements |
| testing/T71: every declared case stays visible on every platform: one left out, reported twice, or replaced by a stand-in is a finding, and it is not run there | testing/F57 | Requirements |
| testing/T72: a case is not applicable on a platform only with that platform's established applicability, is never counted as passed, and a case not applicable on every platform is exercised on none | testing/F57 | Requirements |
| testing/T73: together the runs are failed when any platform's is, verified only when every platform's is and nothing is found, and unknown otherwise; an unresolved weakening finding never verifies | testing/F58 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/parity.test.mjs`, outside Testing's `npm test` until `testing/C32`. At `testing/C31`, all four are RED, each **blocked before behavioural assertion**, because `kaal-testing/verifiers` exports no `parity`.

**Checked against a throwaway implementation.** A20 was implemented on top of `testing/C30`'s module, outside the repository. All four pass against it, and so do testing/T54–testing/T62 and `test/verifiers.test.mjs`, unchanged. Each of 26 mutants of the addition fails at least one test. The mutants cover:
- **The runs:**
  - a repeated supported platform accepted, or no supported platforms accepted;
  - malformed weakening ignored;
  - a missing supported platform, or a platform with two runs, accepted;
  - a run on an unsupported platform accepted;
  - differing declared cases, version or digest accepted;
  - no declared case accepted.
- **Visibility:**
  - a case reported twice accepted;
  - an omission or a duplicate not found, or not made `not run`;
  - an unestablished `not applicable` accepted, only checked for presence, not found, or kept as `not applicable`;
  - `not applicable` counted as `pass`;
  - an undeclared reported case accepted;
  - a case not applicable everywhere accepted;
  - weakening ignored.
- **The result:**
  - failed never given;
  - findings not making the runs unknown;
  - any one verified run taken for all;
  - case outcomes not required to pass.

Four mutants were removed as equivalent:
- an empty list of runs accepted, since every supported platform then lacks its run;
- a missing observation not found, since the result then needs every run's result;
- the count of results not compared, since a missing observation is a finding;
- verified checked before failed, since a failed run is never verified.

testing/N11 is checked by review of `testing/C32`: the module still imports nothing.
