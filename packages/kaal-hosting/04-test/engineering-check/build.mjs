// Builds dist/, the only thing Hosting ships (hosting/C107, packaging/F42): the source in 05-src compiled into the
// skill's scripts, and every other shipped part a byte-for-byte copy of its numbered source folder. It is
// reproducible: the same source gives the same bytes, so building twice is equal.
//   node build.mjs [--out <dir>]   writes <dir>/dist (default: the package folder)
// It is Engineering tooling for this package, not a shipped script, and it needs only Node and the package's
// own TypeScript.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const at = process.argv.indexOf("--out");
const dist = join(at > 0 ? resolve(process.argv[at + 1]) : PACKAGE, "dist");
const scripts = join(dist, "skills/kaal-hosting/scripts");

rmSync(dist, { recursive: true, force: true });
mkdirSync(scripts, { recursive: true });

// tsconfig.json is composite so kaal-core can reference it; this build is not incremental, so a stale build-info file can never skip the emit into a dist/ that was just removed.
const tsc = createRequire(join(PACKAGE, "package.json")).resolve("typescript/bin/tsc");
const compiled = spawnSync(process.execPath, [tsc, "-p", join(PACKAGE, "tsconfig.json"), "--outDir", scripts, "--composite", "false"], { cwd: PACKAGE, stdio: "inherit" });
if (compiled.status !== 0) process.exit(compiled.status ?? 1);

/** [source folder or file in the package, where it lands under dist/] */
const COPIES = [
  ["05-src/AGENTS.md", "AGENTS.md"],
  ["05-src/skills/kaal-hosting/SKILL.md", "skills/kaal-hosting/SKILL.md"],
  ["05-src/skills/kaal-hosting/references", "skills/kaal-hosting/references"],
  ["05-src/skills/kaal-hosting/scripts/boundary-cli.mjs", "skills/kaal-hosting/scripts/boundary-cli.mjs"],
  ["01-intent", "docs/intent"],
  ["02-requirements", "docs/requirements"],
  ["03-architecture", "docs/architecture"],
  ["06-defects", "docs/defects"],
  ["kaal", "kaal"],
  ["04-test/package-check", "test/package-check"],
  ["04-test/boundary-check", "test/boundary-check"]
];
for (const [from, to] of COPIES) {
  const source = join(PACKAGE, from);
  if (!existsSync(source)) continue;
  mkdirSync(dirname(join(dist, to)), { recursive: true });
  cpSync(source, join(dist, to), { recursive: true });
}
