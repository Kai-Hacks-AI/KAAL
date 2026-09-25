import { pathToFileURL } from "node:url";
import { sealBrain } from "./brain-seals.js";

// Run by sealing on main: closes every BRAIN learning not yet sealed.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    for (const learning of sealBrain()) console.log(`sealed ${learning}`);
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}
