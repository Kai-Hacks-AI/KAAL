// ARTIST: Agent Requirements Tracing Implements Systematic Trail (engineering/case-graph/PLAN.md).
// Reads a capability package and computes its Case graph: which branch of the Architecture each Case verifies, and so whether
// it ships. It only reads the package: no Case is imported or run. YAML is parsed here and nowhere in a capability (R8).
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parse } from "yaml";

const SKIP = new Set(["00-changes", "node_modules", "dist", ".git"]);
const ELEMENT = /^\s*- \*\*([\w-]+)\/([A-Z]+)(\d+)\*\*(?: \[([^\]]*)\])?/;
const TITLE_LINE = /^\s*(?:test|it)\(\s*["'`]/;
const TITLE = /^\s*(?:test|it)\(\s*(["'`])([\w-]+\/(?:T\d+|TX-[\w-]+))(?: \[([^\]]+)\])?:/;
const FRONT = /^\/\*---\n([\s\S]*?)\n---\*\//;
const SECTIONS = { Solution: "solution", Delivery: "delivery", "Cross-cutting": "cross-cutting" };

export class Refusal extends Error {}
const refuse = (message) => {
  throw new Refusal(message);
};

/** Every file under root (relative, forward slashes, sorted) outside the skipped folders, with the given suffixes. */
export function walk(root, suffixes) {
  const out = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (SKIP.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (suffixes.some((s) => entry.name.endsWith(s))) out.push(relative(root, path).split(sep).join("/"));
    }
  };
  visit(root);
  return out;
}

const ids = (text) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** The Nodes of the package: every `- **<cap>/<letter><n>** [<ids>]` line of its Markdown, with the ids it answers. */
export function readNodes(root) {
  const nodes = new Map();
  for (const file of walk(root, [".md"])) {
    for (const line of readFileSync(join(root, file), "utf8").split("\n")) {
      const m = ELEMENT.exec(line);
      if (!m) continue;
      const id = `${m[1]}/${m[2]}${m[3]}`;
      if (!nodes.has(id)) nodes.set(id, { id, kind: m[2], cap: m[1], file, answers: ids(m[4] ?? "") });
    }
  }
  return nodes;
}

/** The Architecture: each element's branch (`solution` or `delivery`) and the ids it answers; the cross-cutting entries answer in both. */
export function readArchitecture(root) {
  const text = readFileSync(join(root, "03-architecture/architecture.md"), "utf8");
  let section = null;
  const elements = new Map();
  const cross = new Set();
  for (const line of text.split("\n")) {
    const h = /^## (.+?)\s*$/.exec(line);
    if (h) section = SECTIONS[h[1]] ?? null;
    else if (/^### /.test(line)) continue;
    const m = ELEMENT.exec(line);
    if (!m || section === null) continue;
    const id = `${m[1]}/${m[2]}${m[3]}`;
    if (section === "cross-cutting") {
      cross.add(id);
      continue;
    }
    if (m[2] !== "A") continue;
    if (elements.has(id)) refuse(`architecture: duplicate element ${id}`);
    elements.set(id, { id, branch: section, answers: ids(m[4] ?? "") });
  }
  if (elements.size === 0) refuse("architecture: no element in ## Solution or ## Delivery");
  return { elements, cross };
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

/** One Case file: its YAML front matter (`tests`, optionally `runs: external`) and its Cases, from the titles. */
export function readCaseFile(root, file) {
  const text = readFileSync(join(root, file), "utf8");
  const m = FRONT.exec(text);
  if (!m) refuse(`${file}: no front matter (a leading /*--- ... ---*/ block)`);
  let front;
  try {
    front = parse(m[1]);
  } catch (error) {
    refuse(`${file}: invalid front matter: ${error.message.split("\n")[0]}`);
  }
  if (front === null || typeof front !== "object" || Array.isArray(front)) refuse(`${file}: front matter is not a mapping`);
  for (const key of Object.keys(front)) {
    if (key === "ships") refuse(`${file}: front matter carries ships; shipping is computed from the Architecture, never written`);
    if (key !== "tests" && key !== "runs") refuse(`${file}: unknown front matter key ${key}`);
  }
  if (!Array.isArray(front.tests) || front.tests.length === 0 || !front.tests.every((t) => typeof t === "string" && t.trim() !== "")) {
    refuse(`${file}: tests must be a non-empty list of Node ids`);
  }
  if (front.runs !== undefined && front.runs !== "external") refuse(`${file}: runs may only be external`);
  const cases = [];
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    if (!TITLE_LINE.test(line)) return;
    const t = TITLE.exec(line);
    if (!t) refuse(`${file}:${i + 1}: a Case title must be "<cap>/T<n> [<targets>]: ..."`);
    if (t[1] === "`" && line.includes("${")) refuse(`${file}:${i + 1}: a generated (template) Case title`);
    if (!t[3]) refuse(`${file}:${i + 1}: Case ${t[2]} names no target`);
    cases.push({ id: t[2], file, targets: ids(t[3]) });
  });
  if (cases.length === 0) refuse(`${file}: no Case title found`);
  const union = [...new Set(cases.flatMap((c) => c.targets))];
  if (!sameSet(union, front.tests.map((t) => t.trim()))) {
    refuse(`${file}: tests is not exactly the union of its Cases' targets (tests: ${front.tests.join(", ")}; titles: ${union.join(", ")})`);
  }
  return { file, runsExternal: front.runs === "external", cases };
}

/** The branch of one Case, from Architecture alone. */
function branchOf(testCase, architecture, nodes) {
  const named = testCase.targets.filter((t) => architecture.elements.has(t));
  const answering = (id, branch) => [...architecture.elements.values()].some((e) => e.branch === branch && (e.id === id || e.answers.includes(id)));
  for (const t of testCase.targets) if (!nodes.has(t)) refuse(`${testCase.id}: ${t} is no Node of this package`);
  if (named.length > 0) {
    const branches = new Set(named.map((n) => architecture.elements.get(n).branch));
    if (branches.size > 1) refuse(`${testCase.id}: names elements of both branches (${named.join(", ")})`);
    const [branch] = branches;
    for (const t of testCase.targets) {
      if (!answering(t, branch)) refuse(`${testCase.id}: ${t} is not answered by any ${branch} element, so the named element cannot place it`);
    }
    return branch;
  }
  const seen = new Set();
  for (const t of testCase.targets) {
    const inSolution = answering(t, "solution");
    const inDelivery = answering(t, "delivery");
    if (!inSolution && !inDelivery) refuse(`${testCase.id}: ${t} is answered by no Architecture element`);
    if (inSolution && inDelivery) refuse(`${testCase.id}: ${t} is answered in both branches; name the Architecture element it verifies, or split the Case`);
    seen.add(inSolution ? "solution" : "delivery");
  }
  if (seen.size > 1) refuse(`${testCase.id}: its targets are answered in both branches; split the Case`);
  return [...seen][0];
}

/** The computed graph of a package. Throws a Refusal and returns nothing when the package does not hold together. */
export function compute(root) {
  const nodes = readNodes(root);
  const architecture = readArchitecture(root);
  const files = walk(root, [".test.mjs", ".test.ts"]);
  const parsed = files.map((f) => readCaseFile(root, f));
  const seen = new Set();
  const graph = { files: {}, cases: [] };
  for (const file of parsed) {
    const entries = file.cases.map((c) => ({ id: c.id, file: c.file, targets: c.targets, branch: branchOf(c, architecture, nodes) }));
    for (const entry of entries) {
      if (seen.has(entry.id)) refuse(`${entry.id}: duplicate Case id`);
      seen.add(entry.id);
    }
    const branches = new Set(entries.map((e) => e.branch));
    if (branches.size > 1) refuse(`${file.file}: its Cases are not all of one branch (the file ships or does not)`);
    const ships = entries[0].branch === "solution";
    if (ships && file.runsExternal) refuse(`${file.file}: runs: external on a Case file that ships`);
    graph.files[file.file] = { ships, runs: ships ? "shipped" : file.runsExternal ? "external" : "collector", cases: entries.map((e) => e.id) };
    for (const e of entries) graph.cases.push({ id: e.id, file: e.file, targets: e.targets, branch: e.branch, ships });
  }
  return graph;
}

/** The traceability coverage gaps (R9): observations, never a verdict. */
export function untraced(root, graph) {
  const nodes = readNodes(root);
  const architecture = readArchitecture(root);
  const answeredBy = (kind, id) => [...nodes.values()].some((n) => n.kind === kind && n.answers.includes(id));
  const out = { intents: [], requirements: [], defects: [], uncovered: [] };
  for (const n of nodes.values()) {
    if (n.kind === "I" && !answeredBy("F", n.id) && !answeredBy("N", n.id)) out.intents.push(n.id);
    if ((n.kind === "F" || n.kind === "N") && !architecture.elements.has(n.id) && ![...architecture.elements.values()].some((e) => e.answers.includes(n.id))) out.requirements.push(n.id);
    if (n.kind === "D" && !n.answers.some((a) => architecture.elements.has(a))) out.defects.push(n.id);
  }
  const reached = new Set();
  const reach = (id) => {
    if (reached.has(id)) return;
    reached.add(id);
    for (const a of architecture.elements.get(id)?.answers ?? nodes.get(id)?.answers ?? []) reach(a);
  };
  for (const c of graph.cases) c.targets.forEach(reach);
  for (const n of nodes.values()) if (!reached.has(n.id)) out.uncovered.push(n.id);
  for (const key of Object.keys(out)) out[key].sort();
  return out;
}

export const render = (graph) => `${JSON.stringify(graph, null, 2)}\n`;
