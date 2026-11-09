// Reads the Case graph that Engineering computed (cases.json) and refuses anything that is not exactly the Case files on
// disk (foundation/F41, F42, N23). JSON only: Foundation has no parser and ships none. Delivery tooling, never shipped.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SKIP = new Set(["00-changes", "node_modules", "dist", ".git"]);

/** Every Case file of the package (relative POSIX paths): *.test.mjs or *.test.ts outside history, dependencies and output. */
export const caseFiles = (root, rel = "") =>
  readdirSync(join(root, rel), { withFileTypes: true }).flatMap((e) => {
    if (SKIP.has(e.name)) return [];
    const next = rel ? `${rel}/${e.name}` : e.name;
    return e.isDirectory() ? caseFiles(root, next) : /\.test\.(mjs|ts)$/.test(e.name) ? [next] : [];
  }).sort();

/** The computed graph, or a thrown reason: missing, unreadable, listing a missing file, missing a file on disk, or an id twice. */
export function readGraph(root) {
  const file = join(root, "04-test", "engineering-check", "cases.json");
  if (!existsSync(file)) throw new Error("no 04-test/engineering-check/cases.json: Engineering's Case graph computer writes it");
  const graph = JSON.parse(readFileSync(file, "utf8"));
  const listed = Object.keys(graph.files ?? {}).sort();
  const onDisk = caseFiles(root);
  const missing = listed.filter((f) => !onDisk.includes(f));
  const unlisted = onDisk.filter((f) => !listed.includes(f));
  if (missing.length || unlisted.length) throw new Error(`cases.json is not the Case files on disk: listed but missing ${JSON.stringify(missing)}, on disk but not listed ${JSON.stringify(unlisted)}`);
  const ids = listed.flatMap((f) => graph.files[f].cases);
  const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (twice.length) throw new Error(`a Case id is listed twice: ${JSON.stringify([...new Set(twice)])}`);
  return graph;
}
