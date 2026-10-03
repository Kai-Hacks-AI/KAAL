// seal-kaal-artifact <artifact> <seal-file | seal-dir/>
// Writes the SHA-256 seal of the artifact's exact bytes. Generic: it seals
// whatever it is given, the Kernel included.
import { resolve } from "node:path";
import { writeSeal } from "./seal.js";

// Relative paths are relative to where the command was run, not to this package.
const from = (path: string): string => resolve(process.env.INIT_CWD ?? process.cwd(), path) + (path.endsWith("/") ? "/" : "");

const [artifact, seal] = process.argv.slice(2);
if (!artifact || !seal) {
  console.error("usage: seal-kaal-artifact <artifact> <seal-file | seal-dir/>");
  process.exit(2);
}
console.log(writeSeal(from(artifact), from(seal)));
