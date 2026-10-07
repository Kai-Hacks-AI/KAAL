import { readFileSync, readdirSync, statSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);

/** The files under a directory of this package, keyed by path relative to it. */
function files(directory: string): Record<string, string> {
  const base = new URL(`${directory}/`, ROOT);
  const found: Record<string, string> = {};
  for (const path of readdirSync(base, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(new URL(path, base)).isFile()) found[path.split("\\").join("/")] = readFileSync(new URL(path, base), "utf8");
  }
  return found;
}

/**
 * What this capability delivers, as files. `kaal` is its KAAL contribution: its
 * Nodes, and their seals in `seals/`, keyed by path within the capability, as
 * kaal-core's `registerExtension()` takes it. It is an Extension: it delivers no
 * Agent Skill. Carried as found; nothing here authors a Node.
 */
export function payload(): { kaal: Record<string, string> } {
  return { kaal: files("kaal") };
}
