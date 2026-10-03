import { createHash } from "node:crypto";

/** The seal of a Node: SHA-256, hex, of its exact bytes. No normalization. */
export function sealNode(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Where the seal of the Node at `nodePath` is deployed, relative to the KAAL directory. */
export function sealPath(nodePath: string): string {
  return `seals/${nodePath}.sha256`;
}

/** The Nodes of a payload: every file that is not a seal. */
export function nodePaths(files: Record<string, string>): string[] {
  return Object.keys(files).filter((path) => !path.startsWith("seals/"));
}
