// Architecture boundary of Engineering's measurement and delivery drivers:
// they decide which workspaces and files are measured or packed, and leave
// every host mechanic to Hosting, every measurement and acceptance run to
// Testing, which Nodes are admitted to Core, and lookup among the admitted
// Nodes to Graph. This is Engineering's own declaration for those drivers and
// its own evidence, checked with Hosting's generic conformance inspection.
// Mechanical findings fail here; what cannot be decided mechanically is listed
// for Agent or human validation, never taken as a pass. Engineering's other
// scripts are outside this declaration.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { readFile } from "kaal-hosting";
import { EXCLUSIONS, inspect } from "kaal-hosting/conformance";

/** The drivers this declaration covers, by path under engineering/. */
const DRIVERS = ["contracts/measure.mjs", "coverage/measure.mjs", "delivery/pack.mjs", "inventory/attribute.mjs", "inventory/measure.mjs", "lanes/evidence.mjs", "report/captures.mjs", "report/measure.mjs"];

/** The host modules those drivers may import directly: path handling only. */
const BOUNDARY = { builtins: ["node:path"] };

/** The modules they may reach outside themselves: Hosting for the host, Testing for measurement and acceptance runs, Core for admission, Graph for lookup. */
const OUTSIDE = ["kaal-core", "kaal-graph", "kaal-hosting", "kaal-testing/acceptance", "kaal-testing/attribution", "kaal-testing/contracts", "kaal-testing/coverage", "kaal-testing/inventory", "kaal-testing/report"];

/**
 * Findings that need validation and have been judged, each with its judgment.
 * A new one fails this suite until an Agent or a person has judged it and
 * recorded it here; a judged one that disappears fails too.
 */
const VALIDATED = [];

const ENGINEERING = fileURLToPath(new URL("./", import.meta.url));

async function drivers() {
  const files = {};
  for (const p of DRIVERS) files[p] = await readFile(ENGINEERING + p);
  return files;
}

const judged = (v) => v.map(({ file, construct }) => ({ file, construct }));

describe("Engineering's measurement drivers: Hosting boundary", () => {
  it("permitted: they import no undeclared host module, and reach outside only Hosting, Testing, Core and Graph", async () => {
    const report = await inspect(await drivers(), BOUNDARY);
    assert.deepEqual(report.inspected, DRIVERS);
    assert.deepEqual(report.violations, []);
    assert.deepEqual([...new Set(report.outside.map((o) => o.specifier))].sort(), OUTSIDE);
    assert.deepEqual(judged(report.validation), VALIDATED.map(({ file, construct }) => ({ file, construct })));
    // A clean result is evidence within the inspection's coverage, not proof of compliance.
    assert.ok(report.exclusions.length > 0 && report.exclusions === EXCLUSIONS);
  });

  it("prohibited: writing a report with node:fs, as earlier revisions of both drivers did, fails verification with its location", async () => {
    const files = await drivers();
    for (const p of DRIVERS) files[p] = Buffer.concat([Buffer.from('import { mkdirSync, writeFileSync } from "node:fs";\n'), files[p]]);
    const report = await inspect(files, BOUNDARY);
    assert.deepEqual(
      report.violations.map(({ file, line, builtin }) => ({ file, line, builtin })),
      DRIVERS.map((file) => ({ file, line: 1, builtin: "node:fs" })),
    );
  });

  it("undecidable: host access the inspection cannot decide is reported for validation, never as a pass or a violation", async () => {
    const files = await drivers();
    files["coverage/measure.mjs"] = Buffer.concat([files["coverage/measure.mjs"], Buffer.from('\nprocess.getBuiltinModule("fs").rmSync("engineering/out", { recursive: true });\n')]);
    const report = await inspect(files, BOUNDARY);
    assert.deepEqual(report.violations, []);
    assert.deepEqual(judged(report.validation), [{ file: "coverage/measure.mjs", construct: "process.getBuiltinModule" }]);
  });
});
