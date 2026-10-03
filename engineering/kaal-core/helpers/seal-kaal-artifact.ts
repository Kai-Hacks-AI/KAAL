// seal-kaal-artifact <artifact> <seal-file | seal-dir/>
// Writes the SHA-256 seal of the artifact's exact bytes. Generic: it seals
// whatever it is given, the Kernel included.
import { writeSeal } from "./seal.js";

const [artifact, seal] = process.argv.slice(2);
if (!artifact || !seal) {
  console.error("usage: seal-kaal-artifact <artifact> <seal-file | seal-dir/>");
  process.exit(2);
}
console.log(writeSeal(artifact, seal));
