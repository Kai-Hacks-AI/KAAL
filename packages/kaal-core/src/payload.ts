import { readFileSync, readdirSync, statSync } from "node:fs";

/** The KAAL artifacts this package carries, laid out as they deploy: the files are the authority. */
export const ARTIFACTS = new URL("../artifacts/", import.meta.url);

/**
 * The payload as files, keyed by path relative to the KAAL directory: the
 * Kernel (genesis), the Nodes, and one empty marker `seals/<ID>` per sealed
 * Node. Carried as found; nothing here authors an artifact.
 */
export function payload(): Record<string, string> {
  const files: Record<string, string> = {};
  for (const path of readdirSync(ARTIFACTS, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(new URL(path, ARTIFACTS)).isFile()) files[path.split("\\").join("/")] = readFileSync(new URL(path, ARTIFACTS), "utf8");
  }
  return files;
}
