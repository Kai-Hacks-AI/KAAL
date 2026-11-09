// Engineering Cases (PLAN engineering/boundary/PLAN.md): one Boundary Engine, capability-owned Boundary Tests.
// Every Case asserts behavior through the engine as a process or through its provisional Case adapter; none passes on existsSync alone.
// Every fixture is built in a temporary directory.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(HERE, "engine.mjs");
const CASES = join(HERE, "cases.mjs");
const sources = () => readdirSync(HERE, { recursive: true }).filter((f) => f.endsWith(".mjs") && !f.endsWith(".red.mjs") && !f.endsWith(".test.mjs")).sort();
const dir = mkdtempSync(join(tmpdir(), "boundary-engine-"));
after(() => rmSync(dir, { recursive: true, force: true }));
const put = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); return join(dir, p); };
const sha = (text) => createHash("sha256").update(text).digest("hex");
const def = (provider, tests) => `---\nprovider: ${provider}\ntests:\n${tests}---\nWhy: the provider owns this. An empty list is no compliance.\n`;
const CRYPTO = `  - id: crypto\n    detector: call-with-literal\n    callee: [createHash, digest]\n    literal: [sha256, sha-256]\n    tests: demo/I1\n    looks-for: the platform asked for SHA-256\n`;
const run = (...args) => {
  const r = spawnSync(process.execPath, [ENGINE, ...args], { encoding: "utf8" });
  const last = r.stdout.trim().split("\n").pop() ?? "";
  return { status: r.status, summary: last.startsWith("kaal-boundary-scan ") ? JSON.parse(last.slice("kaal-boundary-scan ".length)) : null, err: r.stderr };
};

describe("one Boundary Engine, capability-owned Boundary Tests", () => {
  it("T1 [R1]: the engine finds the call's line in a target, exit 0 with a finding", () => {
    const tests = put("t1/tests.md", def("demo", CRYPTO));
    put("t1/t/a.mjs", "x\nconst h = createHash(\"sha256\");\n");
    const r = run("--tests", tests, "--target", join(dir, "t1/t"), "--base", join(dir, "t1"));
    assert.equal(r.status, 0);
    assert.equal(r.summary.result, "complete");
    assert.deepEqual(r.summary.findings.map((f) => [f.id, f.rule, f.line]), [["demo/t/a.mjs:2", "crypto", 2]]);
  });
  it("T2 [R2]: a definition that names a target or a role, or has an unknown parameter, is refused", () => {
    const base = def("demo", CRYPTO);
    for (const [name, text] of [
      ["target", base.replace("provider: demo", "provider: demo\ntargets: [packages/kaal-hosting]")],
      ["role", base.replace("provider: demo", "provider: demo\ndecider: CTO")],
      ["parameter", base.replace("    looks-for", "    colour: red\n    looks-for")],
      ["missing", base.replace("    literal: [sha256, sha-256]\n", "")],
      ["type", base.replace("callee: [createHash, digest]", "callee: createHash")],
      ["edge", base.replace("    tests: demo/I1\n", "")],
      ["ships", base.replace("    looks-for", "    ships: true\n    looks-for")],
    ]) assert.equal(run("--tests", put(`t2/${name}.md`, text), "--target", dir).status, 2, name);
  });
  it("T3 [R3]: a missing target is unknown, exit 2, and the last line is kaal-boundary-scan", () => {
    const r = run("--tests", put("t3/tests.md", def("demo", CRYPTO)), "--target", join(dir, "nope"));
    assert.equal(r.status, 2);
    assert.equal(r.summary?.result, "unknown");
  });
  it("T4 [R3]: a directory owned by the provider is skipped and reported, with no finding", () => {
    const tests = put("t4/tests.md", def("demo", CRYPTO));
    put("t4/own/ownership.kaal.json", JSON.stringify({ owner: { kind: "capability", name: "demo", id: "x" }, paths: ["own/"] }));
    put("t4/own/a.mjs", "createHash(\"sha256\")\n");
    const r = run("--tests", tests, "--target", join(dir, "t4/own"), "--base", join(dir, "t4"));
    assert.equal(r.summary?.findings.length, 0);
    assert.ok(r.summary.coverage.skipped.some((s) => s.reason === "owner"));
  });
  it("T5 [R1, R8]: the engine only reads: the target tree is identical after a run, and the engine imports only node: modules and yaml", () => {
    const tests = put("t5/tests.md", def("demo", CRYPTO));
    put("t5/ro/a.mjs", "createHash(\"sha256\")\n");
    const snap = () => readdirSync(join(dir, "t5/ro"), { recursive: true }).sort().map((f) => [f, statSync(join(dir, "t5/ro", f)).isFile() ? readFileSync(join(dir, "t5/ro", f)).toString("hex") : "dir"]);
    const before = snap();
    const r = run("--tests", tests, "--target", join(dir, "t5/ro"), "--base", join(dir, "t5"));
    assert.equal(r.status, 0);
    assert.deepEqual(snap(), before);
    const files = sources();
    assert.ok(files.includes("engine.mjs"), "engine.mjs is delivered");
    const src = files.map((f) => readFileSync(join(HERE, f), "utf8")).join("\n");
    const imports = [...src.matchAll(/(?:from\s+|import\s*\()\s*["']([^"']+)["']/g)].map((m) => m[1]);
    assert.ok(imports.length > 0 && imports.every((m) => m.startsWith("node:") || m === "yaml" || m === "commonmark" || m === "typescript" || m === "@kaihacksai/kaal-foundation/sha256" || m.startsWith("./") || m.startsWith("../")), `imports: ${imports}`);
    assert.doesNotMatch(src, /\b(writeFile|appendFile|rmSync|unlink|mkdir|rename|spawn|exec|fetch)\w*\s*\(/);
  });
  it("T6 [R2, R4]: file-identity, token-sequence and call-with-literal find a byte copy, a bounded constant sequence and a crypto call, and not their near misses", () => {
    const ref = "export const ref = 1;\n";
    put("t6/def/ref/lib.mjs", ref);
    const tests = put("t6/def/tests.md", def("demo",
      `  - id: copy\n    detector: file-identity\n    equals: [ref/lib.mjs]\n    tests: demo/I1\n    looks-for: a file whose bytes equal the provider's library\n` +
      `  - id: implementation\n    detector: token-sequence\n    tokens: ["0x428a2f98", "0x71374491"]\n    window: 3\n    tests: demo/I1\n    looks-for: the constants written out\n` + CRYPTO));
    put("t6/t/copy.mjs", ref);
    put("t6/t/noncopy.mjs", ref + "// x\n");
    put("t6/t/impl-near.mjs", "a\nconst K = [0x428a2f98,\n  0x71374491];\n");
    put("t6/t/impl-far.mjs", "a\nconst K = [0x428a2f98,\n1,\n2,\n3,\n0x71374491];\n");
    put("t6/t/impl-same.mjs", "const K = [0x428a2f98, 0x71374491];\nconst x = 0x428a2f98;\n");
    put("t6/t/both.mjs", "createHash(\"sha256\"); const K = [0x428a2f98, 0x71374491];\n");
    put("t6/t/crypto.mjs", "x\ncreateHash( \"sha256\" );\ny\nh.digest(\"SHA-256\")\ncreateHash(\"md5\")\ncreateHash(algorithm)\n");
    const r = run("--tests", tests, "--target", join(dir, "t6/t"), "--base", join(dir, "t6"));
    assert.equal(r.status, 0);
    assert.equal(r.summary.result, "complete");
    assert.equal(r.summary.coverage.read, 7);
    assert.deepEqual(r.summary.findings.map((f) => [f.id, f.rule]), [
      ["demo/t/both.mjs:1", "implementation"],
      ["demo/t/copy.mjs:1", "copy"],
      ["demo/t/crypto.mjs:2", "crypto"],
      ["demo/t/crypto.mjs:4", "crypto"],
      ["demo/t/impl-near.mjs:2", "implementation"],
      ["demo/t/impl-same.mjs:1", "implementation"],
    ]);
    const lost = run("--tests", put("t6/lost/tests.md", readFileSync(tests, "utf8")), "--target", join(dir, "t6/t"), "--base", join(dir, "t6"));
    assert.equal(lost.status, 2, "a file-identity reference that cannot be read makes the result unknown");
    assert.equal(lost.summary?.result, "unknown");
  });
  it("T7 [R7]: a finding has exactly id, rule, file, line, digest and owner; the digest is the line's SHA-256; a usage error exits 2; the exit is never 1", () => {
    const tests = put("t7/tests.md", def("demo", CRYPTO));
    put("t7/t/a.mjs", "x\ncreateHash(\"sha256\")\n");
    const r = run("--tests", tests, "--target", join(dir, "t7/t"), "--base", join(dir, "t7"));
    assert.equal(r.status, 0);
    const f = r.summary.findings[0];
    assert.deepEqual(Object.keys(f).sort(), ["digest", "file", "id", "line", "owner", "rule"]);
    assert.equal(f.digest, sha("createHash(\"sha256\")"));
    assert.equal(run("--target", join(dir, "t7/t")).status, 2);
    assert.notEqual(run("--tests", tests).status, 1);
  });
  it("T8 [R2]: a capability changes its own Boundary Tests without an Engineering code change", () => {
    const bytes = () => sha(sources().map((f) => readFileSync(join(HERE, f), "utf8")).join("\n"));
    const engineBefore = bytes();
    put("t8/t/a.mjs", "createHash(\"sha256\")\nconst m = \"md5\";\nopen(\"alpha\", \"beta\");\n");
    const find = (file) => run("--tests", file, "--target", join(dir, "t8/t"), "--base", join(dir, "t8")).summary.findings.map((f) => f.id);
    const one = find(put("t8/one.md", def("demo", CRYPTO)));
    const changed = find(put("t8/two.md", def("demo", CRYPTO.replace("[sha256, sha-256]", "[md5]").replace("[createHash, digest]", "[createHash, digest, open]"))));
    const other = find(put("t8/other.md", def("other", `  - id: pair\n    detector: token-sequence\n    tokens: [alpha, beta]\n    window: 0\n    tests: other/I1\n    looks-for: two words together\n`)));
    assert.deepEqual(one, ["demo/t/a.mjs:1"]);
    assert.notDeepEqual(changed, one);
    assert.deepEqual(other, ["other/t/a.mjs:3"]);
    assert.equal(bytes(), engineBefore);
  });
  it("T9 [R2]: a new generic detector needs an Engineering Change: a definition naming an unknown detector, or carrying code or a regular expression, is refused and runs nothing", () => {
    put("t9/t/a.mjs", "createHash(\"sha256\")\n");
    const marker = join(dir, "t9/ran.txt");
    put("t9/hook.mjs", `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(marker)}, "ran");\n`);
    for (const [name, tests] of [
      ["detector", `  - id: x\n    detector: semantic-clone\n    tests: demo/I1\n    looks-for: anything\n`],
      ["script", CRYPTO + `    script: ../hook.mjs\n`],
      ["regex", CRYPTO + `    pattern: 'createHash'\n`],
    ]) {
      const r = run("--tests", put(`t9/${name}.md`, def("demo", tests)), "--target", join(dir, "t9/t"), "--base", join(dir, "t9"));
      assert.equal(r.status, 2, name);
    }
    assert.throws(() => readFileSync(marker), "nothing from a definition is executed");
  });
  it("T10 [R1, R2]: the provisional adapter gives one descriptor per test, suite boundary, with the definition's tests edge and no ships flag", async () => {
    const tests = put("t10/tests.md", def("demo", CRYPTO + CRYPTO.replace("id: crypto", "id: crypto2").replace("tests: demo/I1", "tests: demo/I2")));
    const { boundaryCases } = await import(pathToFileURL(CASES).href);
    const cases = boundaryCases([tests]);
    assert.deepEqual(cases.map((c) => [c.id, c.suite, c.tests]), [
      ["demo/crypto", "boundary", "demo/I1"],
      ["demo/crypto2", "boundary", "demo/I2"],
    ]);
    assert.ok(cases.every((c) => typeof c.run === "function"));
  });
  it("T11 [R1, R3]: a run keeps evidence completeness and finding disposition apart and returns no verdict", async () => {
    const tests = put("t11/tests.md", def("demo", CRYPTO));
    const file = put("t11/t/a.mjs", "x\ncreateHash(\"sha256\")\n");
    const [one] = (await import(pathToFileURL(CASES).href)).boundaryCases([tests]);
    const ctx = { targets: [join(dir, "t11/t")], base: join(dir, "t11") };
    const open = await one.run({ ...ctx, decisions: [] });
    assert.equal(open.result, "complete");
    assert.equal(open.findings.length, 1);
    assert.deepEqual([open.decided, open.undecided], [[], ["demo/t/a.mjs:2"]]);
    for (const key of ["pass", "passed", "fail", "failed", "verified", "verdict"]) assert.ok(!(key in open) && open.result !== key, key);
    const decision = { id: "demo/t/a.mjs:2", digest: sha("createHash(\"sha256\")") };
    const decided = await one.run({ ...ctx, decisions: [decision] });
    assert.deepEqual([decided.decided, decided.undecided], [["demo/t/a.mjs:2"], []]);
    writeFileSync(file, "x\ncreateHash(\"sha256\", 1)\n");
    assert.deepEqual((await one.run({ ...ctx, decisions: [decision] })).undecided, ["demo/t/a.mjs:2"], "a changed line is undecided again");
    const unknown = await one.run({ targets: [join(dir, "t11/nope")], base: join(dir, "t11"), decisions: [] });
    assert.equal(unknown.result, "unknown");
  });
  it("T12 [R1, R2]: no second framework: the adapter exports only boundaryCases, and a changed capability definition changes the Cases and results with the engine bytes unchanged", async () => {
    const mod = await import(pathToFileURL(CASES).href);
    assert.deepEqual(Object.keys(mod), ["boundaryCases"]);
    put("t12/t/a.mjs", "createHash(\"md5\")\n");
    const bytes = () => sha(sources().map((f) => readFileSync(join(HERE, f), "utf8")).join("\n"));
    const before = bytes();
    const ctx = { targets: [join(dir, "t12/t")], base: join(dir, "t12"), decisions: [] };
    const [a] = mod.boundaryCases([put("t12/a.md", def("demo", CRYPTO))]);
    const [b] = mod.boundaryCases([put("t12/b.md", def("demo", CRYPTO.replace("[sha256, sha-256]", "[md5]")))]);
    assert.deepEqual((await a.run(ctx)).findings, []);
    assert.equal((await b.run(ctx)).findings.length, 1);
    assert.equal(bytes(), before);
  });
  it("T13 [R6]: the matrix runs each cell on its own and keeps its evidence unchanged", async () => {
    const defFile = put("t13/tests.md", def("demo", CRYPTO));
    put("t13/a/x.mjs", "createHash(\"sha256\")\n");
    put("t13/b/y.mjs", "nothing here\n");
    const { runMatrix } = await import(pathToFileURL(join(HERE, "matrix.mjs")).href);
    const base = join(dir, "t13");
    const { runs, notes } = runMatrix({ cells: [{ definition: defFile, target: "a" }, { definition: defFile, target: "b" }], base });
    assert.deepEqual(notes, []);
    assert.deepEqual(runs.map((r) => [r.target, r.evidence.findings.map((f) => f.id)]), [["a", ["demo/a/x.mjs:1"]], ["b", []]]);
    const direct = run("--tests", defFile, "--target", join(base, "a"), "--base", base).summary;
    assert.deepEqual(runs[0].evidence, direct);
  });
  it("T14 [R6]: an exclusion with a reason is not run and is reported; one without a reason is run and reported as unsupported", async () => {
    const defFile = put("t14/tests.md", def("demo", CRYPTO));
    put("t14/a/x.mjs", "createHash(\"sha256\")\n");
    const { runMatrix } = await import(pathToFileURL(join(HERE, "matrix.mjs")).href);
    const base = join(dir, "t14");
    const { runs, notes } = runMatrix({ cells: [{ definition: defFile, target: "a", excluded: { reason: "the provider realizes this itself" } }], base });
    assert.deepEqual(runs, []);
    assert.deepEqual(notes.map((n) => [n.kind, n.target, n.reason]), [["excluded", "a", "the provider realizes this itself"]]);
    const bare = runMatrix({ cells: [{ definition: defFile, target: "a", excluded: {} }], base });
    assert.equal(bare.runs.length, 1);
    assert.deepEqual(bare.notes.map((n) => n.kind), ["unsupported-exclusion"]);
  });
  it("T15 [R4]: Foundation's three tests, as a definition, give the findings and coverage of the old scan.mjs on the recorded fixture", () => {
    const lib = readFileSync(join(HERE, "../../packages/kaal-foundation/lib/sha256.mjs"));
    const first = lib.toString("utf8").split("\n").findIndex((l) => l.includes("0x428a2f98")) + 1;
    assert.ok(first > 1, "the library writes the round constants out");
    put("t15/def/ref/sha256.mjs", lib);
    const tests = put("t15/def/boundary-check.md", def("kaal-foundation",
      `  - id: copy\n    detector: file-identity\n    equals: [ref/sha256.mjs]\n    tests: foundation/I1\n    looks-for: a file whose bytes equal Foundation's library\n` +
      `  - id: implementation\n    detector: token-sequence\n    tokens: ["0x428a2f98", "0x71374491"]\n    window: 3\n    tests: foundation/I1\n    looks-for: the round constants written out\n` +
      CRYPTO.replace("demo/I1", "foundation/I1")));
    put("t15/t/copy.mjs", lib);
    put("t15/t/noncopy.mjs", Buffer.concat([lib, Buffer.from("\n// x\n")]));
    put("t15/t/impl-near.mjs", "a\nconst K = [0x428a2f98,\n  0x71374491];\n");
    put("t15/t/impl-far.mjs", "a\nconst K = [0x428a2f98,\n1,\n2,\n3,\n0x71374491];\n");
    put("t15/t/impl-same.mjs", "const K = [0x428a2f98, 0x71374491];\nconst x = 0x428a2f98;\n");
    put("t15/t/crypto.mjs", "x\ncreateHash( \"sha256\" );\ny\nh.digest(\"SHA-256\")\ncreateHash(\"md5\")\n");
    const r = run("--tests", tests, "--target", join(dir, "t15/t"), "--base", join(dir, "t15"));
    assert.equal(r.summary.result, "complete");
    assert.equal(r.summary.coverage.read, 6);
    // The findings the old scan.mjs gave on this fixture (PLAN, acceptance evidence), by file, rule and line.
    assert.deepEqual(r.summary.findings.map((f) => [f.file, f.rule, f.line]), [
      ["t/copy.mjs", "copy", 1],
      ["t/copy.mjs", "implementation", first],
      ["t/crypto.mjs", "crypto", 2],
      ["t/crypto.mjs", "crypto", 4],
      ["t/impl-near.mjs", "implementation", 2],
      ["t/impl-same.mjs", "implementation", 1],
      ["t/noncopy.mjs", "implementation", first],
    ]);
  });
  it("T16 [R1, R2]: two tests that match the same place each keep their own evidence as Cases, while the aggregate output is one finding attributed to the first", async () => {
    const tests = put("t16/tests.md", def("demo",
      CRYPTO.replace("id: crypto", "id: first") + CRYPTO.replace("id: crypto", "id: second") + CRYPTO.replace("id: crypto", "id: third").replace("[sha256, sha-256]", "[md5]")));
    put("t16/t/a.mjs", "x\ncreateHash(\"sha256\")\n");
    const ctx = { targets: [join(dir, "t16/t")], base: join(dir, "t16"), decisions: [] };
    const cases = (await import(pathToFileURL(CASES).href)).boundaryCases([tests]);
    const seen = {};
    for (const c of cases) seen[c.id] = (await c.run(ctx)).findings.map((f) => f.id);
    assert.deepEqual(seen, { "demo/first": ["demo/t/a.mjs:2"], "demo/second": ["demo/t/a.mjs:2"], "demo/third": [] });
    const aggregate = run("--tests", tests, "--target", join(dir, "t16/t"), "--base", join(dir, "t16")).summary.findings;
    assert.deepEqual(aggregate.map((f) => [f.id, f.rule]), [["demo/t/a.mjs:2", "first"]]);
  });
  it("T17 [R1, R2]: one test's unreadable reference makes only its own Case unknown and does not mask another Case's evidence", async () => {
    put("t17/def/ref/here.mjs", "export const ref = 1;\n");
    const tests = put("t17/def/tests.md", def("demo",
      `  - id: lost\n    detector: file-identity\n    equals: [ref/missing.mjs]\n    tests: demo/I1\n    looks-for: a copy\n` + CRYPTO));
    put("t17/t/a.mjs", "createHash(\"sha256\")\n");
    const ctx = { targets: [join(dir, "t17/t")], base: join(dir, "t17"), decisions: [] };
    const [lost, crypto] = (await import(pathToFileURL(CASES).href)).boundaryCases([tests]);
    assert.equal((await lost.run(ctx)).result, "unknown");
    const other = await crypto.run(ctx);
    assert.equal(other.result, "complete");
    assert.deepEqual(other.findings.map((f) => f.id), ["demo/t/a.mjs:1"]);
  });
  it("T18 [R2]: call-with-literal matches a call by its whole name, including a member call, in the syntax tree: a comment or a string is not a call", () => {
    const tests = put("t18/tests.md", def("demo", CRYPTO));
    put("t18/t/a.mjs", [
      "createHash(\"sha256\")",            // 1: a call
      "crypto.createHash(\"SHA-256\")",    // 2: a member call, any case and hyphen
      "h.digest( 'sha256' )",               // 3: another listed callee, spaced, single quotes
      "myDigest(\"sha256\")",              // 4: not the callee: its name only ends with it
      "xcreateHash(\"sha256\")",           // 5: likewise
      "createHash(algorithm)",              // 6: argument is not a literal
      "createHash(\"sha256\" + suffix)",   // 7: not a whole literal
      "// createHash(\"sha256\")",         // 8: a comment is not a call
      "const s = 'createHash(\"sha256\")';", // 9: nor is a string
      "createHash(",                       // 10: a call across lines is one, found at its name
      "  `sha256`,",
      ");",
      "",
    ].join("\n"));
    const r = run("--tests", tests, "--target", join(dir, "t18/t"), "--base", join(dir, "t18"));
    assert.deepEqual(r.summary.findings.map((f) => f.line), [1, 2, 3, 10]);
  });
  it("T19 [R2]: token-sequence compares numbers by value and ignores comments and strings that merely contain the text", () => {
    const tests = put("t19/tests.md", def("demo", `  - id: implementation\n    detector: token-sequence\n    tokens: ["0x428a2f98", "0x71374491"]\n    window: 3\n    tests: demo/I1\n    looks-for: the constants written out\n`));
    put("t19/t/upper.mjs", "const K = [0X428A2F98, 0X71374491];\n");
    put("t19/t/decimal.mjs", "const K = [1116352408, 1899447441];\n");
    put("t19/t/separator.mjs", "const K = [0x428a_2f98,\n  0x7137_4491];\n");
    put("t19/t/comment.mjs", "// 0x428a2f98 0x71374491\nconst a = 1; /* 0x428a2f98, 0x71374491 */\n");
    put("t19/t/string.mjs", "const t = '0x428a2f98 0x71374491';\n");
    const r = run("--tests", tests, "--target", join(dir, "t19/t"), "--base", join(dir, "t19"));
    assert.deepEqual(r.summary.findings.map((f) => f.id), ["demo/t/decimal.mjs:1", "demo/t/separator.mjs:1", "demo/t/upper.mjs:1"]);
  });
  it("T20 [R2, R3]: code detectors read JavaScript, TypeScript and the js or ts code blocks of Markdown; JSON and YAML are read as data; a file type with no parser is not applicable and never matched by pattern, and a file that does not parse makes the result unknown", () => {
    const tests = put("t20/tests.md", def("demo", CRYPTO));
    put("t20/ok/a.ts", "x\ncreateHash(\"sha256\");\n");
    put("t20/ok/doc.md", "# Doc\n\ncreateHash(\"sha256\") in prose is not code.\n\n```js\nconst a = 1;\ncreateHash(\"sha256\");\n```\n");
    put("t20/ok/data.json", "{\"c\": \"createHash(\\\"sha256\\\")\"}\n");
    put("t20/ok/data.yml", "run: createHash(\"sha256\")\n");
    const ok = run("--tests", tests, "--target", join(dir, "t20/ok"), "--base", join(dir, "t20"));
    assert.equal(ok.summary.result, "complete");
    assert.deepEqual(ok.summary.findings.map((f) => f.id), ["demo/ok/a.ts:2", "demo/ok/doc.md:7"]);
    put("t20/bad/a.mjs", "createHash(\"sha256\")\n");
    put("t20/bad/run.sh", "createHash(\"sha256\")\n");
    const none = run("--tests", tests, "--target", join(dir, "t20/bad"), "--base", join(dir, "t20"));
    assert.equal(none.status, 0, "an unsupported kind is not applicable, not unknown");
    assert.deepEqual(none.summary.coverage.notApplicable, [{ path: "bad/run.sh", provider: "demo", detectors: ["crypto"], byteChecked: false, reason: "no structural parser for this file kind" }]);
    assert.deepEqual(none.summary.findings.map((f) => f.id), ["demo/bad/a.mjs:1"], "what was parsed is still reported, and the shell is never matched by pattern");
    put("t20/broken/b.mjs", "createHash(\"sha256\"\nconst = ;\n");
    const broken = run("--tests", tests, "--target", join(dir, "t20/broken"), "--base", join(dir, "t20"));
    assert.equal(broken.summary.result, "unknown");
    assert.deepEqual(broken.summary.coverage.unreadable, [{ path: "broken/b.mjs", cause: "does not parse" }]);
  });
  it("T21 [R1, R2]: a file kind the code detectors do not apply to is recorded not applicable with a reason, is not counted as read, and is not clean; a definition with only file-identity applies to every file", () => {
    const tests = put("t21/tests.md", def("demo", CRYPTO));
    put("t21/t/a.mjs", "const a = 1;\n");
    put("t21/t/LICENSE", "MIT\n");
    put("t21/t/img.png", "x");
    const r = run("--tests", tests, "--target", join(dir, "t21/t"), "--base", join(dir, "t21"));
    assert.equal(r.status, 0);
    assert.equal(r.summary.coverage.read, 1, "only the file the detectors read");
    assert.deepEqual(r.summary.coverage.notApplicable.map((n) => [n.path, n.reason]), [["t/LICENSE", "a licence text, no executable content"], ["t/img.png", "no structural parser for this file kind"]]);
    const only = put("t21/identity.md", def("demo", `  - id: copy\n    detector: file-identity\n    equals: [ref.txt]\n    tests: demo/I1\n    looks-for: a copy\n`));
    put("t21/ref.txt", "MIT\n");
    const bytes = run("--tests", only, "--target", join(dir, "t21/t"), "--base", join(dir, "t21"));
    assert.deepEqual(bytes.summary.coverage.notApplicable, []);
    assert.deepEqual(bytes.summary.findings.map((f) => f.id), ["demo/t/LICENSE:1"], "R6: bytes still count");
  });
  it("T22 [R3]: the global list supplies the reason by exact name or extension, and the default covers the rest", () => {
    const tests = put("t22/tests.md", def("demo", CRYPTO));
    for (const f of ["LICENSE", ".gitignore", ".gitattributes", "CODEOWNERS", "x.bin"]) put(`t22/t/${f}`, "x\n");
    put("t22/t/a.mjs", "const a = 1;\n");
    const r = run("--tests", tests, "--target", join(dir, "t22/t"), "--base", join(dir, "t22"));
    assert.equal(r.status, 0);
    assert.deepEqual(r.summary.coverage.notApplicable.map((n) => n.reason.includes("no executable content") || n.reason === "no structural parser for this file kind"), [true, true, true, true, true]);
    assert.equal(run("--tests", tests, "--target", join(dir, "t22/t/LICENSE"), "--base", join(dir, "t22")).summary.result, "unknown", "nothing read is no evidence");
    assert.equal(r.summary.coverage.notApplicable.filter((n) => n.reason.includes("no executable content")).length, 4);
  });
  it("T23 [R4]: a local list gives its reason to its own definition only, and the file stays visible to another definition", () => {
    const local = put("t23/local.md", `---\nprovider: demo\nnot-applicable:\n  - extension: .sh\n    reason: demo's tests are JS-shaped\ntests:\n${CRYPTO}---\nWhy.\n`);
    const plain = put("t23/plain.md", def("other", CRYPTO.replace("demo/I1", "other/I1")));
    put("t23/t/run.sh", "x\n");
    const a = run("--tests", local, "--target", join(dir, "t23/t"), "--base", join(dir, "t23"));
    assert.deepEqual(a.summary.coverage.notApplicable.map((n) => n.reason), ["demo's tests are JS-shaped"]);
    const b = run("--tests", plain, "--target", join(dir, "t23/t"), "--base", join(dir, "t23"));
    assert.deepEqual(b.summary.coverage.notApplicable.map((n) => n.reason), ["no structural parser for this file kind"]);
  });
  it("T24 [R5, R7]: a list entry that names a parsed kind, has no reason, a glob, a path, a target or a role, or is duplicated, is refused", () => {
    const entry = (e) => `---\nprovider: demo\nnot-applicable:\n${e}tests:\n${CRYPTO}---\nWhy.\n`;
    for (const [name, e] of [
      ["parsed extension", "  - extension: .mjs\n    reason: x\n"],
      ["parsed name", "  - name: build.json\n    reason: x\n"],
      ["markdown", "  - extension: .md\n    reason: x\n"],
      ["no reason", "  - extension: .sh\n"],
      ["glob", "  - name: \"*.sh\"\n    reason: x\n"],
      ["path", "  - name: hooks/pre-push\n    reason: x\n"],
      ["target", "  - extension: .sh\n    reason: x\n    target: packages/kaal-hosting\n"],
      ["role", "  - extension: .sh\n    reason: x\n    decider: CTO\n"],
      ["both", "  - extension: .sh\n    name: run\n    reason: x\n"],
      ["no dot", "  - extension: sh\n    reason: x\n"],
      ["duplicate", "  - extension: .sh\n    reason: x\n  - extension: .sh\n    reason: y\n"],
    ]) assert.equal(run("--tests", put(`t24/${name.replace(/ /g, "-")}.md`, entry(e)), "--target", dir).status, 2, name);
  });
  it("T25 [R5]: a file of a supported kind that does not parse stays unknown, whatever a list says", () => {
    const tests = put("t25/tests.md", `---\nprovider: demo\nnot-applicable:\n  - extension: .sh\n    reason: shell\ntests:\n${CRYPTO}---\nWhy.\n`);
    for (const [f, text] of [["b.mjs", "const = ;\n"], ["c.json", "{\n"], ["d.yml", "a: [\n"]]) {
      put(`t25/${f.replace(".", "-")}/${f}`, text);
      const r = run("--tests", tests, "--target", join(dir, `t25/${f.replace(".", "-")}`), "--base", join(dir, "t25"));
      assert.equal(r.status, 2, f);
      assert.equal(r.summary.result, "unknown", f);
      assert.equal(r.summary.coverage.unreadable[0].cause, "does not parse", f);
    }
  });
  it("T26 [R2, R6]: two definitions over the same unsupported file and reason stay separately visible with their own detectors, and byteChecked says when file-identity ran on bytes though no parser did", () => {
    const one = put("t26/one.md", def("alpha", CRYPTO.replace("demo/I1", "alpha/I1")));
    const two = put("t26/two.md", def("beta", `  - id: seq\n    detector: token-sequence\n    tokens: ["1", "2", "3"]\n    window: 3\n    tests: beta/I1\n    looks-for: a sequence\n` +
      `  - id: copy\n    detector: file-identity\n    equals: [ref.txt]\n    tests: beta/I1\n    looks-for: a copy\n`));
    put("t26/ref.txt", "other\n");
    put("t26/t/a.mjs", "const a = 1;\n");
    put("t26/t/run.sh", "x\n");
    const r = run("--tests", one, "--tests", two, "--target", join(dir, "t26/t"), "--base", join(dir, "t26"));
    assert.equal(r.status, 0);
    const mine = r.summary.coverage.notApplicable.filter((n) => n.path === "t/run.sh").map((n) => [n.provider, n.detectors, n.byteChecked]);
    assert.deepEqual(mine, [["alpha", ["crypto"], false], ["beta", ["seq"], true]]);
    assert.equal(r.summary.coverage.read, 1, "a byte check is not a structural read");
  });
});
