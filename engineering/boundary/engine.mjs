#!/usr/bin/env node
// The Boundary Engine's low-level command, for direct diagnostics (engineering/boundary/PLAN.md R1, R3). It prints evidence only.
//   node engine.mjs --tests <definition>... --target <path>... [--base <dir>]
// Targets are input; no definition names one. The last line of standard output is `kaal-boundary-scan {json}`.
// Exit 0 when the evidence is complete (findings are not failures), 2 when it is unknown or the call is wrong; never 1.
import { loadDefinition } from "./definition.mjs";
import { scan } from "./scan.mjs";

const LINE = "kaal-boundary-scan";
const args = process.argv.slice(2);
const values = (flag) => args.flatMap((a, i) => (a === flag ? [args[i + 1]] : []));
const tests = values("--tests");
const targets = values("--target");
const baseArg = values("--base")[0];
const bad = (v) => v === undefined || v.startsWith("--");
const finish = (result, code) => {
  console.log(`${LINE} ${JSON.stringify(result)}`);
  process.exitCode = code;
};

if (!tests.length || !targets.length || tests.some(bad) || targets.some(bad) || (args.includes("--base") && bad(baseArg))) {
  console.error("usage: node engine.mjs --tests <definition>... --target <path>... [--base <dir>]");
  process.exitCode = 2;
} else {
  const definitions = [];
  const refused = [];
  for (const file of tests) {
    try {
      definitions.push(loadDefinition(file));
    } catch (error) {
      refused.push(error.message);
    }
  }
  if (refused.length) {
    console.error(refused.join("\n"));
    finish({ mode: "scan", result: "unknown", refused, coverage: { read: 0, unreadable: [], skipped: [] }, findings: [] }, 2);
  } else {
    const evidence = scan(definitions, targets, baseArg);
    const { coverage, findings } = evidence;
    console.log(
      `${LINE}: ${findings.length} finding(s) in ${coverage.read} source file(s) read; ${coverage.unreadable.length} unreadable, ${coverage.skipped.length} skipped. ` +
        (evidence.result === "complete" ? (findings.length ? "A finding is a place to look at, not a fault." : "None found within this coverage.") : "Unknown: not every target was read."),
    );
    finish(evidence, evidence.result === "complete" ? 0 : 2);
  }
}
