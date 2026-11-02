import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { it } from "node:test";
import { hashes } from "../verify.mjs";
import { portability } from "@kaihacksai/kaal-hosting/boundary";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), "hosting-defect-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function installed(t, { duplicateDeclaration = false, duplicateExecution = false, firstFails = false } = {}) {
  const root = temporary(t), pkg = join(root, "node_modules", "@kaihacksai", "kaal-hosting");
  mkdirSync(join(pkg, "test", "embed"), { recursive: true });
  mkdirSync(join(pkg, "docs"));
  writeFileSync(join(root, "package.json"), "{}");
  writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "@kaihacksai/kaal-hosting", version: "0.0.1", type: "module", files: ["docs", "test/embed", "test/verify.mjs", "test/verify.json"] }));
  copyFileSync(join(PACKAGE, "test/verify.mjs"), join(pkg, "test/verify.mjs"));
  writeFileSync(join(pkg, "docs/requirements.md"), "**hosting/F1** fixture obligation");
  writeFileSync(join(pkg, "docs/testing.md"), ["applicability", "allocated", "unverified"].map((marker) => `<!-- kaal-hosting:${marker} -->\n| Identifier | Detail |\n| --- | --- |\n<!-- /kaal-hosting:${marker} -->\n`).join("\n"));
  const cases = [];
  for (const loop of ["intent", "requirements", "architecture", "code"]) {
    const file = `test/embed/${loop}.test.mjs`, name = "case [hosting/F1]";
    const extra = duplicateExecution && loop === "code" ? `test(${JSON.stringify(name)},()=>{${firstFails ? "throw new Error('observed duplicate failure')" : ""}});\n` : "";
    writeFileSync(join(pkg, file), `import {test} from 'node:test';\n${extra}test(${JSON.stringify(name)},()=>{});\n`);
    cases.push(`${file} > ${name}`);
    if (duplicateDeclaration && loop === "code") cases.push(`${file} > ${name}`);
  }
  writeFileSync(join(pkg, "test/verify.json"), JSON.stringify({ cases, hashes: hashes(pkg), coverage: { "hosting/F1": { covered: ["intent", "requirements", "architecture", "code"] } }, applicability: {} }));
  return pkg;
}
const run = (pkg, entry = "test/verify.mjs") => spawnSync(process.execPath, [entry], { cwd: pkg, env, encoding: "utf8" });
const summary = (r) => JSON.parse(r.stdout.split(/\r?\n/).find((l) => l.startsWith("kaal-hosting-verification ")).slice("kaal-hosting-verification ".length));

it("hosting/T79 [hosting/F21, hosting/F22, hosting/F25]: duplicate inventory is cannot verify and every observed execution failure remains failed", async (t) => {
  const clean = run(installed(t));
  assert.equal(clean.status, 0, clean.stdout + clean.stderr);
  await t.test("duplicate installed declaration", () => {
  const declared = run(installed(t, { duplicateDeclaration: true }));
  assert.equal(declared.status, 2, declared.stdout + declared.stderr);
  assert.equal(summary(declared).result, "cannot verify");
  assert.match(summary(declared).cause, /duplicate/i);
  assert.doesNotMatch(declared.stdout, /^pass:/m, "ambiguous prerequisites prevent test execution");
  });
  await t.test("later pass cannot erase an execution failure", () => {
  const failed = run(installed(t, { duplicateExecution: true, firstFails: true }));
  assert.equal(failed.status, 1, failed.stdout + failed.stderr);
  assert.equal(summary(failed).result, "failed");
  assert.match(summary(failed).cause, /observed duplicate failure/);
  });
  await t.test("duplicate passing execution is ambiguous", () => {
  const repeated = run(installed(t, { duplicateExecution: true }));
  assert.equal(repeated.status, 2, repeated.stdout + repeated.stderr);
  assert.match(summary(repeated).cause, /more than once|duplicate/i);
  });
});

it("hosting/T79 inventory generation refuses duplicate passing case names", (t) => {
  const pkg = installed(t, { duplicateExecution: true });
  mkdirSync(join(pkg, "test/publisher"));
  copyFileSync(join(PACKAGE, "test/publisher/manifest.mjs"), join(pkg, "test/publisher/manifest.mjs"));
  rmSync(join(pkg, "test/verify.json"));
  const generated = run(pkg, "test/publisher/manifest.mjs");
  assert.equal(generated.status, 1, generated.stdout + generated.stderr);
  assert.match(generated.stderr, /duplicate/i);
});

it("hosting/T80 controlled host: failed fixture setup never deletes caller-owned target entries", (t) => {
  const root = temporary(t);
  const subject = new URL("../../dist/fixtures.js", import.meta.url).href;
  const fsStub = join(root, "fs.mjs"), netStub = join(root, "net.mjs"), hostStub = join(root, "host.mjs");
  writeFileSync(fsStub, `export const mkdtempSync=()=>'/fact'; export const rmSync=(p,options)=>{p=globalThis.canonical(p);for(const key of globalThis.entries.keys())if(key===p||(options?.recursive&&key.startsWith(p+'/')))globalThis.entries.delete(key)}; export const lstatSync=(p)=>{const k=globalThis.entries.get(globalThis.canonical(p));return k?{isFIFO:()=>k==='fifo',isSocket:()=>k==='socket'}:undefined};`);
  writeFileSync(hostStub, `export async function execute(c,[p]){p=globalThis.canonical(p);if(globalThis.entries.has(p))return {status:1,stderr:'EEXIST'};globalThis.entries.set(p,'fifo');return {status:0,stderr:''}}`);
  writeFileSync(netStub, `export function createServer(){let error;return {once:(e,cb)=>{error=cb},listen:(p,cb)=>{p=globalThis.canonical(p);if(globalThis.entries.has(p))error(new Error('EADDRINUSE'));else{globalThis.entries.set(p,'socket');cb()}},close:(cb)=>cb()}}`);
  const driver = join(root, "driver.mjs");
  // URLs are constructed by the driver, so Windows drive letters remain file URLs.
  writeFileSync(driver, `import assert from 'node:assert/strict';import {registerHooks} from 'node:module';import {pathToFileURL} from 'node:url';globalThis.entries=new Map();globalThis.canonical=(p)=>p.replaceAll(String.fromCharCode(92),'/');
    const subject=${JSON.stringify(subject)}; const mapping={'node:fs':${JSON.stringify(fsStub)},'node:net':${JSON.stringify(netStub)},'./index.js':${JSON.stringify(hostStub)}};
    registerHooks({resolve(s,c,next){if(c.parentURL===subject&&mapping[s])return {url:pathToFileURL(mapping[s]).href,shortCircuit:true};return next(s,c)}});
    const {facts,specialEntries,SetupFailure}=await import(subject);assert.equal((await facts())['kaal-hosting/special-entries'].holds,true);
    for(const name of ['fifo','socket']){const p='/caller/'+name;entries.set(p,'original');await assert.rejects(specialEntries('/caller'),SetupFailure);assert.equal(entries.get(p),'original','caller '+name+' must survive');assert.equal(entries.size,1,'only caller entry remains');entries.clear();}
  `);
  const observed = spawnSync(process.execPath, [driver], { env, encoding: "utf8" });
  assert.equal(observed.status, 0, observed.stdout + observed.stderr);
});

it("hosting/T82 [hosting/F40, hosting/N6]: challenge all controlled cases without borrowing an unrelated preceding title", async (t) => {
  const root = temporary(t);
  mkdirSync(join(root, "test"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "portable-fixture", type: "module" }));
  const examples = [
    { code: `it('before',()=>{});\nif(process.platform==='win32'){\n it('first',()=>{});\n it('second',()=>{});\n}else{\n it('otherwise',()=>{});\n}\nit('after',()=>{});`, expected: ["first", "otherwise", "second"] },
    { code: `if(process.platform==='win32'){\n describe('group',()=>{\n it('nested',()=>{});\n it('nested second',()=>{});\n });\n}`, expected: ["nested", "nested second"] },
    { code: `it('diluted',()=>{\n if(process.platform==='win32'){assert.equal(1,1);}\n});\nit('unrelated',()=>{});`, expected: ["diluted"] },
    { code: `it('early',()=>{\n if(process.platform==='win32') return;\n assert.equal(1,1);\n});`, expected: ["early"] },
    { code: `(process.platform==='win32' ? ()=>{} : it)('conditional',()=>{});`, expected: ["conditional"] },
    { code: `it('setup',()=>{let fixture;if(process.platform==='win32'){fixture=1;}assert.equal(1,1);});`, expected: [] },
    { code: `// if(process.platform==='win32'){it('comment',()=>{});}\nit('portable',()=>{});`, expected: [] },
  ];
  for (const { code, expected } of examples) {
    writeFileSync(join(root, "test/sample.test.mjs"), `import {it,describe} from 'node:test';import assert from 'node:assert/strict';\n${code}\n`);
    const result = await portability({ name: "portable-fixture", root, builtins: ["node:test", "node:assert/strict"] });
    assert.deepEqual(result.challenged, expected.sort(), code);
    if (expected.length) assert.equal(result.review, "requested", "challenges do not close review");
  }
});
