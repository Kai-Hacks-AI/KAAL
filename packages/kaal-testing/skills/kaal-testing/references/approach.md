# From a target to evidenced testing

Use this with the Testing Skill. Meaning comes from the installed Testing Capability and Skill Nodes. The consumer owns its contracts, Plan, Cases, fixtures, expectations, execution and retained evidence. Testing supplies the existing method and interpretation.

## Find the installed authority

When working in a KAAL Engine, start at its `AGENTS.md` and resolve its registered Testing Nodes. When no Engine is present, resolve the package you actually installed from the consumer directory:

```sh
node --input-type=module -e "console.log(import.meta.resolve('@kaihacksai/kaal-testing/package.json'))"
```

The directory containing that resolved metadata holds `capability/Testing.md` and `payload/Testing.md`, together with the product's `docs/` and this Agent Skill. Read those shipped Nodes for meaning. Package discovery does not register them into an Engine or prove admission. Use Core's registration procedure when that is required.

The portable Agent Skill keeps its relative links inside its own directory. Product metadata and Nodes are found through the installed package, rather than an assumed repository path.

## Start the consumer's ordinary Test Plan

1. Name the target and its authority. Identify what the consumer owns and what it consumes through another capability's public contract. Preserve those ownership boundaries.
2. Place each Case in an existing loop: architecture conformance, acceptance of the delivered capability, or implementation. Keep each loop's evidence separately attributable. A Case traces to its actual target through `tests`; a filename does not define its loop.
3. State the expected behavior and conditions from that authority. Apply BRITTLE: demand only what the target fixes; discriminate against actual violations and accept authorized variation. Include permitted/prohibited/undecidable cases where the architecture check requires them.
4. Establish planned Cases before DO. Demonstrate RED for the intended missing behavior, rather than an import/fixture failure. Make them GREEN, then REFACTOR with the accepted boundary preserved. A defect in a planned Case returns to ACT rather than being repaired inside DO/CHECK.
5. Execute through the consumer's chosen realization. Identify the subject, Case versions, Test Data, conditions and actual outcomes. Preserve failure, incomplete evidence and applicability as established by the harness; never turn a skipped or unrun Case into a pass.
6. Check the model and interpret the Run. `results` gives raw observations; `evaluate` gives the Plan verdict. Report every finding, allowance and limitation. When interpreting retained history, `current` uses the latest applicable Run rather than selecting an older GREEN. The consumer retains that history.

### Package boundaries use the same Plan

For an incoming boundary, name the public input or operation and the contract the package promises. For an outgoing boundary, name the public dependency contract it consumes. Their owner chooses concrete Cases, fixtures and expectations. Exercise successful behavior and the failures or refusals the contract specifies, including unchanged state where promised. Check an outgoing integration at the public interface without repeating the dependency owner's exhaustive cases.

These are ordinary Cases and Suites in the consumer's Plan. No separate boundary-testing kind, manifest, runner or content store is required. The existing `/boundary` export has a different purpose: interpreting an attested verdict about the integrity of planned test paths. It does not execute a package's incoming/outgoing boundary tests.

## Executable model example

Save the following block as `evaluate-example.mjs` in a temporary directory from which the installed package resolves. Pass its actual package name explicitly:

```sh
node evaluate-example.mjs @kaihacksai/kaal-testing
```

This example constructs illustrative Run data; it executes no consumer Case and is not evidence that a real target passed. Its assertions check the public model API's treatment of that data.

```js
import assert from 'node:assert/strict';

const packageName = process.argv[2];
if (!packageName) throw new Error('Pass the actual installed Testing package name');
const { check, tested, results, evaluate } = await import(`${packageName}/model`);
const model = {
  plans: [{ id: 'example-plan', version: '1', suites: ['example-suite'] }],
  suites: [{ id: 'example-suite', version: '1', cases: ['example-case'] }],
  cases: [{ id: 'example-case', version: '1', tests: ['example/F1'] }],
};
assert.deepEqual(check(model), []);
assert.deepEqual(tested(model), { 'example/F1': ['example-case'] });

const illustrative = (id, outcomes) => ({
  id,
  of: 'example-plan',
  provenance: { 'example-plan': '1', 'example-suite': '1', 'example-case': '1' },
  outcomes,
});
const examples = [
  illustrative('example-pass', { 'example-case': 'passed' }),
  illustrative('example-failure', { 'example-case': 'failed' }),
  illustrative('example-incomplete', {}),
];
assert.equal(results(model, examples[0]).cases['example-case'], 'passed');
const verdicts = examples.map((run) => evaluate(model, run));
assert.deepEqual(verdicts.map((v) => v.result), ['passed', 'failed', 'unknown']);
for (const verdict of verdicts) assert.deepEqual(verdict.findings, []);
console.log(JSON.stringify({
  kind: 'illustrative evaluation; no consumer Case executed',
  results: verdicts.map(({ run, result }) => ({ run, result })),
}));
```

In actual work, substitute the consumer's own definitions and its genuine execution evidence. Declaring a trace does not prove the target: a Case's behavior and the relevance of its assertions still need review. A structurally valid, constructed Run is not authenticated observation or provenance.

## Read the result at the right level

- A raw Case outcome, the model's Plan result (`passed`, `failed`, `unknown`) and the installed verifier's result (`verified`, `failed`, `unknown`, exits 0/1/2) are different contracts. Never translate an unknown into GREEN.
- A skipped/todo/unexecuted Case supplies no passing assurance. Applicability needs the existing harness-established evidence; a consumer's assertion alone establishes nothing.
- An attested unchanged planned boundary establishes unchanged paths within its declaration, not behavioral correctness or reproducibility.
- Report verified failures, potential defects, architectural concerns and unknowns separately, following `findings.md`. Use `brittle.md` for lessons that improve the next Case while preserving its target and recording escaped subject defects separately.
- To verify Testing itself, run the installed package's `npm test` through `npm explore`. Its declared consumer Cases test Testing's delivered behavior, not the consumer's Plan. A passing verifier proves only that Run within its coverage.
