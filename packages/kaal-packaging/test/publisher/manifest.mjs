// Writes test/verify.json, Packaging's shipped manifest (packaging/F11, packaging/F13, packaging/A12).
// It is build output: the files are npm's own pack list for this workspace, each with its SHA-256;
// the cases are the identifiers the Embedded case titles begin with; and the model is Testing's,
// Case —tests→ Target, from the identifiers each title names in brackets (testing/F25).
//
//   node test/publisher/manifest.mjs           writes test/verify.json
//   node test/publisher/manifest.mjs --check   exits 1, naming the difference, when it is stale
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { execute } from "kaal-hosting";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MANIFEST = "test/verify.json";

/** Each Embedded case, in order: its identifier and the identifiers its title says it tests. */
export function embedded(root = ROOT) {
  const dir = join(root, "test", "embed");
  const cases = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).sort()) {
    for (const m of readFileSync(join(dir, file), "utf8").matchAll(/\bit\(\s*"(packaging\/T\d+) \[([^\]]+)\]/g)) {
      cases.push({ id: m[1], tests: m[2].split(",").map((t) => t.trim()) });
    }
  }
  return cases.sort((a, b) => Number(a.id.slice("packaging/T".length)) - Number(b.id.slice("packaging/T".length)));
}

/** The paths npm would pack from this workspace, asked of npm itself through Hosting. */
async function packList(root) {
  const work = mkdtempSync(join(tmpdir(), "kaal-packaging-manifest-"));
  try {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts", "--offline", "--cache", join(work, "cache"), "--logs-max=0", "--no-update-notifier"], { cwd: root });
    if (r.status !== 0) throw new Error(`npm pack --dry-run exited ${r.status}: ${r.stderr}`);
    return JSON.parse(r.stdout)[0].files.map((f) => f.path);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/** The manifest as it should stand, as text. */
export async function manifest(root = ROOT) {
  const paths = (await packList(root)).filter((p) => p !== MANIFEST).sort();
  const files = Object.fromEntries(paths.map((p) => [p, sha256(readFileSync(join(root, p)))]));
  const cases = embedded(root);
  return `${JSON.stringify({ files, cases: cases.map((c) => c.id), model: { cases } }, null, 2)}\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const want = await manifest();
  const at = join(ROOT, MANIFEST);
  if (process.argv.includes("--check")) {
    let have = "";
    try {
      have = readFileSync(at, "utf8");
    } catch {
      // Missing: stale.
    }
    if (have !== want) {
      console.error(`${MANIFEST} is stale: run node test/publisher/manifest.mjs`);
      process.exit(1);
    }
  } else writeFileSync(at, want);
}
