// The test reporter accept() gives the runner: one JSON line per test that
// ends, with the file it ran from, its nesting, its name and how it ended.
// accept() rebuilds each test's suite path from these lines. Testing reads
// them from the runner it started; nothing a scenario writes takes their place.

/** A `node:test` reporter: the source is the runner's event stream. */
export default async function* observe(source) {
  for await (const { type, data } of source) {
    if (type === "test:start") yield `${JSON.stringify({ start: true, file: data.file, nesting: data.nesting, name: data.name })}\n`;
    if (type !== "test:pass" && type !== "test:fail") continue;
    if (data.details?.type === "suite") continue;
    const outcome = data.skip !== undefined ? "skip" : data.todo !== undefined ? "todo" : type === "test:pass" ? "pass" : "fail";
    yield `${JSON.stringify({ file: data.file, nesting: data.nesting, name: data.name, outcome })}\n`;
  }
}
