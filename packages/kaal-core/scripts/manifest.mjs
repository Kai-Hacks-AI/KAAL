// kaal-core's build step for the shipped manifest (core/F85, core/A43): writes test/verify.json, which
// lists every other file the package ships with its SHA-256, and declares every Embedded Test Case of
// the delivered loops by its file, its full name and the core/ subjects its name brackets. Generated,
// never edited by hand. Commands run through Hosting, and hashing is Foundation's (core/F88).
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { execute, readFile } from "kaal-hosting";
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = "test/verify.json";
const LOOPS = /^test\/embed\/[^/]+\.test\.mjs$/;

const pack = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: CORE });
if (pack.status !== 0) throw new Error(`npm pack --dry-run failed:\n${pack.stdout}${pack.stderr}`);
const shipped = JSON.parse(pack.stdout.slice(pack.stdout.indexOf("[")))
  .flatMap((p) => p.files.map((f) => f.path))
  .filter((f) => f !== MANIFEST)
  .sort();

const files = {};
for (const f of shipped) files[f] = sha256(await readFile(join(CORE, f)));

/** The cases one delivered loop declares: one literal describe, and literal it titles naming their core/ subjects. */
function declared(file, text) {
  const suites = [...text.matchAll(/\bdescribe\(\s*"([^"\\]+)"/g)].map((m) => m[1]);
  if (suites.length !== 1) throw new Error(`${file} must declare exactly one describe with a literal name`);
  if (/\bit\(\s*[`']/.test(text) || /\bdescribe\(\s*[`']/.test(text)) throw new Error(`${file} must name its cases with double-quoted literals`);
  return [...text.matchAll(/\bit\(\s*"([^"\\]+)"/g)].map(([, title]) => {
    const subjects = /\[([^\]]+)\]\s*$/.exec(title);
    const tests = subjects ? subjects[1].split(",").map((s) => s.trim()) : [];
    if (!tests.length || !tests.every((id) => /^core\/[IFNAD]\d+$/.test(id))) throw new Error(`${file}: "${title}" names no core/ subjects in brackets`);
    return { file, name: `${suites[0]} > ${title}`, tests };
  });
}
const cases = [];
for (const file of shipped.filter((f) => LOOPS.test(f))) cases.push(...declared(file, (await readFile(join(CORE, file))).toString("utf8")));
if (!cases.length) throw new Error("the delivered loops declare no case");

writeFileSync(join(CORE, MANIFEST), `${JSON.stringify({ files, cases }, null, 2)}\n`);
