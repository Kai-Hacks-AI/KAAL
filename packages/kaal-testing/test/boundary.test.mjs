// Architecture boundary: Testing leaves every host mechanic to Hosting. This
// is Testing's own declaration and its own evidence, checked against the
// JavaScript Testing delivers with Hosting's generic conformance inspection.
// Mechanical findings fail here; what cannot be decided mechanically is listed
// for Agent or human validation, never taken as a pass.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { read } from "kaal-hosting";
import { EXCLUSIONS, inspect } from "kaal-hosting/conformance";

/**
 * The host modules Testing's delivered code may import directly: path and URL
 * handling, to name report files and the c8 it runs. Commands, reads and every
 * other host operation go through kaal-hosting.
 */
const BOUNDARY = { builtins: ["node:path", "node:url"] };

/**
 * Findings that need validation and have been judged, each with its judgment.
 * A new one fails this suite until an Agent or a person has judged it and
 * recorded it here; a judged one that disappears fails too, so the list stays
 * exact.
 */
const VALIDATED = [];

const LIB = fileURLToPath(new URL("../lib/", import.meta.url));

/** The JavaScript Testing delivers: lib/, as npm packs it. */
async function delivered() {
  return read(LIB);
}

const judged = (v) => v.map(({ file, construct }) => ({ file, construct }));

describe("Testing's Hosting boundary", () => {
  it("permitted: the delivered JavaScript imports no undeclared host module, and reaches the host otherwise only through kaal-hosting", async () => {
    const files = await delivered();
    assert.ok(Object.keys(files).length >= 1);
    const report = await inspect(files, BOUNDARY);
    assert.deepEqual(report.violations, []);
    assert.deepEqual([...new Set(report.outside.map((o) => o.specifier))], ["kaal-hosting"]);
    assert.deepEqual(judged(report.validation), VALIDATED.map(({ file, construct }) => ({ file, construct })));
    // A clean result is evidence within the inspection's coverage, not proof of compliance.
    assert.ok(report.exclusions.length > 0 && report.exclusions === EXCLUSIONS);
  });

  it("prohibited: removing a report directory with node:fs, as an earlier revision did, fails verification with its location", async () => {
    const files = await delivered();
    files["coverage.mjs"] = Buffer.concat([Buffer.from('import { rmSync } from "node:fs";\n'), files["coverage.mjs"]]);
    const report = await inspect(files, BOUNDARY);
    assert.deepEqual(
      report.violations.map(({ file, line, builtin }) => ({ file, line, builtin })),
      [{ file: "coverage.mjs", line: 1, builtin: "node:fs" }],
    );
  });

  it("undecidable: host access the inspection cannot decide is reported for validation, never as a pass or a violation", async () => {
    const files = await delivered();
    files["coverage.mjs"] = Buffer.concat([files["coverage.mjs"], Buffer.from('\nexport const clear = (dir) => process.getBuiltinModule("fs").rmSync(dir);\n')]);
    const report = await inspect(files, BOUNDARY);
    assert.deepEqual(report.violations, []);
    assert.deepEqual(judged(report.validation), [{ file: "coverage.mjs", construct: "process.getBuiltinModule" }]);
  });
});
