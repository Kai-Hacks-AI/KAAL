import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { ROOT } from "./brain.js";
import { createSeal, isSealed, learnings, readSeal, sealPath } from "./seals.js";
import { validate } from "./validate.js";

/**
 * Seals every open learning, oldest first within each lineage, each chained to
 * the seal before it. Refuses to seal a BRAIN that does not validate. Returns
 * the learnings it sealed; sealing an already fully sealed BRAIN does nothing.
 */
export function seal(root = ROOT): string[] {
  const errors = validate(root);
  if (errors.length) throw new Error(`refusing to seal an invalid BRAIN:\n${errors.join("\n")}`);
  const sealed: string[] = [];
  for (const [lineage, keys] of learnings(root)) {
    let previous: string | null = null;
    for (const learning of keys) {
      if (isSealed(root, lineage, learning)) {
        previous = readSeal(root, lineage, learning).seal;
        continue;
      }
      const next = createSeal(root, lineage, learning, previous);
      // "wx" refuses to overwrite: seals are as immutable as the nodes they close.
      fs.writeFileSync(sealPath(root, lineage, learning), `${JSON.stringify(next, null, 2)}\n`, { flag: "wx" });
      sealed.push(`${lineage}/${learning}`);
      previous = next.seal;
    }
  }
  return sealed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    for (const learning of seal()) console.log(`sealed ${learning}`);
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}
