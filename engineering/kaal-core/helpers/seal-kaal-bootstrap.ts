// seal-kaal-bootstrap <Node name>
// Seals one newly born Node, recording only its admission. Run once per birth,
// in dependency order: create the Node, seal it, then use its ID downstream.
import { sealNode } from "./bootstrap.js";

const [name, ...extra] = process.argv.slice(2);
if (!name || extra.length > 0) {
  console.error("usage: seal-kaal-bootstrap <Node name>");
  process.exit(2);
}
try {
  console.log(`${name} ${sealNode(name)}`);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
