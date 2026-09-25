import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { ROOT } from "../skills/using-brain/scripts/brain.js";
import { sealStateChanges } from "./brain-seals.js";

// Run on every change: refuses one that touches seal state compared with <base>.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [base] = process.argv.slice(2);
  if (!base) {
    console.error("usage: seal-guard.ts <base>");
    process.exitCode = 2;
  } else {
    const diff = execFileSync("git", ["diff", "--name-status", "--no-renames", `${base}...HEAD`, "--", ROOT], {
      encoding: "utf8",
    });
    const errors = sealStateChanges(diff);
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    }
  }
}
