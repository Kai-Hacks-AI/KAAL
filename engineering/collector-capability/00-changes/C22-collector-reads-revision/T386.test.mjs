// Case engineering/T386 (engineering/C22): reading the base's Markdown does not start Git once per file.
import assert from "node:assert/strict";
import { join } from "node:path";
import { scratch } from "./helper.mjs";

export const id = "engineering/T386";
export const tests = ["engineering/C22"];
export const title = "the collector check starts Git the same number of times for 12 Markdown files as for 24, and never `git show`";
export async function run() {
  const counts = [];
  for (const files of [12, 24]) {
    const r = scratch();
    try {
      for (let i = 0; i < files; i++) r.write(`n${i}/N${i}.md`, `# N${i}\n`);
      r.commit();
      const trace = join(r.dir, "..", "git.trace");
      const out = r.check(["--base", "main", "kaal/core/x"], trace);
      assert.equal(out.status, 0, out.stderr);
      const commands = r.started(trace);
      assert.ok(commands.length > 0, "no Git process was traced: the trace cannot show anything");
      assert.ok(!commands.some((c) => /\bshow\b/.test(c)), `git show was started: ${commands.join(" | ")}`);
      counts.push(commands.length);
    } finally {
      r.cleanup();
    }
  }
  assert.equal(counts[0], counts[1], `the number of Git starts grew with the files: ${counts.join(" then ")}`);
}
