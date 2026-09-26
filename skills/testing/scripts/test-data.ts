// Loads named test data from ../test-data so test cases hold no data themselves.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA = fileURLToPath(new URL("../test-data/", import.meta.url));

/** Contents of an expected output file in test-data/expected. */
export function expected(name: string): string {
  return fs.readFileSync(path.join(DATA, "expected", `${name}.md`), "utf8");
}

/** A new, empty directory to create an anchor in. */
export function scratch(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "testing-anchor-"));
}
