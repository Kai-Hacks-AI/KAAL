// kaal-core's build step for Graph's Node support (core/A38): copies Graph's Form and identity, byte for
// byte, from the workspace's kaal-graph into dist/node/, and writes dist/node/provenance.json with
// Graph's name and version and each copy's source and SHA-256. Graph is only a build-time devDependency.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DELIVERED = ["form.d.ts", "form.mjs", "node.d.ts", "node.mjs"];
const SCRIPTS = "skills/kaal-graph/scripts";

const core = JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
const name = Object.keys(core.devDependencies ?? {}).find((n) => /^(@kaihacksai\/)?kaal-graph$/.test(n));
if (!name) throw new Error("kaal-core's devDependencies name no Graph package to deliver Node support from");
const graph = dirname(createRequire(join(CORE, "package.json")).resolve(`${name}/package.json`));
const { version } = JSON.parse(readFileSync(join(graph, "package.json"), "utf8"));
if (version !== core.devDependencies[name]) throw new Error(`kaal-core pins ${name}@${core.devDependencies[name]}, but the workspace holds ${version}`);

const out = join(CORE, "dist", "node");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const files = {};
for (const file of DELIVERED) {
  const from = `${SCRIPTS}/${file}`;
  const bytes = readFileSync(join(graph, from));
  writeFileSync(join(out, file), bytes);
  files[file] = { from, sha256: createHash("sha256").update(bytes).digest("hex") };
}
writeFileSync(join(out, "provenance.json"), `${JSON.stringify({ name, version, files }, null, 2)}\n`);
