// Acceptance setup: what the delivery is proven on. The KAAL directory is what
// kaal-core's public `payload()` deploys; the Node machinery is the one
// implementation kaal-core's registration uses, reached in the built package
// (not through its public API), so admission is never judged by a second copy.
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { payload } from "kaal-core";

// The types resolve from this file's location, the module from the built file's.
type Machinery = typeof import("../../../packages/kaal-core/dist/nodes.js");
const machinery: Machinery = await import(new URL("../../../../packages/kaal-core/dist/nodes.js", import.meta.url).href);
export const { admit } = machinery;

/** The repository root, and the capability's package within it. */
export const REPO = fileURLToPath(new URL("../../../../", import.meta.url));
export const CAPABILITY = "sealing";
export const PACKAGE = join(REPO, "packages", CAPABILITY);
export const SCRIPTS = join(PACKAGE, "skills", CAPABILITY, "scripts");

/** Files of a directory, keyed by path relative to it. */
export function read(dir: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    if (statSync(join(dir, path)).isFile()) files[path.split("\\").join("/")] = readFileSync(join(dir, path), "utf8");
  }
  return files;
}

/** A throwaway directory, removed by the test's cleanup. */
export function scratch(t: { after: (fn: () => void) => void }): string {
  const dir = mkdtempSync(join(tmpdir(), "sealing-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** A KAAL directory as kaal-core's payload deploys it. `.kaal` is only its default name. */
export function deployKaal(t: { after: (fn: () => void) => void }): string {
  const dir = join(scratch(t), ".kaal");
  for (const [path, content] of Object.entries(payload())) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return dir;
}

/** A throwaway repository holding only this capability's package, with its engineering directory present. */
export function repoCopy(t: { after: (fn: () => void) => void }): string {
  const root = scratch(t);
  for (const part of ["kaal", "skills"]) cpSync(join(PACKAGE, part), join(root, "packages", CAPABILITY, part), { recursive: true });
  mkdirSync(join(root, "engineering", CAPABILITY), { recursive: true });
  return root;
}
