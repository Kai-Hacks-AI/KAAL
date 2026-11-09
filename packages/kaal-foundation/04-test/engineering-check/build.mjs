// Builds dist/, the only thing Foundation ships (packaging/F42): every shipped part is a byte-for-byte
// copy of its numbered source folder, so building twice gives equal bytes. Foundation has no compiled
// source and no dependency.
//   node build.mjs [--out <dir>]   writes <dir>/dist (default: the package folder)
// It is Engineering tooling for this package, not a shipped script, and it needs only Node.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { caseFiles, readGraph } from "./cases.mjs";
import { fileURLToPath } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const at = process.argv.indexOf("--out");
const dist = join(at > 0 ? resolve(process.argv[at + 1]) : PACKAGE, "dist");
// What ships among the Cases is computed by Engineering and recorded in cases.json (foundation/F41, A23); this reads only that JSON.
const graph = readGraph(PACKAGE);
const hidden = new Set(Object.entries(graph.files).filter(([, f]) => !f.ships).map(([path]) => path));
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

/** [source folder or file in the package, where it lands under dist/] */
const COPIES = [
  ["05-src/AGENTS.md", "AGENTS.md"],
  ["05-src/skills", "skills"],
  ["01-intent", "docs/intent"],
  ["02-requirements", "docs/requirements"],
  ["03-architecture", "docs/architecture"],
  ["06-defects", "docs/defects"],
  ["kaal", "kaal"],
  ["04-test/package-check", "test/package-check"],
  ["04-test/boundary-check", "test/boundary-check"],
];
for (const [from, to] of COPIES) {
  const source = join(PACKAGE, from);
  if (!existsSync(source)) continue;
  mkdirSync(dirname(join(dist, to)), { recursive: true });
  // A Case file whose flag is ships: false (a Delivery or outer Case) never reaches dist/ (foundation/F41, A26).
  cpSync(source, join(dist, to), { recursive: true, filter: (src) => !hidden.has(relative(PACKAGE, src).split(sep).join("/")) });
}
