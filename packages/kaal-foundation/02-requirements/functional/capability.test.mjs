/*---
tests: [foundation/F11, foundation/F12, foundation/F13, foundation/F14, foundation/F16, foundation/F17, foundation/N7, foundation/N8, foundation/N9, foundation/N10, foundation/A26, foundation/A28]
---*/
// foundation/C7 planned publisher cases: Foundation as a capability (plan/capability/*.md). Immutable
// to DO and CHECK; foundation/C8 moves this file unchanged to test/publisher/ and turns it GREEN. Each
// title names the contracts it checks. npm runs as its CLI script under this Node, named by
// npm_execpath; no shell is chosen and no platform is consulted (foundation/N7, #668).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { collect, DIST_LOOPS } from "../../04-test/package-check/collect.mjs";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPOSITORY = join(PACKAGE, "..", "..");
const NAME = "@kaihacksai/kaal-foundation";
const LINE = "kaal-foundation-verification ";
const ABC = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
const MANIFEST = "dist/test/package-check/verify.json";
const LIB = "dist/skills/kaal-foundation/scripts";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifest = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));

/** Runs npm (as its CLI script) or Node; never throws. Run outside npm, there is no npm to run. */
const run = (cmd, args, cwd, input) => {
  const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false", NODE_TEST_CONTEXT: undefined };
  const cli = process.env.npm_execpath;
  if (cmd === "npm" && (!cli || !/\.[cm]?js$/.test(cli))) return { status: null, stdout: "", stderr: "", out: "npm_execpath names no npm CLI script: run these tests through npm" };
  const r = spawnSync(process.execPath, cmd === "npm" ? [cli, ...args] : args, { cwd, encoding: "utf8", env, input });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};
const lines = (s) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const last = (r) => lines(r.stdout).at(-1) ?? "";
/** The verification summary on the last line, or null. */
const summary = (r) => {
  const l = last(r);
  if (!l.startsWith(LINE)) return null;
  try {
    return JSON.parse(l.slice(LINE.length));
  } catch {
    return null;
  }
};

/** Every file under a directory, as sorted relative POSIX paths, skipping node_modules. */
const listed = (root) => {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules") continue;
      const path = join(dir, e.name);
      if (e.isDirectory()) walk(path);
      else out.push(path.slice(root.length + 1).replaceAll("\\", "/"));
    }
  };
  walk(root);
  return out.sort();
};

/** The delivered cases of an installed copy: each test title's leading identifier and bracketed targets. */
const delivered = (root) => {
  const cases = [];
  for (const f of collect(join(root, "dist"), DIST_LOOPS)) {
    for (const m of readFileSync(join(root, "dist", f), "utf8").matchAll(/\btest\(\s*"(foundation\/T\d+) \[([^\]]+)\]: /g)) cases.push({ id: m[1], tests: m[2].split(",").map((t) => t.trim()) });
  }
  return cases;
};
/** Every identifier the documents define as a bold term, a heading, or a table row's first cell. */
const defined = (root) => {
  const ids = new Set();
  for (const f of listed(join(root, "dist")).filter((f) => f.endsWith(".md") && (f.startsWith("docs/") || f.includes("/references/"))))
    for (const m of readFileSync(join(root, "dist", f), "utf8").matchAll(/(?:\*\*|^#+\s+|^\|\s*)([a-z][a-z-]*\/[A-Z]+\d+)\b/gm)) ids.add(m[1]);
  return ids;
};

let work, consumer, installed;
before(() => {
  work = mkdtempSync(join(tmpdir(), "kaal-foundation-capability-"));
  const pack = run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", work], PACKAGE);
  assert.equal(pack.status, 0, pack.out);
  const tarball = join(work, JSON.parse(pack.stdout.slice(pack.stdout.indexOf("[")))[0].filename);
  consumer = join(work, "consumer");
  mkdirSync(consumer);
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true, type: "module" }));
  const install = run("npm", ["install", tarball], consumer);
  assert.equal(install.status, 0, install.out);
  installed = join(consumer, "node_modules", "@kaihacksai", "kaal-foundation");
});
after(() => rmSync(work, { recursive: true, force: true }));

/** A copy of the installed package under a fresh node_modules, changed by `mutate`, and its verification. */
function verifyCopy(mutate) {
  const root = mkdtempSync(join(work, "copy-"));
  const copy = join(root, "node_modules", "@kaihacksai", "kaal-foundation");
  cpSync(installed, copy, { recursive: true });
  mutate(copy);
  const r = run("node", [join(copy, "dist", "test", "package-check", "verify.mjs")], root);
  return { ...r, summary: summary(r) };
}
const rewrite = (copy, path) => {
  const file = join(copy, MANIFEST);
  const v = JSON.parse(readFileSync(file, "utf8"));
  v.files[path] = hash(readFileSync(join(copy, path)));
  writeFileSync(file, JSON.stringify(v, null, 2) + "\n");
};

test("foundation/T15 [foundation/F11, foundation/F13, foundation/A26]: the installed manifest lists every other installed file with its SHA-256, its cases are exactly the delivered titles' identifiers, its model is those cases with their targets, every target is defined in the installed documents, and the committed manifest is the packed one", () => {
  const file = join(installed, MANIFEST);
  assert.ok(existsSync(file), "the package ships no dist/test/package-check/verify.json");
  const v = JSON.parse(readFileSync(file, "utf8"));
  const files = listed(installed).filter((p) => p !== MANIFEST);
  assert.deepEqual(Object.keys(v.files ?? {}).sort(), files, "files lists exactly the other installed files");
  for (const p of files) assert.equal(v.files[p], hash(readFileSync(join(installed, p))), `${p} has its SHA-256`);
  const cases = delivered(installed);
  assert.ok(cases.length > 0, "at least one delivered case ships");
  assert.deepEqual(v.cases, cases.map((c) => c.id), "cases are the delivered titles' identifiers, in file and title order");
  assert.equal(new Set(v.cases).size, v.cases.length, "each case name is unique");
  assert.deepEqual(v.model, { cases }, "the model is exactly the delivered cases with their targets");
  const ids = defined(installed);
  for (const c of cases) for (const t of c.tests) assert.ok(ids.has(t), `${c.id} tests ${t}, which the installed documents do not define`);
  for (const key of ["identifiers", "coverage", "allocated", "unverified"]) assert.equal(v[key], undefined, `the manifest declares no ${key}`);
  assert.deepEqual(readFileSync(join(PACKAGE, "04-test", "package-check", "verify.json")), readFileSync(file), "the committed manifest is the packed one");
});

test("foundation/T16 [foundation/F17]: the installed npm test ends on the verification line with verified, exit 0, every declared case once with outcome pass, and no cause", () => {
  const r = run("npm", ["test"], installed);
  const s = summary(r);
  assert.ok(s, `the last line is ${LINE}{json}: ${r.out}`);
  assert.equal(r.status, 0, r.out);
  assert.equal(s.result, "verified");
  assert.equal(s.exit, 0);
  assert.deepEqual(s.causes, []);
  const declared = JSON.parse(readFileSync(join(installed, MANIFEST), "utf8")).cases;
  assert.deepEqual(s.cases, declared.map((name) => ({ name, outcome: "pass" })), "every declared case ran once and passed");
  assert.doesNotMatch(r.out, /test:publisher/, "the installed npm test never starts the publisher suite");
});

test("foundation/T17 [foundation/F17]: on an installed copy, a changed document, a missing manifest, a removed case file and an undeclared case are cannot verify with their cause", { timeout: 300_000 }, () => {
  assert.ok(existsSync(join(installed, MANIFEST)), "blocked before behavioural assertion: no manifest ships, so tampering cannot be told");
  const cannot = (why, r, cause) => {
    assert.equal(r.status, 2, `${why}: ${r.out}`);
    assert.ok(r.summary, `${why} ends on the verification line: ${r.out}`);
    assert.equal(r.summary.result, "cannot verify", why);
    assert.equal(r.summary.exit, 2, why);
    assert.ok(r.summary.causes.some((c) => cause.test(c)), `${why} names its cause: ${JSON.stringify(r.summary.causes)}`);
  };
  cannot("a changed document", verifyCopy((c) => writeFileSync(join(c, "dist", "docs", "intent", "intent.md"), "changed\n")), /docs\/intent\/intent\.md/);
  cannot("a missing manifest", verifyCopy((c) => rmSync(join(c, MANIFEST))), /verify\.json/);
  const first = collect(join(installed, "dist"), DIST_LOOPS)[0];
  cannot("a removed case file", verifyCopy((c) => rmSync(join(c, "dist", first))), new RegExp(first.replaceAll(".", "\\.")));
  cannot(
    "an undeclared case",
    verifyCopy((c) => writeFileSync(join(c, "dist", "docs", "intent", "zz-extra.test.mjs"), 'import { test } from "node:test";\ntest("foundation/TX-undeclared [foundation/F1]: extra", () => {});\n')),
    /foundation\/TX-undeclared/,
  );
});

test("foundation/T76 [foundation/F12, foundation/N10, foundation/A28]: on an installed copy, a wrong library behind a matching manifest is failed", { timeout: 300_000 }, () => {
  assert.ok(existsSync(join(installed, MANIFEST)), "blocked before behavioural assertion: no manifest ships, so tampering cannot be told");
  const wrong = verifyCopy((c) => {
    writeFileSync(join(c, LIB, "sha256.mjs"), 'export function sha256(bytes) { if (!(bytes instanceof Uint8Array)) throw new TypeError("bytes"); return "0".repeat(64); }\n');
    rewrite(c, `${LIB}/sha256.mjs`);
  });
  assert.equal(wrong.status, 1, `a wrong library is failed: ${wrong.out}`);
  assert.equal(wrong.summary?.result, "failed", wrong.out);
  assert.ok(wrong.summary.cases.some((c) => c.outcome === "fail"), "a case reports fail");
  assert.ok(wrong.summary.causes.length > 0, "failed names a cause");
});

test("foundation/T18 [foundation/F14, foundation/N8, foundation/A26]: the declared bin, run in the consumer through npm exec, prints the host's digest for a file and standard input, exits 2 with a usage line on an unreadable file or an unknown command, and verify ends on the verification line", () => {
  assert.deepEqual(manifest().bin, { "kaal-foundation": `${LIB}/kaal-foundation.mjs` }, "the package declares the kaal-foundation bin");
  const exec = (args, input) => run("npm", ["exec", "--no", "--", "kaal-foundation", ...args], consumer, input);
  writeFileSync(join(consumer, "abc.txt"), "abc");
  const file = exec(["sha256", "abc.txt"]);
  assert.equal(file.status, 0, file.out);
  assert.equal(last(file), `${ABC}  abc.txt`);
  const both = exec(["sha256", "abc.txt", "package.json"]);
  assert.deepEqual(lines(both.stdout).slice(-2), [`${ABC}  abc.txt`, `${hash(readFileSync(join(consumer, "package.json")))}  package.json`]);
  const stdin = exec(["sha256"], "abc");
  assert.equal(stdin.status, 0, stdin.out);
  assert.equal(last(stdin), `${ABC}  -`);
  for (const [why, args] of [["an unreadable file", ["sha256", "missing.txt"]], ["an unknown command", ["frobnicate"]], ["no command", []]]) {
    const r = exec(args);
    assert.equal(r.status, 2, `${why} exits 2: ${r.out}`);
    assert.match(r.stderr, /usage: kaal-foundation/, `${why} prints a usage line`);
  }
  const verify = exec(["verify"]);
  assert.equal(verify.status, 0, verify.out);
  assert.equal(summary(verify)?.result, "verified", verify.out);
});

test("foundation/T19 [foundation/F16, foundation/A28]: the repository's AGENTS.md has a Foundation section naming the skill's path and both commands", () => {
  const text = readFileSync(join(REPOSITORY, "AGENTS.md"), "utf8");
  const m = /^(#+)\s+.*\bFoundation\b.*$/m.exec(text);
  assert.ok(m, "AGENTS.md has a Foundation section");
  const rest = text.slice(m.index + m[0].length);
  const end = rest.search(new RegExp(`^#{1,${m[1].length}}\\s`, "m"));
  const section = end < 0 ? rest : rest.slice(0, end);
  for (const s of ["skills/kaal-foundation/SKILL.md", "kaal-foundation sha256", "kaal-foundation verify"]) assert.ok(section.includes(s), `the Foundation section names ${s}`);
});

test("foundation/T20 [foundation/F17]: the source Test Plan is declared; npm test builds dist/ and runs the delivered verification alone, and test:publisher builds first and runs the collector, with no hand-kept list of files", () => {
  const { scripts = {}, files = [] } = manifest();
  assert.equal(scripts.pretest, `node -e "if(require('fs').existsSync('04-test')){require('child_process').execFileSync(process.execPath,['04-test/engineering-check/build.mjs'],{stdio:'inherit'})}"`, "in source, npm test builds dist/ first; installed, there is no 04-test and it builds nothing");
  assert.equal(scripts.test, "node dist/test/package-check/verify.mjs", "npm test is the delivered verification");
  assert.equal(scripts["test:all"], undefined, "there is no runner: npm test is the one verification");
  assert.equal(scripts["test:embedded"], undefined, "there is no separate embedded suite");
  assert.equal(scripts["test:publisher"], "npm run build && node 04-test/engineering-check/collect.mjs", "test:publisher builds first, then runs the collector");
  assert.ok(existsSync(join(PACKAGE, "04-test/engineering-check/collect.mjs")), "the collector exists");
  assert.deepEqual(files, ["dist"], "dist/ is the only shipped thing: no plan, no publisher suite");
});

test("foundation/T21 [foundation/N7, foundation/A28]: no file in the package, tests included, reads the platform, names the Windows platform, writes a command-script launcher or passes a shell option", () => {
  const forbidden = [new RegExp("process" + "\\.platform"), new RegExp("win" + "32"), new RegExp("\\." + "cmd\\b"), new RegExp("\\bshell" + "\\s*:")];
  const offenders = [];
  for (const p of listed(PACKAGE).filter((p) => /\.(mjs|cjs|js|ts|json)$/.test(p))) {
    const text = readFileSync(join(PACKAGE, p), "utf8");
    for (const re of forbidden) if (re.test(text)) offenders.push(`${p} names ${re.source}`);
  }
  assert.deepEqual(offenders, []);
});

test("foundation/T22 [foundation/N9, foundation/A28]: the library is byte for byte main's, and the package declares no dependency", () => {
  assert.equal(hash(readFileSync(join(PACKAGE, "05-src", "skills", "kaal-foundation", "scripts", "sha256.mjs"))), "c504c09d231c8a58f2ae2dbf346edbdf4dd544bdbdba1161515875d051df5ee0");
  assert.equal(hash(readFileSync(join(PACKAGE, "05-src", "skills", "kaal-foundation", "scripts", "sha256.d.ts"))), "e0b71d43eb02726e7ed9fa05cf1c60c4b88224f99a5120de56bb54b3da303a16");
  const m = manifest();
  for (const kind of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "bundleDependencies", "bundledDependencies"])
    assert.equal(Object.keys(m[kind] ?? {}).length, 0, `the package declares no ${kind}`);
  assert.equal(m.name, NAME);
});
