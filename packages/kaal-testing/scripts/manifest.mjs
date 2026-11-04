// The publisher's step that writes test/verify.json (testing/F64, testing/F66): every other shipped file's
// SHA-256; the delivered cases, each named by its title; the same cases as Testing's own model, each tracing to the Testing
// identifiers its title names in brackets; no applicability; and the supported platforms. Generated, never
// edited by hand. It runs in the source workspace only and does not ship. Commands run through Hosting.
// `--check` verifies the committed manifest instead of writing it.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = "test/verify.json";
const CASES = /^test\/embed\/[^/]+\.test\.mjs$/;
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const pack = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
if (pack.status !== 0) throw new Error(`npm pack --dry-run failed:\n${pack.stdout}${pack.stderr}`);
const shipped = JSON.parse(pack.stdout.slice(pack.stdout.indexOf("[")))[0].files.map((f) => f.path).filter((p) => p !== MANIFEST).sort();

/** The cases one delivered file declares: one literal describe, and literal it titles naming their subjects in brackets. */
function declared(file, text) {
  const suites = [...text.matchAll(/\bdescribe\(\s*"([^"\\]+)"/g)].map((m) => m[1]);
  if (suites.length !== 1) throw new Error(`${file} must declare exactly one describe with a double-quoted name`);
  if (/\b(it|describe)\(\s*[`']/.test(text)) throw new Error(`${file} must name its cases with double-quoted literals`);
  const version = sha256(text).slice(0, 12);
  return [...text.matchAll(/\bit\(\s*"([^"\\]+)"/g)].map(([, title]) => {
    const subjects = /\[([^\]]+)\]\s*$/.exec(title);
    const tests = subjects ? subjects[1].split(",").map((s) => s.trim()) : [];
    if (!tests.length || !tests.every((id) => /^testing\/[IFNAD]\d+$/.test(id))) throw new Error(`${file}: "${title}" names no testing/ subjects in brackets`);
    return { id: title, version, tests };
  });
}
const cases = shipped.filter((p) => CASES.test(p)).flatMap((p) => declared(p, readFileSync(join(PACKAGE, p), "utf8")));
if (!cases.length) throw new Error("the delivered files declare no case");
const ids = cases.map((c) => c.id);
if (new Set(ids).size !== ids.length) throw new Error("two delivered cases share a title: each case is named by its title alone");
const hashes = Object.fromEntries(shipped.map((p) => [p, sha256(readFileSync(join(PACKAGE, p)))]));
const manifest = { hashes, cases: cases.map((c) => c.id), model: { cases }, applicability: {}, platforms: ["darwin", "linux", "win32"] };
const text = `${JSON.stringify(manifest, null, 2)}\n`;
// `--check [path]` writes nothing: it compares what this step would write with the committed manifest (or `path`)
// and fails on any difference, so a stale manifest is caught, never silently regenerated.
const at = process.argv.indexOf("--check");
if (at < 0) writeFileSync(join(PACKAGE, MANIFEST), text);
else {
  const against = process.argv[at + 1] ? resolve(process.argv[at + 1]) : join(PACKAGE, MANIFEST);
  let committed = null;
  try {
    committed = readFileSync(against, "utf8");
  } catch (e) {
    console.error(`kaal-testing manifest: stale: ${against} cannot be read (${e.code ?? e.message}); run npm run manifest`);
    process.exit(1);
  }
  if (committed !== text) {
    let old = {};
    try { old = JSON.parse(committed); } catch { /* reported as a whole-file difference */ }
    const was = old?.hashes ?? {};
    const changed = [...new Set([...Object.keys(was), ...Object.keys(hashes)])].filter((p) => was[p] !== hashes[p]).sort();
    console.error(`kaal-testing manifest: stale: ${against} differs from what npm run manifest writes${changed.length ? `: ${changed.join(", ")}` : ""}`);
    process.exit(1);
  }
  console.log("kaal-testing manifest: current");
}
