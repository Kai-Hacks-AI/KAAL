// kaal-core's build step for Graph's Node support (core/A38): copies Graph's Form and identity, byte for
// byte, from the workspace's kaal-graph into dist/node/, and writes dist/node/provenance.json with
// Graph's name and version and each copy's source and SHA-256. Graph is only a build-time devDependency.
// node.mjs's declarations are Graph's node.d.ts. While Graph's source holds none, they are selected from
// Graph's edges.d.ts: only its statements that declare what node.mjs exports when it runs, and the types
// those use, each kept as Graph wrote it (core/C38).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DELIVERED = ["form.d.ts", "form.mjs", "node.d.ts", "node.mjs"];
const SCRIPTS = "skills/kaal-graph/scripts";
const HEADER = "// node.mjs's declarations, selected by kaal-core's build from Graph's edges.d.ts (core/A38).\n";

const core = JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
const name = Object.keys(core.devDependencies ?? {}).find((n) => /^(@kaihacksai\/)?kaal-graph$/.test(n));
if (!name) throw new Error("kaal-core's devDependencies name no Graph package to deliver Node support from");
const graph = dirname(createRequire(join(CORE, "package.json")).resolve(`${name}/package.json`));
const { version } = JSON.parse(readFileSync(join(graph, "package.json"), "utf8"));
if (version !== core.devDependencies[name]) throw new Error(`kaal-core pins ${name}@${core.devDependencies[name]}, but the workspace holds ${version}`);

/** Graph's edges.d.ts, reduced to the statements that declare node.mjs's run-time exports and the types they use. */
async function select(edges, node) {
  const text = readFileSync(edges, "utf8");
  const runtime = new Set(Object.keys(await import(pathToFileURL(node).href)));
  const source = ts.createSourceFile("edges.d.ts", text, ts.ScriptTarget.Latest, true);
  const declared = new Map();
  for (const st of source.statements)
    if ((ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isClassDeclaration(st) || ts.isFunctionDeclaration(st)) && st.name) {
      declared.set(st.name.text, [...(declared.get(st.name.text) ?? []), st]);
    }
  const wanted = new Set(runtime);
  const kept = new Set();
  const used = (n, out) => {
    if (ts.isTypeReferenceNode(n) && ts.isIdentifier(n.typeName)) out.add(n.typeName.text);
    ts.forEachChild(n, (c) => used(c, out));
  };
  for (const queue = [...wanted]; queue.length; ) {
    for (const st of declared.get(queue.pop()) ?? []) {
      if (kept.has(st)) continue;
      kept.add(st);
      const refs = new Set();
      used(st, refs);
      for (const r of refs) if (!wanted.has(r)) (wanted.add(r), queue.push(r));
    }
  }
  const missing = [...runtime].filter((n) => !declared.has(n) && !source.statements.some((st) => ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause) && st.exportClause.elements.some((e) => e.name.text === n)));
  if (missing.length) throw new Error(`Graph's edges.d.ts declares no ${missing.join(", ")}, which node.mjs exports`);
  let out = "";
  for (const st of source.statements) {
    // Graph's file header describes edges.d.ts as a whole, so it gives way to this file's own.
    const from = st === source.statements[0] ? text.match(/^(?:\/\/[^\n]*\n)*\n*/)[0].length : st.getFullStart();
    if (kept.has(st)) {
      out += text.slice(from, st.getEnd());
      continue;
    }
    // A re-export keeps only names node.mjs exports when it runs; an import keeps only names the kept statements use.
    const clause = ts.isExportDeclaration(st) ? st.exportClause : ts.isImportDeclaration(st) ? st.importClause?.namedBindings : undefined;
    if (!clause || !(ts.isNamedExports(clause) || ts.isNamedImports(clause))) continue;
    const names = ts.isExportDeclaration(st) ? runtime : wanted;
    const elements = clause.elements.filter((e) => names.has(e.name.text));
    if (elements.length === 0) continue;
    out += `${text.slice(from, clause.getStart())}{ ${elements.map((e) => e.getText(source)).join(", ")} }${text.slice(clause.getEnd(), st.getEnd())}`;
  }
  return Buffer.from(`${HEADER}${out.replace(/^\n+/, "\n")}\n`);
}

const out = join(CORE, "dist", "node");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const split = existsSync(join(graph, SCRIPTS, "node.d.ts"));
const files = {};
for (const file of DELIVERED) {
  const selected = file === "node.d.ts" && !split;
  const from = `${SCRIPTS}/${selected ? "edges.d.ts" : file}`;
  const bytes = selected ? await select(join(graph, from), join(graph, SCRIPTS, "node.mjs")) : readFileSync(join(graph, from));
  writeFileSync(join(out, file), bytes);
  files[file] = { from, ...(selected ? { selected: true } : {}), sha256: createHash("sha256").update(bytes).digest("hex") };
}
writeFileSync(join(out, "provenance.json"), `${JSON.stringify({ name, version, files }, null, 2)}\n`);
