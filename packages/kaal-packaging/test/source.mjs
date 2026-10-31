// `npm run test:publisher` (packaging/F14, F15): the publisher's suites, in test/publisher/, which
// hold the planned tests and do not ship. In the source workspace it runs them and ends on one
// result line. Installed, they are absent, so it runs nothing, says so, and reports no result: the
// installed `npm test` then ends on the Embedded verification's line alone (packaging/F9).
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const dir = fileURLToPath(new URL("./publisher/", import.meta.url));
let files = [];
try {
  files = readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).sort().map((f) => `test/publisher/${f}`);
} catch {
  files = [];
}
if (files.length === 0) {
  console.log("test:publisher: the publisher's suites do not ship with the package, so there is nothing to run here");
} else {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const r = await execute(process.execPath, ["--test", ...files], { cwd: root, env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  process.stdout.write(r.stdout);
  process.stderr.write(r.stderr);
  const result = r.status === 0 ? "verified" : "failed";
  console.log(`kaal-packaging-publisher ${JSON.stringify({ result, exit: r.status === 0 ? 0 : 1, causes: r.status === 0 ? [] : [`node --test exited ${r.status}`] })}`);
  process.exitCode = r.status === 0 ? 0 : 1;
}
