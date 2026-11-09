// TEMPORARY collector (foundation/C20, Kai B): finds the Test Cases that sit beside their Nodes, so that
// Foundation can run them until the Testing mechanism (testing/C-trace, PLAN #1216) replaces it. Delete
// this one file when that mechanism arrives. The rule is Testing's: every `*.test.mjs` under the declared
// loop folders, sorted by path. Nothing sits in 04-test.
import { readdirSync } from "node:fs";
import { join } from "node:path";

/** The loop folders of a source checkout, and of the installed dist/ that copies them. */
export const SOURCE_LOOPS = ["01-intent", "02-requirements", "03-architecture", "05-src", "06-defects"];
export const DIST_LOOPS = ["docs", "skills"];

/** Every `*.test.mjs` under `loops` of `root`, as sorted POSIX paths relative to `root`. */
export function collect(root, loops) {
  const out = [];
  const walk = (rel) => {
    let entries;
    try {
      entries = readdirSync(join(root, rel), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const next = `${rel}/${e.name}`;
      if (e.isDirectory()) walk(next);
      else if (e.name.endsWith(".test.mjs")) out.push(next);
    }
  };
  for (const loop of loops) walk(loop);
  return out.sort();
}
