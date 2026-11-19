// Reporter for `runCases`: one JSON line for each finished test, written in the order Node reports them (children before their parent).
// Only what the runner needs is kept; the first line of an error message, cut to 200 characters, is the only free text.
export default async function* reporter(source) {
  for await (const event of source) {
    if (event.type !== 'test:pass' && event.type !== 'test:fail') continue;
    const d = event.data;
    const error = d.details?.error;
    yield `${JSON.stringify({
      type: event.type === 'test:pass' ? 'pass' : 'fail',
      name: d.name,
      nesting: d.nesting,
      line: d.line,
      column: d.column,
      testNumber: d.testNumber,
      kind: d.details?.type ?? null,
      skip: d.skip ?? false,
      todo: d.todo ?? false,
      failureType: error?.failureType ?? null,
      code: error?.cause?.code ?? error?.code ?? null,
      message: error ? String(error.message ?? '').split('\n')[0].slice(0, 200) : null,
    })}\n`;
  }
}
