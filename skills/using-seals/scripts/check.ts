import { pathToFileURL } from "node:url";
import { checkChain } from "./seals.js";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [root, chain, ...units] = process.argv.slice(2);
  if (!root || !chain || !units.length) {
    console.error("usage: check.ts <root> <chain> <unit>... (units oldest first)");
    process.exitCode = 2;
  } else {
    const errors = checkChain(root, chain, units);
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    }
  }
}
