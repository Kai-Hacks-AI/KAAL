// Build output for the shipped package (packaging/A12): docs/intent, requirements, architecture and
// testing, assembled from the PLANs under plan/, and test/verify.json, the shipped manifest of
// packaging/F11 and F13, written from npm's own pack list, as Core and Guard write theirs. With
// --check it writes nothing and exits 1 when any output is not what it would write.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { execute } from "kaal-hosting";

export const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PLANS = ["measurement", "package", "capability"];
const TITLES = { intent: "Intent", requirements: "Requirements", architecture: "Architecture", testing: "Testing" };

/** The npm this run was started with: npm's own script under this Node, else npm by name through Hosting. */
const npm = (args, cwd) => (process.env.npm_execpath ? execute(process.execPath, [process.env.npm_execpath, ...args], { cwd }) : execute("npm", args, { cwd }));

/** One shipped document, assembled from each PLAN's document of that kind, in order. */
export function document(kind) {
  const parts = PLANS.map((plan) => {
    const text = readFileSync(join(PACKAGE, "plan", plan, `${kind}.md`), "utf8").replace(/\r\n/g, "\n").trim();
    return text.replace(/^# .*\n/, `## ${plan[0].toUpperCase()}${plan.slice(1)}\n`).replace(/^(#{2,}) /gm, (m, h, i) => (i === 0 ? m : `#${h} `));
  });
  return `# kaal-packaging: ${TITLES[kind]}\n\nAssembled from the PLANs under \`plan/\` by \`test/publisher/build.mjs\`; edit those, not this file.\n\n${parts.join("\n\n")}\n`;
}

/** The shipped manifest: every packed file but itself with its SHA-256, the Embedded cases, and their Testing model. */
export async function manifest(docs) {
  const r = await npm(["pack", "--dry-run", "--json", "--ignore-scripts"], PACKAGE);
  if (r.status !== 0) throw new Error(`npm pack --dry-run exited ${r.status}: ${r.stderr}`);
  const listed = JSON.parse(r.stdout)[0].files.map((f) => f.path).filter((p) => p !== "test/verify.json").sort();
  const { cases } = await import(pathToFileURL(join(PACKAGE, "test", "embed", "cases.mjs")).href);
  const bytes = (p) => (p in docs ? Buffer.from(docs[p]) : readFileSync(join(PACKAGE, p)));
  return `${JSON.stringify(
    {
      files: Object.fromEntries(listed.map((p) => [p, sha256(bytes(p))])),
      cases: cases.map((c) => c.id),
      model: { cases: cases.map(({ id, tests }) => ({ id, tests })) },
    },
    null,
    2,
  )}\n`;
}

/** Every output, by path under the package. */
export async function outputs() {
  const docs = Object.fromEntries(Object.keys(TITLES).map((k) => [`docs/${k}.md`, document(k)]));
  return { ...docs, "test/verify.json": await manifest(docs) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes("--check");
  const stale = [];
  for (const [path, text] of Object.entries(await outputs())) {
    let current = null;
    try {
      current = readFileSync(join(PACKAGE, path), "utf8");
    } catch {
      current = null;
    }
    if (current === text) continue;
    if (check) stale.push(path);
    else writeFileSync(join(PACKAGE, path), text);
  }
  for (const p of stale) console.log(`stale: ${p}`);
  process.exitCode = stale.length ? 1 : 0;
}
