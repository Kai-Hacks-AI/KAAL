// test:embedded, the Embedded verification (packaging/F9, packaging/F15). It runs the delivered cases
// in test/embed/ against the copy they ship in, and ends on one line in the shared verifier form
// (packaging/F10, testing/C29): `kaal-packaging-verification {json}` with the result, its exit, each
// execution by case name and outcome, and the causes. Results are Testing's (testing/F13): verified
// (0), failed (1) or cannot verify (2). Zero cases run is never verified.
//
// A case's name is the identifier its title begins with, such as `packaging/T15`. Which cases are
// declared is the shipped manifest's (test/verify.json `cases`, packaging/F11). The run starts
// through Hosting's `execute` (packaging/N11).
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NAME = "kaal-packaging";
const EXIT = { verified: 0, failed: 1, "cannot verify": 2 };

function finish(result, cases, causes) {
  console.log(`${NAME}-verification ${JSON.stringify({ result, exit: EXIT[result], cases, causes })}`);
  process.exit(EXIT[result]);
}

let declared;
try {
  declared = JSON.parse(readFileSync(join(ROOT, "test", "verify.json"), "utf8")).cases;
} catch (e) {
  finish("cannot verify", [], [`the shipped manifest test/verify.json cannot be read: ${e.message}`]);
}
if (!Array.isArray(declared) || declared.length === 0) finish("cannot verify", [], ["the shipped manifest declares no case"]);

const dir = join(ROOT, "test", "embed");
let files = [];
try {
  files = readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).sort().map((f) => join(dir, f));
} catch {
  // No test/embed/: nothing to run, reported below.
}
if (files.length === 0) finish("cannot verify", [], ["no Embedded case ships in test/embed/"]);

// Clear NODE_TEST_CONTEXT, or a run inside node --test reports to the outer runner and counts nothing.
// Pin the TAP reporter, whose `ok` and `not ok` lines name each test.
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
const r = await execute(process.execPath, ["--test", "--test-reporter=tap", ...files], { cwd: ROOT, env });

const cases = [];
for (const m of r.stdout.matchAll(/^\s*(not ok|ok) \d+ - (\S+)(.*)$/gm)) {
  const [, status, first, rest] = m;
  const id = /^(packaging\/T\d+)\b/.exec(first)?.[1];
  if (!id) continue;
  const directive = /#\s*(SKIP|TODO)\b/i.exec(rest)?.[1]?.toLowerCase();
  cases.push({ name: id, outcome: directive ? (directive === "todo" ? "todo" : "not run") : status === "ok" ? "pass" : "fail" });
}

const failed = cases.filter((c) => c.outcome === "fail").map((c) => c.name);
const ran = new Set(cases.filter((c) => c.outcome === "pass" || c.outcome === "fail").map((c) => c.name));
const missing = declared.filter((id) => !ran.has(id));
if (failed.length || r.status !== 0) {
  process.stdout.write(r.stdout);
  process.stderr.write(r.stderr);
  const causes = failed.length ? [`cases failed: ${failed.join(", ")}`] : [`node --test exited ${r.status} with no case failed`];
  finish("failed", cases, causes);
}
if (ran.size === 0) finish("cannot verify", cases, ["no declared case ran"]);
if (missing.length) finish("cannot verify", cases, [`declared cases did not run: ${missing.join(", ")}`]);
console.log(`${cases.length} passed`);
finish("verified", cases, []);
