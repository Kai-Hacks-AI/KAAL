// Architecture boundary of Engineering's measurement drivers: they decide
// which workspaces and files are measured, and leave every host mechanic to
// Hosting and every measurement to Testing. This is Engineering's own
// declaration for those drivers and its own evidence, checked with Hosting's
// generic conformance inspection. Mechanical findings fail here; what cannot be
// decided mechanically is listed for Agent or human validation, never taken as
// a pass. Engineering's other scripts are outside this declaration.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { readFile } from "kaal-hosting";
import { EXCLUSIONS, inspect } from "kaal-hosting/conformance";

/** The drivers this declaration covers, by path under engineering/. */
const DRIVERS = ["coverage/measure.mjs"];

/** The host modules those drivers may import directly: path handling only. */
const BOUNDARY = { builtins: ["node:path"] };

/** The modules they may reach outside themselves: Hosting for the host, Testing for measurement. */
const OUTSIDE = ["kaal-hosting", "kaal-testing/coverage"];

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
  it("permitted: they import no undeclared host module, and reach outside only Hosting and Testing", async () => {
    const report = await inspect(await drivers(), BOUNDARY);
    assert.deepEqual(report.inspected, DRIVERS);
    assert.deepEqual(report.violations, []);
    assert.deepEqual([...new Set(report.outside.map((o) => o.specifier))].sort(), OUTSIDE);
    assert.deepEqual(judged(report.validation), VALIDATED.map(({ file, construct }) => ({ file, construct })));
    // A clean result is evidence within the inspection's coverage, not proof of compliance.
    assert.ok(report.exclusions.length > 0 && report.exclusions === EXCLUSIONS);
  });

  it("prohibited: writing a report with node:fs, as an earlier revision did, fails verification with its location", async () => {
    const files = await drivers();
    files["coverage/measure.mjs"] = Buffer.concat([Buffer.from('import { writeFileSync } from "node:fs";\n'), files["coverage/measure.mjs"]]);
    const report = await inspect(files, BOUNDARY);
    assert.deepEqual(
      report.violations.map(({ file, line, builtin }) => ({ file, line, builtin })),
      [{ file: "coverage/measure.mjs", line: 1, builtin: "node:fs" }],
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
