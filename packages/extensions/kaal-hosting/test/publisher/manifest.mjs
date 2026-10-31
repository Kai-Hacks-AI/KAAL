// Writes Hosting's shipped verification manifest, test/verify.json (hosting/A9, hosting/F22, hosting/F23,
// hosting/F25), when the publisher packs the package (`prepack`): the delivered cases as a run of them
// names them, every identifier docs/ defines with its coverage, allocation or lack of a Test Case, the
// declared applicability, and the SHA-256 of every other file npm packs. A case covers what its name
// cites; the allocated and unverified identifiers, and the applicability, come from the tables in
// docs/testing.md. It refuses to write a manifest while a delivered case fails, an identifier is
// accounted for twice or not at all, or a case cites what docs/ does not define. It does not ship.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cited, defined, execute, files, loopOf, MANIFEST, PACKAGE } from "../verify.mjs";

delete process.env.NODE_TEST_CONTEXT;
// The delivered cases run npm themselves; what this pack was asked to do is not theirs.
for (const k of Object.keys(process.env)) if (/^npm_config_(dry_run|json|pack_destination|ignore_scripts)$/i.test(k)) delete process.env[k];
const fail = (message) => {
  console.error(`${MANIFEST}: ${message}`);
  process.exit(1);
};

const pack = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE, encoding: "utf8", shell: process.platform === "win32", maxBuffer: 64 * 1024 * 1024 });
if (pack.status !== 0) fail(`npm pack --dry-run failed: ${pack.stderr}`);
const shipped = JSON.parse(pack.stdout)[0].files.map((f) => f.path.split("\\").join("/")).filter((f) => f !== MANIFEST).sort();

/** The rows of the table between `<!-- kaal-hosting:<marker> -->` and its closing marker in docs/testing.md. */
const testing = readFileSync(join(PACKAGE, "docs", "testing.md"), "utf8");
function table(marker) {
  const from = testing.indexOf(`<!-- kaal-hosting:${marker} -->`);
  const to = testing.indexOf(`<!-- /kaal-hosting:${marker} -->`);
  if (from < 0 || to < from) fail(`docs/testing.md has no ${marker} table`);
  return testing
    .slice(from, to)
    .split(/\r?\n/)
    .filter((l) => l.startsWith("|") && !/^\|\s*-/.test(l))
    .slice(1)
    .map((l) =>
      l
        .slice(1, -1)
        .split(/(?<!\\)\|/)
        .map((c) => c.trim().replace(/^`|`$/g, "")),
    );
}

const applicability = Object.fromEntries(table("applicability").map(([name, platforms]) => [name, platforms.split(/,\s*/)]));
const ids = defined();
const declared = new Map();
for (const [state, rows] of [["allocated", table("allocated")], ["unverified", table("unverified")]]) {
  for (const [list, text] of rows) {
    for (const id of cited(list)) {
      if (declared.has(id)) fail(`${id} is declared twice`);
      declared.set(id, { [state]: text });
    }
  }
}

const caseFiles = files(join(PACKAGE, "test", "embed")).filter((f) => f.endsWith(".test.mjs")).map((f) => `test/embed/${f}`);
for (const f of caseFiles) if (!loopOf(f)) fail(`${f} belongs to no loop`);
const outcomes = await execute(caseFiles.map((f) => join(PACKAGE, f)));
const bad = outcomes.filter((o) => o.outcome !== "pass" && !(o.outcome === "skipped" && applicability[o.name]?.includes(process.platform)));
if (bad.length) fail(`every delivered case must pass before its inventory is written: ${bad.map((o) => `${o.outcome}: ${o.name}${o.message ? ` (${o.message})` : ""}`).join("; ")}`);
const cases = outcomes.map((o) => o.name).sort();
for (const name of Object.keys(applicability)) if (!cases.includes(name)) fail(`a case declared not applicable is not a delivered case: ${name}`);

const coverage = {};
for (const name of cases) {
  for (const id of cited(name)) {
    if (!ids.includes(id)) fail(`${name} cites ${id}, which docs/ does not define`);
    const loop = loopOf(name.split(" > ")[0]);
    coverage[id] ??= { covered: [] };
    if (!coverage[id].covered.includes(loop)) coverage[id].covered.push(loop);
  }
}
for (const [id, entry] of declared) {
  if (!ids.includes(id)) fail(`${id} is allocated or unverified, but docs/ does not define it`);
  if (coverage[id]) fail(`${id} is covered by a delivered case and also ${Object.keys(entry)[0]}`);
  coverage[id] = entry;
}
const missing = ids.filter((id) => !coverage[id]);
if (missing.length) fail(`neither covered by a delivered case, nor allocated, nor declared unverified: ${missing.join(", ")}`);

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifest = {
  cases,
  coverage: Object.fromEntries(ids.map((id) => [id, coverage[id]])),
  applicability,
  hashes: Object.fromEntries(shipped.map((f) => [f, sha256(readFileSync(join(PACKAGE, f)))])),
};
writeFileSync(join(PACKAGE, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
const count = (state) => Object.values(coverage).filter((e) => state in e).length;
console.error(`${MANIFEST}: ${cases.length} cases, ${ids.length} identifiers (${count("covered")} covered, ${count("allocated")} allocated, ${count("unverified")} unverified), ${shipped.length} files`);
