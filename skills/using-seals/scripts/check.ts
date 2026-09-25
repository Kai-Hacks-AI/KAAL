import { pathToFileURL } from "node:url";
import { checkChain } from "./seals.js";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [root, ...units] = process.argv.slice(2);
  if (!root || !units.length) {
    console.error("usage: check.ts <root> <unit>... (units oldest first, one chain)");
    process.exitCode = 2;
  } else {
    const errors = checkChain(root, units);
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    }
  }
}
