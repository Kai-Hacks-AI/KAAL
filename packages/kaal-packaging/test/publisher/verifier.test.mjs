// Packaging's installed-verifier cases (packaging/C14, docs/testing.md): the cases that run test/verify.mjs
// against small synthetic installed copies, and so need the source workspace and do not ship. Each
// copy holds the real verifier and a synthetic Embedded suite with its own manifest, so a case can
// change one thing at a time. A manifest is consistency, not provenance (testing/F14), so a fixture
// that changes a file and rewrites the manifest to match is judged by its Cases, not its bytes.
// Every process they start goes through Hosting's `execute` (packaging/N11).
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { execute } from "kaal-hosting";
import { ROOT } from "./manifest.mjs";

const SCRATCH = mkdtempSync(join(tmpdir(), "kaal-packaging-verifier-"));
after(() => rmSync(SCRATCH, { recursive: true, force: true }));
let made = 0;

const caseFile = (titles, extra = "") =>
  `import { it } from "node:test";\n${titles.map((t) => `it(${JSON.stringify(t)}, () => {});`).join("\n")}\n${extra}`;

/**
 * An installed-shaped copy: the real verifier, a synthetic suite `embed` (file name → source), and a
 * manifest listing exactly those files with their digests and declaring `cases`. `tamper` runs after
 * the manifest is written, so a change it makes is not in the manifest.
 */
function copy({ embed, cases, manifest = (m) => m, tamper = () => {} }) {
  const dir = join(SCRATCH, `copy-${++made}`);
  mkdirSync(join(dir, "test", "embed"), { recursive: true });
  cpSync(join(ROOT, "test", "verify.mjs"), join(dir, "test", "verify.mjs"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "fixture", version: "0.0.0", type: "module" }));
  for (const [name, source] of Object.entries(embed)) writeFileSync(join(dir, "test", "embed", name), source);
  // The verifier imports Hosting and Foundation; the copy borrows this workspace's installed modules.
  symlinkSync(join(ROOT, "..", "..", "node_modules"), join(dir, "node_modules"), "dir");
  const files = {};
  for (const path of ["package.json", "test/verify.mjs", ...Object.keys(embed).map((n) => `test/embed/${n}`)]) {
    files[path] = sha256(readFileSync(join(dir, ...path.split("/"))));
  }
  writeFileSync(join(dir, "test", "verify.json"), JSON.stringify(manifest({ files, cases })));
  tamper(dir);
  return dir;
}

async function verify(dir) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const r = await execute(process.execPath, [join(dir, "test", "verify.mjs")], { cwd: dir, env });
  const line = r.stdout.split(/\r?\n/).filter((l) => l.startsWith("kaal-packaging-verification ")).pop();
  assert.ok(line, `the run ends on one verification line: ${r.stdout}${r.stderr}`);
  const record = JSON.parse(line.slice("kaal-packaging-verification ".length));
  assert.equal(r.status, record.exit, "the process exit agrees with the record");
  return record;
}

const A = "packaging/T1 [packaging/F1]: a passes";
const B = "packaging/T2 [packaging/F2]: b passes";
const two = { "a.test.mjs": caseFile([A, B]) };
const declared = ["packaging/T1", "packaging/T2"];

describe("packaging/C14 installed verification, exact and unknown-preserving", () => {
  it("packaging/T53 [packaging/F11]: an intact copy verifies, and a changed, removed, added or escaping file, or a malformed manifest, cannot verify, with the file named and no case run", async () => {
    const control = await verify(copy({ embed: two, cases: declared }));
    assert.equal(control.result, "verified", JSON.stringify(control.causes));
    assert.equal(control.exit, 0);

    const changed = await verify(copy({ embed: two, cases: declared, tamper: (d) => writeFileSync(join(d, "test", "embed", "a.test.mjs"), caseFile([A, B], "// changed\n")) }));
    assert.equal(changed.result, "cannot verify");
    assert.equal(changed.exit, 2);
    assert.match(changed.causes.join(), /test\/embed\/a\.test\.mjs: changed/);
    assert.deepEqual(changed.cases, [], "no case ran on a changed copy");

    const removed = await verify(copy({ embed: two, cases: declared, tamper: (d) => rmSync(join(d, "test", "embed", "a.test.mjs")) }));
    assert.equal(removed.result, "cannot verify");
    assert.match(removed.causes.join(), /a\.test\.mjs: removed|no Embedded case ships/);

    const added = await verify(copy({ embed: two, cases: declared, tamper: (d) => writeFileSync(join(d, "extra.mjs"), "export {};\n") }));
    assert.equal(added.result, "cannot verify");
    assert.match(added.causes.join(), /extra\.mjs: added/);

    for (const bad of ["../escape.mjs", "/abs.mjs", "test//x.mjs", "a\\b.mjs"]) {
      const escaped = await verify(copy({ embed: two, cases: declared, manifest: (m) => ({ ...m, files: { ...m.files, [bad]: "0".repeat(64) } }) }));
      assert.equal(escaped.result, "cannot verify", bad);
      assert.match(escaped.causes.join(), /not a path inside the package/, bad);
    }

    const noFiles = await verify(copy({ embed: two, cases: declared, manifest: (m) => ({ ...m, files: {} }) }));
    assert.equal(noFiles.result, "cannot verify");
    assert.match(noFiles.causes.join(), /lists no files/);

    const garbled = copy({ embed: two, cases: declared, tamper: (d) => writeFileSync(join(d, "test", "verify.json"), "{ not json") });
    const unreadable = await verify(garbled);
    assert.equal(unreadable.result, "cannot verify");
  });

  it("packaging/T54 [packaging/F10, packaging/F11]: each declared case must run exactly once; a missing, duplicate, undeclared, skipped or todo case cannot verify, and a declared failure on an intact copy is failed, not unknown", async () => {
    const missing = await verify(copy({ embed: { "a.test.mjs": caseFile([A]) }, cases: declared }));
    assert.equal(missing.result, "cannot verify");
    assert.match(missing.causes.join(), /did not run: packaging\/T2/);

    const duplicate = await verify(copy({ embed: { "a.test.mjs": caseFile([A, B]), "b.test.mjs": caseFile([A]) }, cases: declared }));
    assert.equal(duplicate.result, "cannot verify", JSON.stringify(duplicate));
    assert.match(duplicate.causes.join(), /more than once: packaging\/T1/);

    const undeclared = await verify(copy({ embed: { "a.test.mjs": caseFile([A, B, "packaging/T3 [packaging/F3]: c passes"]) }, cases: declared }));
    assert.equal(undeclared.result, "cannot verify", JSON.stringify(undeclared));
    assert.match(undeclared.causes.join(), /does not declare: packaging\/T3/);

    const skipped = await verify(copy({ embed: { "a.test.mjs": `import { it } from "node:test";\nit(${JSON.stringify(A)}, () => {});\nit(${JSON.stringify(B)}, { skip: true }, () => {});\n` }, cases: declared }));
    assert.equal(skipped.result, "cannot verify", JSON.stringify(skipped));
    assert.match(skipped.causes.join(), /did not run: packaging\/T2|skipped or todo: packaging\/T2/);

    const todo = await verify(copy({ embed: { "a.test.mjs": `import { it } from "node:test";\nit(${JSON.stringify(A)}, () => {});\nit(${JSON.stringify(B)}, { todo: true }, () => {});\n` }, cases: declared }));
    assert.equal(todo.result, "cannot verify", JSON.stringify(todo));

    const duplicateDeclaration = await verify(copy({ embed: two, cases: [...declared, "packaging/T1"] }));
    assert.equal(duplicateDeclaration.result, "cannot verify");

    const failure = await verify(copy({ embed: { "a.test.mjs": `import { it } from "node:test";\nit(${JSON.stringify(A)}, () => {});\nit(${JSON.stringify(B)}, () => { throw new Error("no"); });\n` }, cases: declared }));
    assert.equal(failure.result, "failed", "a declared failure on an intact copy is failed, not unknown");
    assert.equal(failure.exit, 1);
    assert.match(failure.causes.join(), /cases failed: packaging\/T2/);
  });
});
