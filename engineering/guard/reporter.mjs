// The test runner's report for a run record (guard/C129): one JSON line per finished test, never per
// suite, with its file, its path of names from the file down, and how it ended. `node --test
// --test-reporter=./engineering/guard/reporter.mjs` streams it; suites.mjs reads it, so what executed is
// taken from the runner itself, never from a workflow.
export default async function* report(source) {
  const open = new Map();
  for await (const { type, data } of source) {
    if (type === "test:start") {
      const stack = open.get(data.file) ?? [];
      stack.length = data.nesting;
      stack.push(data.name);
      open.set(data.file, stack);
      continue;
    }
    if (type !== "test:pass" && type !== "test:fail") continue;
    if (data.details?.type === "suite") continue;
    const path = [...(open.get(data.file) ?? []).slice(0, data.nesting), data.name];
    const ended = type === "test:fail" ? "fail" : data.skip !== undefined ? "skip" : data.todo !== undefined ? "todo" : "pass";
    const note = typeof data.skip === "string" ? data.skip : typeof data.todo === "string" ? data.todo : type === "test:fail" ? String(data.details?.error?.cause?.message ?? data.details?.error?.message ?? "").slice(0, 500) : "";
    yield `${JSON.stringify({ file: data.file, path, ended, note })}\n`;
  }
}
