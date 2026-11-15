// Test-run observation only; imports no implementation of the subject.
import { run } from 'node:test';
export async function observe(files) {
  delete process.env.NODE_TEST_CONTEXT;
  const cases = [], failures = [];
  for await (const event of run({ files })) {
    if (!['test:pass', 'test:fail'].includes(event.type) || event.data.details?.type === 'suite') continue;
    const d = event.data, name = /^change\/T[0-9]+/.exec(d.name)?.[0] ?? d.name;
    const outcome = d.skip ? 'skip' : d.todo ? 'todo' : event.type === 'test:fail' ? 'fail' : 'pass';
    cases.push({ name, outcome });
    if (outcome === 'fail') failures.push(name + ': ' + String(d.details?.error?.cause?.message ?? d.details?.error?.message ?? 'failed').split('\n')[0]);
  }
  return { cases, failures };
}
