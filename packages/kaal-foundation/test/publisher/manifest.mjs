// foundation/A8: writes test/verify.json (foundation/F11, foundation/F13). Not shipped.
// The file list is npm's own pack list. Every digest is Foundation's own sha256: Foundation eats its
// own dogfood, and every installation checks the result with the host's SHA-256 (foundation/N10).
// Cases come from the delivered titles in test/embed/; a title in any other form is refused.
// With --check it writes nothing and fails when the committed manifest is not what it would write.
// npm runs as its CLI script under this Node (npm_execpath); no shell, no platform decision (foundation/N7).
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256 } from "../../lib/sha256.mjs";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = "test/verify.json";
const TITLE = /\btest\(\s*"(foundation\/T\d+) \[([^\]]+)\]: [^"]+"/g;

/** The files npm packs, as POSIX paths. */
function packed() {
  const cli = process.env.npm_execpath;
  if (!cli || !/\.[cm]?js$/.test(cli)) throw new Error("run through npm: npm_execpath names no npm CLI script");
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (/^npm_config_(dry_run|json|pack_destination|ignore_scripts)$/i.test(k)) delete env[k];
  const r = spawnSync(process.execPath, [cli, "pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE, encoding: "utf8", env });
  if (r.status !== 0) throw new Error(`npm pack --dry-run failed: ${r.stderr}`);
  return JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].files.map((f) => f.path).sort();
}

/** The delivered cases, in file and title order: every `test(` call must carry a well-formed title. */
function cases() {
  const dir = join(PACKAGE, "test", "embed");
  const out = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).sort()) {
    const text = readFileSync(join(dir, f), "utf8");
    const calls = [...text.matchAll(/\btest\(/g)].length;
    const titled = [...text.matchAll(TITLE)].map((m) => ({ id: m[1], tests: m[2].split(",").map((t) => t.trim()) }));
    if (titled.length !== calls) throw new Error(`test/embed/${f}: every test( needs a title "foundation/T<n> [<targets>]: <what it checks>"`);
    out.push(...titled);
  }
  const ids = out.map((c) => c.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error(`duplicate case names: ${dup.join(", ")}`);
  if (!out.length) throw new Error("test/embed/ holds no delivered case");
  return out;
}

export function build() {
  const files = {};
  for (const path of packed()) if (path !== OUT) files[path] = sha256(readFileSync(join(PACKAGE, path)));
  const delivered = cases();
  return JSON.stringify({ files, cases: delivered.map((c) => c.id), model: { cases: delivered } }, null, 2) + "\n";
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const text = build();
  if (process.argv.includes("--check")) {
    let committed = "";
    try {
      committed = readFileSync(join(PACKAGE, OUT), "utf8");
    } catch {
      // Missing: stale.
    }
    if (committed !== text) {
      console.error(`${OUT} is stale: run npm run manifest -w @kaihacksai/kaal-foundation`);
      process.exit(1);
    }
    console.log(`${OUT} is current`);
  } else {
    writeFileSync(join(PACKAGE, OUT), text);
    console.log(`wrote ${OUT}`);
  }
}
