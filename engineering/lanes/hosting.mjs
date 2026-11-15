// The Hosting test lane with evidence: Hosting's own tests, run once, with its
// coverage evidence captured under <dir> as they run (see evidence.mjs). The
// Hosting lane without evidence is `npm test -w @kaihacksai/kaal-hosting`, on every
// supported OS; this captures on whichever host runs it, and says which.
//
// Usage: hosting.mjs --evidence <dir>
import { resolve } from "node:path";
import { evidenceDir, lane } from "./evidence.mjs";

const USAGE = "usage: hosting.mjs --evidence <dir>";
const dir = evidenceDir(process.argv.slice(2), USAGE);
if (dir === undefined) {
  console.error(USAGE);
  process.exit(2);
}
if (!(await lane(["@kaihacksai/kaal-hosting"], resolve(dir)))) process.exit(1);
