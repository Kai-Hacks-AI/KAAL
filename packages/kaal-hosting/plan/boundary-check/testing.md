# Boundary Check Per Package: Testing

The planned outer tests will live in `packages/kaal-hosting/test/plan/boundary-check.test.mjs`, added in a RED Change and immutable to DO and CHECK afterwards. Each title names the contracts it checks.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T114: `--target` accepts a folder (recursive), a single file and several targets; a missing target makes the result `unknown` and exits 2; an empty list carries `coverage` (files read, files not readable with reason, rules applied), so exit 0 with no finding is not a pass; two targets holding the same relative file name (`src/index.ts` and `test/index.ts`) give distinct ids under the one base, an overlapping target reads a file once, and a target outside the base is refused; `--root` still gives the gating run with `mode: "gate"`, and `--target` gives `mode: "scan"`; both together are refused | hosting/F64 | Requirements |
| hosting/T115: with `--target` the line has `findings`, never `failures` or `result: failed`; it exits 0 with findings, exits 0 with an empty list, exits 2 when nothing was read, and never exits 1 | hosting/F65 | Requirements |
| hosting/T116: a line that hits `platform-query` and `platform-literal` is one finding listing both rules and its classes; the same line is never reported twice | hosting/F66 | Intent |
| hosting/T117: a use of an identifier bound to `process.platform` on later lines is a reference under the binding's finding, counted apart, and not a finding; the binding is found from its declaration, including a destructured one | hosting/F66 | Intent |
| hosting/T118: platform logic in a production file and in a test file of a non-Hosting target is a finding whatever its kind; an acknowledgement leaves it in the list | hosting/F67, hosting/F30 | Intent |
| hosting/T119: each finding has the stable id `kaal-hosting/<file>:<line>`, a question, no decision field, and the result has per-rule and per-kind counts; each finding has a `digest` equal to `digest` of its line text; inserting a line above moves the `id` and keeps the `digest`, editing the line changes the `digest`; a reference has no id of its own and no decision; two runs over the same input give identical lines | hosting/F66, hosting/F68, hosting/N9 | Requirements |
| hosting/T120: Hosting reads, stores and judges no decision; a decision file next to the target changes no output | hosting/F69 | Requirements |
| hosting/T121: `skills/kaal-hosting-boundary/` is absent from the repository and from the packed files; no operational file (the shipped files, skills, `bin`, README, references or tests other than this one) names it, while plans may name it as history; `skills/kaal-hosting` has a Boundary Check section that covers the command, reading the list, and that deciding is the owner's | hosting/F70 | Requirements |
| hosting/T122: Hosting declares a Package Check and a Boundary Check, the Boundary Check as a declared not-applicable status with its reason (not a Case outcome), in the shape of #667, in `docs/boundary-check.md`, with the Package Check pointing at `test/verify.json` | hosting/F71 | Intent |

hosting/A27–hosting/A31 are placements, validated by review. hosting/T116 to T118 use Hosting-owned fixtures, committed under `test/`, never another package's content. The scan of Core, Testing, Guard and Foundation (173 lines in 12 patterns) is an evidence run recorded by C102, not a Case.

## RED evidence

None yet: this Change adds no test files. The RED Change will add `boundary-check.test.mjs` and record the failing run.
