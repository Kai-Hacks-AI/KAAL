import { pathToFileURL } from "node:url";
import { ROOT } from "../skills/using-brain/scripts/brain.js";
import { brainErrors } from "./brain-seals.js";

// Checks a BRAIN, by default this repository's, that sealing would accept: it
// is valid and every sealed learning is intact. CI passes a change's BRAIN as
// <root>, so this code, never the change's, does the checking.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [root = ROOT] = process.argv.slice(2);
  const errors = brainErrors(root);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  }
}
