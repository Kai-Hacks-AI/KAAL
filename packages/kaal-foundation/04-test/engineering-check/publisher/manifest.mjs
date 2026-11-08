// foundation/A8: writes 04-test/package-check/verify.json (foundation/F11, foundation/F13). Not shipped.
// The file list is npm's own pack list. Every digest is Foundation's own sha256: Foundation eats its
// own dogfood, and every installation checks the result with the host's SHA-256 (foundation/N10).
// Cases come from the delivered titles in the Case files beside their Nodes (04-test/package-check/collect.mjs finds them); a title in any other form is refused.
// With --check it writes nothing and fails when the committed manifest is not what it would write.
// npm runs as its CLI script under this Node (npm_execpath); no shell, no platform decision (foundation/N7).
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { collect, DIST_LOOPS } from "../../package-check/collect.mjs";
import { sha256 } from "../../../05-src/skills/kaal-foundation/scripts/sha256.mjs";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const OUT = "dist/test/package-check/verify.json";
const SOURCE_OUT = "04-test/package-check/verify.json";
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

/** The delivered cases, in path and title order: every `test(` call must carry a well-formed title. */
function cases() {
  const out = [];
  for (const f of collect(join(PACKAGE, "dist"), DIST_LOOPS)) {
    const text = readFileSync(join(PACKAGE, "dist", f), "utf8");
    const calls = [...text.matchAll(/\btest\(/g)].length;
    const titled = [...text.matchAll(TITLE)].map((m) => ({ id: m[1], tests: m[2].split(",").map((t) => t.trim()) }));
    if (titled.length !== calls) throw new Error(`${f}: every test( needs a title "foundation/T<n> [<targets>]: <what it checks>"`);
    out.push(...titled);
  }
  const ids = out.map((c) => c.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error(`duplicate case names: ${dup.join(", ")}`);
  if (!out.length) throw new Error("no delivered Case sits beside a Node");
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
      committed = readFileSync(join(PACKAGE, SOURCE_OUT), "utf8");
    } catch {
      // Missing: stale.
    }
    if (committed !== text) {
      console.error(`${SOURCE_OUT} is stale: run npm run manifest -w @kaihacksai/kaal-foundation`);
      process.exit(1);
    }
    console.log(`${SOURCE_OUT} is current`);
  } else {
    writeFileSync(join(PACKAGE, SOURCE_OUT), text);
    console.log(`wrote ${SOURCE_OUT}`);
  }
}
