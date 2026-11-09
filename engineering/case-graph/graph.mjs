// ARTIST: Agent Requirements Tracing Implements Systematic Trail (engineering/case-graph/PLAN.md).
// Reads a capability package and computes its Case graph: which branch of the Architecture each Case verifies, and so whether
// it ships. It only reads the package: no Case is imported or run. Nothing is read by pattern: Markdown goes through commonmark,
// Case files through the TypeScript parser, front matter through the yaml package. None of them is a dependency of a capability (R8).
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { Parser as MarkdownParser } from "commonmark";
import ts from "typescript";
import { parse } from "yaml";
import { frontMatter } from "../parsers/front-matter.mjs";

const SKIP = new Set(["00-changes", "node_modules", "dist", ".git"]);
const TITLE = /^([\w-]+\/(?:T\d+|TX-[\w-]+))(?: \[([^\]]+)\])?:/;
const NODE = /^([\w-]+)\/([A-Z]+)(\d+)(?: \[([^\]]*)\])?/;
const SECTIONS = { Solution: "solution", Delivery: "delivery" };

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

// A bracketed list of ids is a YAML flow sequence.
const ids = (text) => (parse(`[${text}]`) ?? []).map(String);

/** The text of a CommonMark node's inline content, with emphasis and code reduced to their text. */
function inlineText(node) {
  let out = "";
  for (let child = node.firstChild; child; child = child.next) {
    if (child.type === "softbreak" || child.type === "linebreak") out += " ";
    else if (child.literal !== null && child.literal !== undefined) out += child.literal;
    else out += inlineText(child);
  }
  return out;
}

/** The list items of a Markdown file that start with a Node id, in order, each with its `##` section: `- **<cap>/<letter><n>** [<ids>]`. */
export function readItems(text) {
  const out = [];
  const walker = new MarkdownParser().parse(text).walker();
  let section = null;
  for (let step = walker.next(); step; step = walker.next()) {
    const { node, entering } = step;
    if (!entering) continue;
    if (node.type === "heading" && node.level === 2) section = inlineText(node).trim();
    if (node.type !== "item" || node.firstChild?.type !== "paragraph") continue;
    const m = NODE.exec(inlineText(node.firstChild));
    if (m) out.push({ cap: m[1], kind: m[2], id: `${m[1]}/${m[2]}${m[3]}`, answers: ids(m[4] ?? ""), section });
  }
  return out;
}

/** The Nodes of the package: every list item of its Markdown that starts with a Node id, with the ids it answers. */
export function readNodes(root) {
  const nodes = new Map();
  for (const file of walk(root, [".md"])) {
    for (const item of readItems(readFileSync(join(root, file), "utf8"))) {
      if (!nodes.has(item.id)) nodes.set(item.id, { ...item, file });
    }
  }
  return nodes;
}

/** The Architecture: each element's branch (`solution` or `delivery`) and the ids it answers. */
export function readArchitecture(root) {
  const elements = new Map();
  for (const item of readItems(readFileSync(join(root, "03-architecture/architecture.md"), "utf8"))) {
    const branch = SECTIONS[item.section];
    if (item.kind !== "A" || (branch !== "solution" && branch !== "delivery")) continue;
    if (elements.has(item.id)) refuse(`architecture: duplicate element ${item.id}`);
    elements.set(item.id, { id: item.id, branch, answers: item.answers });
  }
  if (elements.size === 0) refuse("architecture: no element in ## Solution or ## Delivery");
  return { elements };
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

const CALLEE = new Set(["test", "it"]);
const MODIFIERS = new Set(["skip", "only", "todo"]);

/** One Case file: its YAML front matter (`tests`, optionally `runs: external`) and its Cases, from the calls of `test` or `it`. */
export function readCaseFile(root, file) {
  const text = readFileSync(join(root, file), "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".ts") ? ts.ScriptKind.TS : ts.ScriptKind.JS);
  const at = (node) => `${file}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`;
  const comment = ts.getLeadingCommentRanges(text, 0)?.find((range) => range.kind === ts.SyntaxKind.MultiLineCommentTrivia);
  const block = comment ? text.slice(comment.pos + 2, comment.end - 2) : "";
  const parsed = frontMatter(block.trimStart());
  if (!parsed) refuse(`${file}: no front matter (a leading /*--- ... ---*/ block)`);
  if (parsed.errors.length > 0) refuse(`${file}: invalid front matter: ${parsed.errors[0]}`);
  const front = parsed.value;
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
  const isTest = (node) => ts.isIdentifier(node) && CALLEE.has(node.text);
  const visit = (node) => {
    if (ts.isImportSpecifier(node) && node.propertyName && CALLEE.has(node.propertyName.text) && node.name.text !== node.propertyName.text) {
      refuse(`${at(node)}: ${node.propertyName.text} is imported under another name, so the Cases cannot be enumerated`);
    }
    if ((ts.isVariableDeclaration(node) && node.initializer && isTest(node.initializer)) || (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && isTest(node.right))) {
      refuse(`${at(node)}: test or it is assigned to another name, so the Cases cannot be enumerated`);
    }
    if (ts.isCallExpression(node)) {
      if (node.arguments.some(isTest)) refuse(`${at(node)}: test or it is passed as a value, so the Cases cannot be enumerated`);
      const callee = node.expression;
      const direct = isTest(callee) || (ts.isPropertyAccessExpression(callee) && isTest(callee.expression) && MODIFIERS.has(callee.name.text));
      if (direct) {
        const [title] = node.arguments;
        if (!title || !(ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title))) {
          refuse(`${at(node)}: the title of a Case must be a literal "<cap>/T<n> [<targets>]: ..." (a computed or template title cannot be enumerated)`);
        }
        const t = TITLE.exec(title.text);
        if (!t) refuse(`${at(node)}: a Case title must be "<cap>/T<n> [<targets>]: ..."; every test( or it( call must be a recognized Case`);
        if (!t[2]) refuse(`${at(node)}: Case ${t[1]} names no target`);
        cases.push({ id: t[1], file, targets: ids(t[2]) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
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
