// Writes kaal-guard's shipped verification manifest, packages/kaal-guard/test/verify.json (guard/A18,
// guard/A19): the inventory of the delivered cases, outer and inner, as a run of them names them, the loop
// each belongs to, every product identifier with the cases that cover it, its allocation to the publisher's
// Engineering Test Plan or why no Test Case verifies it, the declared
// applicability, and the SHA-256 of every file npm packs except the manifest itself. First it writes the
// trace in the product's docs/testing.md from the cases' titles, so the trace never drifts from the cases.
// Run it after any Change to a shipped file, from the repository root: node engineering/guard/verify-manifest.mjs.
// guard/T101 is cannot verify until the manifest matches the package.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execute, files, MANIFEST, PACKAGE } from "../../packages/kaal-guard/test/verify.mjs";

const WINDOWS = process.platform === "win32";

delete process.env.NODE_TEST_CONTEXT;

const pack = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE, encoding: "utf8", shell: WINDOWS, maxBuffer: 64 * 1024 * 1024 });
if (pack.status !== 0) throw new Error(`npm pack --dry-run failed: ${pack.stderr}`);
const shipped = JSON.parse(pack.stdout)[0].files.map((f) => f.path).filter((f) => f !== MANIFEST).sort();
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

// The loops: each outer file is its own loop; every file in test/unit/ is the inner Code loop.
const OUTER = { "intent.test.mjs": "Intent", "requirements.test.mjs": "Requirements", "architecture.test.mjs": "Architecture" };
const caseFiles = (dir) => files(join(PACKAGE, dir)).filter((f) => f.endsWith(".test.mjs")).map((f) => `${dir}/${f}`);
const loops = { Intent: [], Requirements: [], Architecture: [], Code: caseFiles("test/unit") };
for (const file of caseFiles("test/acceptance")) {
  const loop = OUTER[file.split("/").pop()];
  if (!loop) throw new Error(`no loop is named for ${file}`);
  loops[loop].push(file);
}
const loopOf = (file) => Object.keys(loops).find((l) => loops[l].includes(file));

// The trace: one row per outer case, from its title "guard/T<n> [<ids>]: <what it checks>".
const rows = Object.entries(loops)
  .filter(([loop]) => loop !== "Code")
  .flatMap(([loop, list]) =>
    list.flatMap((file) =>
      [...readFileSync(join(PACKAGE, file), "utf8").matchAll(/\b(?:it|test)\(\s*"(guard\/T(\d+)) \[([^\]]*)\]: ([^"]*)"/g)].map((m) => ({
        n: Number(m[2]),
        row: `| ${m[1]} | ${loop} | ${m[3]} | ${m[4].replaceAll("|", "\\|")} |`,
      })),
    ),
  )
  .sort((a, b) => a.n - b.n);
const TESTING = join(PACKAGE, "docs", "testing.md");
/** The text between a marker that opens with `begin` and the one that opens with `end`. */
function section(text, begin, end) {
  const from = text.indexOf(begin);
  const to = text.indexOf(end, from);
  if (from < 0 || to < 0) throw new Error(`${TESTING} has no ${begin} … ${end} section`);
  return { from: text.indexOf("\n", from) + 1, to, body: text.slice(text.indexOf("\n", from) + 1, to) };
}
let testing = readFileSync(TESTING, "utf8");
const trace = section(testing, "<!-- trace:", "<!-- end of trace -->");
testing = `${testing.slice(0, trace.from)}${["| Case | Loop | Checks | What it checks |", "| --- | --- | --- | --- |", ...rows.map((r) => r.row)].join("\n")}\n${testing.slice(trace.to)}`;
writeFileSync(TESTING, testing);

/** The body rows of a Markdown table, as arrays of trimmed cells. */
const table = (body) =>
  body
    .split(/\r?\n/)
    .filter((l) => l.startsWith("|") && !/^\|\s*-/.test(l))
    .slice(1)
    .map((l) => l.slice(1, -1).split(/(?<!\\)\|/).map((c) => c.trim()));

/** "guard/F31–guard/F36" names six identifiers. */
const expand = (list) =>
  list.split(/,\s*/).flatMap((item) => {
    const m = /^guard\/([IFNA])(\d+)(?:–guard\/\1(\d+))?$/.exec(item);
    if (!m) throw new Error(`not an identifier or a range of them: ${item}`);
    const [a, b] = [Number(m[2]), Number(m[3] ?? m[2])];
    return Array.from({ length: b - a + 1 }, (_, i) => `guard/${m[1]}${a + i}`);
  });

// The product identifiers: those the product's docs define, in guard/A20's canonical form.
const DOCS = join(PACKAGE, "docs");
const identifiers = readdirSync(DOCS)
  .filter((f) => f.endsWith(".md"))
  .flatMap((f) => [...readFileSync(join(DOCS, f), "utf8").matchAll(/^(?:- )?\*\*(guard\/[IFNA]\d+)\b/gm)].map((m) => m[1]));
const order = (id) => ["I", "F", "N", "A"].indexOf(id[6]) * 1000 + Number(id.slice(7));
identifiers.sort((a, b) => order(a) - order(b));

/** An identifier → text map from a declared table, each identifier declared once across the tables. */
const declared = new Set();
function declarations(begin, end, what) {
  const out = {};
  for (const [, ids, text] of table(section(testing, begin, end).body)) {
    for (const id of expand(ids)) {
      if (declared.has(id)) throw new Error(`${id} is declared twice, the second time as ${what}`);
      declared.add(id);
      out[id] = text;
    }
  }
  return out;
}
const allocated = declarations("<!-- allocated:", "<!-- end of allocated -->", "allocated");
const unverified = declarations("<!-- unverified:", "<!-- end of unverified -->", "unverified");
const applicability = { cases: {}, identifiers: {} };
for (const [name, platforms, why] of table(section(testing, "<!-- applicability:", "<!-- end of applicability -->").body)) {
  applicability.cases[name.replace(/^`|`$/g, "")] = { notOn: platforms.split(/,\s*/), why };
}

const outcomes = await execute(Object.values(loops).flat().map((f) => join(PACKAGE, f)));
const notApplicableHere = (o) => o.status === "skipped" && applicability.cases[o.name]?.notOn.includes(process.platform);
const failed = outcomes.filter((o) => o.status !== "passed" && !notApplicableHere(o));
if (failed.length) throw new Error(`the delivered cases must all pass before their inventory is written: ${failed.map((o) => `${o.status}: ${o.name}`).join("; ")}`);
const cases = outcomes.map((o) => o.name).sort();
for (const name of Object.keys(applicability.cases)) if (!cases.includes(name)) throw new Error(`a case declared not applicable is not a delivered case: ${name}`);

// Coverage: the cases whose names cite an identifier, by loop.
const coverage = {};
for (const name of cases) {
  for (const id of new Set(name.match(/guard\/[IFNA]\d+/g) ?? [])) {
    const loop = loopOf(name.split(" > ")[0]);
    ((coverage[id] ??= {})[loop] ??= []).push(name);
  }
}
for (const id of Object.keys(coverage)) if (!identifiers.includes(id)) throw new Error(`a case cites ${id}, which the product's docs do not define`);
for (const id of declared) if (!identifiers.includes(id)) throw new Error(`${id} is allocated or unverified but the product's docs do not define it`);
const both = identifiers.filter((id) => id in coverage && declared.has(id));
if (both.length) throw new Error(`covered, and allocated or unverified, at once: ${both.join(", ")}`);
const neither = identifiers.filter((id) => !(id in coverage) && !declared.has(id));
if (neither.length) throw new Error(`neither covered by a delivered case, nor allocated, nor declared unverified: ${neither.join(", ")}`);

const manifest = {
  cases,
  loops,
  identifiers,
  coverage,
  allocated,
  unverified,
  applicability,
  files: Object.fromEntries(shipped.map((f) => [f, sha256(readFileSync(join(PACKAGE, f)))])),
};
writeFileSync(join(PACKAGE, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${MANIFEST}: ${cases.length} cases in ${Object.keys(loops).length} loops, ${identifiers.length} identifiers (${Object.keys(coverage).length} covered, ${Object.keys(allocated).length} allocated, ${Object.keys(unverified).length} unverified), ${shipped.length} files`);
