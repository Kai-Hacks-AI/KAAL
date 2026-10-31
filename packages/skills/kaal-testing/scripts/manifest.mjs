// The publisher's step that writes test/verify.json (testing/F64, testing/F66): every other shipped file's
// SHA-256; the delivered cases, each named by its title; the same cases as Testing's own model, each tracing to the Testing
// identifiers its title names in brackets; no applicability; and the supported platforms. Generated, never
// edited by hand. It runs in the source workspace only and does not ship. Commands run through Hosting.
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
writeFileSync(join(PACKAGE, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
