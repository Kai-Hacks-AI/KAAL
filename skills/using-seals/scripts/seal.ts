import { pathToFileURL } from "node:url";
import { sealChain } from "./seals.js";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [root, ...units] = process.argv.slice(2);
  if (!root || !units.length) {
    console.error("usage: seal.ts <root> <unit>... (units oldest first, one chain)");
    process.exitCode = 2;
  } else {
    try {
      for (const unit of sealChain(root, units)) console.log(`sealed ${unit}`);
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      process.exitCode = 1;
    }
  }
}
