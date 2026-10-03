// Outer-loop Test Setup: write what `kaal-core` hands out through its public
// surface, `payload()`, to a temporary `root/[name]/...`. Nothing else; the
// helpers read it and the tests assert outcomes.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { payload } from "kaal-core";

/** `.kaal` is only the default name of the KAAL directory. */
export function deploy(name = ".kaal"): { dir: string; cleanup: () => void } {
  const root = mkdtempSync(join(tmpdir(), "kaal-outer-"));
  const dir = join(root, name);
  for (const [path, content] of Object.entries(payload())) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return { dir, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}
