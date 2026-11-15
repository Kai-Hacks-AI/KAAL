// Consumer harness for review/F24 and review/T292: receives the packed product the way a consumer does, outside the workspace,
// and exercises what Review declares. Expectations come from the product itself (its manifest, its skills/ and payload/), not from constants.
import { mkdtempSync, readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { createRequire, builtinModules } from "node:module";
import { bootstrap, catalog, loadEngine, readContribution, register } from "kaal-core";
import { identify } from "kaal-graph";
import { execute } from "@kaihacksai/kaal-hosting";

const KAAL = /^(@kaihacksai\/)?kaal-[a-z][a-z-]*$/;
const SOURCE = /\.(?:[cm]?js|ts)$/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

function packageName(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function importsOf(text) {
  const found = new Set();
  for (const m of text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)["']([^"']+)["']/g)) found.add(m[1]);
  return [...found];
}

function loadSkill(dir, name) {
  const file = join(dir, "SKILL.md");
  if (!existsSync(file)) return { name, loads: false, problem: "no SKILL.md" };
  const head = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!head) return { name, loads: false, problem: "no front matter" };
  const field = (k) => head[1].match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1].trim();
  if (field("name") !== name) return { name, loads: false, problem: `front matter name ${field("name")} is not the directory name` };
  if (!field("description")) return { name, loads: false, problem: "no description" };
  return { name, loads: true, problem: "" };
}

export async function consume(packageDir, { permitted }) {
  const work = mkdtempSync(join(tmpdir(), "kaal-consumer-"));
  const packed = await execute("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", work], { cwd: packageDir });
  if (packed.status !== 0) throw new Error(`npm pack failed: ${packed.stderr}`);
  const tarball = JSON.parse(packed.stdout)[0].filename;
  const unpacked = join(work, "unpacked");
  await execute("node", ["-e", "require('node:fs').mkdirSync(process.argv[1])", unpacked], { cwd: work });
  const untar = await execute("tar", ["-xzf", join(work, tarball), "-C", unpacked], { cwd: work });
  if (untar.status !== 0) throw new Error(`extracting the tarball failed: ${untar.stderr}`);
  const product = join(unpacked, "package");

  // The environment holds the extracted product and whatever it installs beside it: nothing but the permitted packages may be a KAAL package.
  const present = [];
  const modules = join(product, "node_modules");
  if (existsSync(modules)) for (const e of readdirSync(modules)) {
    const names = e.startsWith("@") ? readdirSync(join(modules, e)).map((n) => `${e}/${n}`) : [e];
    present.push(...names.filter((n) => KAAL.test(n)));
  }
  const manifest = JSON.parse(readFileSync(join(product, "package.json"), "utf8"));
  const outsideWorkspace = relative(packageDir, product).startsWith("..") && !existsSync(join(work, "package.json"));

  const skillsDir = join(product, "skills");
  const skills = existsSync(skillsDir) ? readdirSync(skillsDir).filter((n) => statSync(join(skillsDir, n)).isDirectory()).map((n) => loadSkill(join(skillsDir, n), n)) : [];

  // The Nodes the product declares are registered into a fresh Engine from the extracted copy alone.
  const payload = join(product, "payload");
  const declared = existsSync(payload) ? readdirSync(payload).filter((f) => f.endsWith(".md")).map((f) => identify(readFileSync(join(payload, f))).id) : [];
  const engine = join(work, "engine");
  await bootstrap(engine);
  const before = new Set((await loadEngine(engine)).nodes.map((n) => n.id));
  if (declared.length > 0) await register(engine, "skill", manifest.name, await readContribution(payload));
  const listed = (await loadEngine(engine)).nodes.map((n) => n.id).filter((id) => !before.has(id));
  await catalog(engine);

  // Runtime closure: what the manifest declares and what shipped source imports must resolve here, and only to permitted packages.
  const needed = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {}), ...Object.keys(manifest.optionalDependencies ?? {})]);
  for (const file of walk(product)) if (!file.includes(`${sep}node_modules${sep}`) && SOURCE.test(file)) {
    for (const s of importsOf(readFileSync(file, "utf8"))) if (!s.startsWith(".") && !s.startsWith("/")) needed.add(s.startsWith("node:") ? s : packageName(s));
  }
  const require = createRequire(join(product, "package.json"));
  const external = [...needed].filter((n) => !n.startsWith("node:") && !builtinModules.includes(n));
  const unresolved = external.filter((n) => {
    if (permitted.includes(n)) return false;
    try { require.resolve(n); return false; } catch { return true; }
  });
  const notPermitted = external.filter((n) => KAAL.test(n) && !permitted.includes(n));

  return {
    outsideWorkspace,
    otherKaalPackagesPresent: present.filter((n) => !permitted.includes(n)),
    skills,
    nodes: { declared, listed },
    closure: { unresolved, notPermitted },
    packed: [...walk(product)].map((f) => relative(product, f).split(sep).join("/")).sort(),
  };
}
