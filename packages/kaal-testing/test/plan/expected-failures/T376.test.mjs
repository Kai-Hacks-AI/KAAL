// Case testing/T376 tests: testing/F151. The command adds the expectations and refuses a bad register.
import { FULL, assert, fixture, runCommand, writeFileSync, join, readdirSync } from './lib.mjs';
export const id = 'testing/T376';
export const tests = ['testing/F151'];
export const title = 'run --expect embeds the expectations and leaves the report as it was, and an unreadable or invalid register exits 2 with no report';
export function run() {
  const dir = fixture();
  const plain = runCommand(dir);
  assert.equal(plain.status, 0, plain.stderr);
  writeFileSync(join(dir, 'register.json'), JSON.stringify(FULL));
  const withIt = runCommand(dir, ['--expect', join(dir, 'register.json')]);
  assert.equal(withIt.status, 0, `run --expect did not produce a report (exit ${withIt.status}): ${withIt.stderr}`);
  assert.ok(withIt.report.expectations, 'the report has no expectations');
  assert.equal(withIt.report.expectations.schema, 'kaal-testing/expectations@1');
  assert.deepEqual(withIt.report.expectations.held.map((e) => e.id), ['f.test.mjs > known bug']);
  const { expectations, ...rest } = withIt.report;
  assert.deepEqual(rest.counts, plain.report.counts, 'the observed counts changed');
  assert.deepEqual(rest.tests, plain.report.tests, 'the observed tests changed');
  assert.deepEqual(rest.execution.problems, plain.report.execution.problems, 'the execution problems changed');
  for (const [name, content] of [['bad-schema.json', '{"schema":"x","expected":[]}'], ['not-json.json', 'nope'], ['duplicate.json', '{"schema":"kaal-testing/expected-failures@1","expected":[{"id":"a"},{"id":"a"}]}']]) {
    writeFileSync(join(dir, name), content);
    const r = runCommand(dir, ['--expect', join(dir, name)]);
    assert.equal(r.status, 2, `${name} did not exit 2 (exit ${r.status})`);
    assert.equal(r.stdout.trim(), '', `${name} printed a report`);
  }
  const missing = runCommand(dir, ['--expect', join(dir, 'missing.json')]);
  assert.equal(missing.status, 2, 'a missing register did not exit 2');
  assert.deepEqual(readdirSync(dir).sort(), ['bad-schema.json', 'duplicate.json', 'f.test.mjs', 'g.test.mjs', 'not-json.json', 'register.json'], 'running left files in the project');
}
