// Reading installation records and other repository JSON through Hosting, shared by Agent
// Realization and Core's own lifecycle, which keep one Core record between them (core/A21).
// Internal to kaal-core: no entry point exports it.
import { join } from "node:path";
import { kind, readFile } from "kaal-hosting";
import { checkRecord, type InstallationRecord } from "./installation.js";
import { KaalError } from "./node.js";
import { sha256 } from "./sha256.js";

/** Findings as one line each. */
export const describe = (findings: { key: string | null; rule: string }[]) => findings.map((f) => `${f.key ?? "(document)"}: ${f.rule}`).join("; ");

/** The bytes at `path` under `root`, or `undefined` when nothing is there. */
export async function optional(root: string, path: string): Promise<Buffer | undefined> {
  const what = await kind(join(root, path));
  if (what === "missing") return undefined;
  if (what !== "file") throw new KaalError(`${path} is not a file`);
  return readFile(join(root, path));
}

/** `bytes` read as JSON, or a KaalError naming `path`. */
export function parse(path: string, bytes: Buffer): unknown {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new KaalError(`${path} is not JSON`);
  }
}

/** A record read through Hosting, refused unless it conforms (core/F38), or `undefined` when there is none. */
export async function readRecord(root: string, path: string): Promise<{ record: InstallationRecord | undefined; expect: string; bytes: Buffer | undefined }> {
  const bytes = await optional(root, path);
  if (bytes === undefined) return { record: undefined, expect: "absent", bytes };
  const value = parse(path, bytes);
  const findings = checkRecord(value);
  if (findings.length > 0) throw new KaalError(`${path} is not an installation record: ${describe(findings)}`);
  return { record: value as InstallationRecord, expect: sha256(bytes), bytes };
}

