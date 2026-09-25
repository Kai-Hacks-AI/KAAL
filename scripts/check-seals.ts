import { pathToFileURL } from "node:url";
import { checkBrain } from "./brain-seals.js";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = checkBrain();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  }
}
