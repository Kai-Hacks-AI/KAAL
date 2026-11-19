// Case hosting/T263 tests: hosting/A38 (placement and the declared interface)
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PACKAGE, SCRIPTS, load } from "./fixtures.mjs";

export const id = "hosting/T263";
export const tests = ["hosting/A38"];
export const title = "readRevision and revision are exported from the main entry, the command is built, declared in bin and in the Architecture's interface table, and the three error codes join HostingError's";
export async function run() {
  const h = await load();
  assert.equal(typeof h.readRevision, "function", "readRevision is not exported from the main entry");
  assert.equal(typeof h.revision, "function", "revision is not exported from the main entry");
  assert.ok(existsSync(join(PACKAGE, "05-src/skills/kaal-hosting/scripts/revision.ts")), "revision.ts is absent");
  assert.ok(existsSync(join(SCRIPTS, "revision-cli.mjs")), "the command is not built into dist");
  const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  assert.equal(manifest.bin?.["kaal-hosting-revision"], "dist/skills/kaal-hosting/scripts/revision-cli.mjs", "the command is not declared in bin");
  const architecture = readFileSync(join(PACKAGE, "03-architecture/architecture.md"), "utf8");
  const table = /<!-- kaal-hosting:interface -->([\s\S]*?)<!-- \/kaal-hosting:interface -->/.exec(architecture)?.[1] ?? "";
  assert.match(table, /\| bin \| `kaal-hosting-revision` \| `dist\/skills\/kaal-hosting\/scripts\/revision-cli\.mjs` \| delivered \|/, "the interface table does not declare the command");
  assert.match(architecture, /\*\*hosting\/A38\*\*/, "hosting/A38 is absent");
  const source = readFileSync(join(PACKAGE, "05-src/skills/kaal-hosting/scripts/index.ts"), "utf8");
  for (const code of ["REVISION_NOT_FOUND", "REVISION_UNREADABLE", "REVISION_ENTRY"]) assert.ok(source.includes(`"${code}"`), `${code} is not a HostingError code`);
}
