// Core's meaning, proven from what is deployed and from Core's own text. The
// pins (the Kernel's SHA-256, the Nodes' names and IDs) are read from the
// sealed Core Node, never from the implementation: this is the independent
// reader's position. KAAL's definitions are found by Node type alone.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { payload } from "kaal-core";
import { checkBootstrap } from "../helpers/bootstrap.js";
import { readNodes, relationships, resolve, typedBy } from "../helpers/nodes.js";
import { sha256 } from "../helpers/seal.js";
import { deploy } from "./setup.js";

type Files = Record<string, string>;

/** What the Core Node says a conforming payload is; the problems with `files` against it. Empty means Core. */
function conforms(files: Files, coreText: string): string[] {
  const problems: string[] = [];
  const kernelSha = /SHA-256 of its exact bytes is ([0-9a-f]{64})/.exec(coreText)?.[1];
  const pins = [...coreText.matchAll(/^- (.+?) ([0-9a-f]{64})$/gm)].map(([, name, id]) => ({ name, id }));
  const body = Object.entries(files).filter(([p]) => !p.startsWith("seals/"));
  const framed = body.filter(([, t]) => t.startsWith("---\n"));
  const kernels = body.filter(([, t]) => !t.startsWith("---\n"));
  if (kernels.length !== 1) problems.push(`${kernels.length} files are not Nodes, not one Kernel`);
  else {
    if (sha256(kernels[0][1]) !== kernelSha) problems.push("the Kernel differs from the pinned bytes");
    if (!/^# Kernel\n/.test(kernels[0][1])) problems.push("the Kernel does not begin `# Kernel`");
  }
  const ids = framed.map(([, t]) => sha256(t));
  const names = framed.map(([, t]) => /^---\nname: (.+)\n/.exec(t)?.[1]);
  for (const pin of pins) {
    const at = ids.indexOf(pin.id);
    if (at < 0) problems.push(`${pin.name} is missing or its bytes differ`);
    else if (names[at] !== pin.name) problems.push(`${pin.id} is not named ${pin.name}`);
  }
  if (framed.length !== pins.length + 1) problems.push(`${framed.length} Nodes are carried, not ${pins.length + 1}`);
  const core = framed.filter(([, t]) => t === coreText);
  if (core.length !== 1) problems.push("the Node named Core is not the Core Node");
  const markers = Object.keys(files).filter((p) => p.startsWith("seals/"));
  for (const id of ids) if (files[`seals/${id}`] !== "") problems.push(`no empty admission record for ${id}`);
  for (const m of markers) if (!ids.includes(m.slice(6)) || files[m] !== "") problems.push(`${m} admits no carried Node or is not empty`);
  const lines = framed.flatMap(([, t]) => t.match(/^.+ [0-9a-f]{64} ->.*$/gm) ?? []);
  const coreId = sha256(coreText);
  const caseId = pins.find((p) => p.name === "CASE")?.id;
  const compId = pins.find((p) => p.name === "Component Of")?.id;
  if (lines.length !== 1 || lines[0] !== `Component Of ${compId} -> CASE ${caseId}`) problems.push("the one relationship is not Core Component Of CASE");
  if (!coreText.includes(lines[0] ?? "\0")) problems.push("the relationship is not declared by Core");
  if (files[`seals/${coreId}`] === undefined) problems.push("Core is not admitted");
  return problems;
}

const sealed = (files: Files, path: string, text: string): Files => ({ ...files, [path]: text });

test("conformance: the real payload satisfies Core as Core defines it, and every defect is refused", () => {
  const files = payload();
  const coreText = files["core/Core.md"];
  assert.deepEqual(conforms(files, coreText), []);
  assert.deepEqual(conforms(payload(), coreText), [], "asked twice, the same");
  const drop = (path: string): Files => Object.fromEntries(Object.entries(files).filter(([p]) => p !== path));
  const defects: Record<string, Files> = {
    "Kernel changed": sealed(files, "core/KERNEL.md", files["core/KERNEL.md"] + " "),
    "Kernel missing": drop("core/KERNEL.md"),
    "Node byte changed": sealed(files, "core/Node.md", files["core/Node.md"] + " "),
    "CASE byte changed": sealed(files, "core/CASE.md", files["core/CASE.md"] + " "),
    "Node missing": drop("core/Node.md"),
    "Component Of missing": drop("core/Component-Of.md"),
    "extra Node": sealed(files, "core/Extra.md", "---\nname: Extra\n---\n"),
    "extra file": sealed(files, "README", "hello"),
    "seal missing": drop(`seals/${sha256(files["core/CASE.md"])}`),
    "seal extra": sealed(files, `seals/${"a".repeat(64)}`, ""),
    "seal not empty": sealed(files, `seals/${sha256(files["core/CASE.md"])}`, "x"),
    "Kernel admitted as a Node": sealed(files, `seals/${sha256(files["core/KERNEL.md"])}`, ""),
    "relationship reversed": sealed(files, "core/CASE.md", files["core/CASE.md"] + `\nCASE ${sha256(files["core/CASE.md"])} -> Core ${sha256(coreText)}\n`),
    "Core replaced": sealed(files, "core/Core.md", coreText.replace(/ -> CASE /, " -> Node ")),
    "relationship moved to another Node": sealed(files, "core/Edge.md", files["core/Edge.md"] + coreText.match(/^Component Of .+$/m)![0] + "\n"),
  };
  for (const [what, bad] of Object.entries(defects)) assert.notEqual(conforms(bad, coreText).length, 0, what);
});

test("KAAL Definitions are found by Node type; CASE and Core are among them, and the others are not", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const definition = nodes.find((n) => n.name === "KAAL Definition")!;
  assert.deepEqual(typedBy(nodes, { name: "KAAL Definition", id: definition.id }).map((n) => n.name).sort(), ["CASE", "Core"]);
  assert.equal(definition.type?.name, "Node", "KAAL Definition is itself a Node, not a KAAL Definition");
  assert.deepEqual(typedBy(nodes, { name: "KAAL Definition", id: "f".repeat(64) }), [], "a type the graph does not hold has no instances");
  assert.deepEqual(typedBy(nodes, { name: "Wrong", id: definition.id }), [], "name is checked with the ID");
});

test("Component Of is an Edge, born from Edge by exact ID", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const edge = nodes.find((n) => n.name === "Edge")!;
  const component = nodes.find((n) => n.name === "Component Of")!;
  assert.deepEqual(component.type, { name: "Edge", id: edge.id });
  assert.equal(resolve(nodes, component.type), edge);
});

test("Core is a Component Of CASE, in that direction only, resolving exact Nodes", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const by = (name: string) => nodes.find((n) => n.name === name)!;
  const found = relationships(nodes, by("Core"));
  assert.equal(found.length, 1);
  assert.equal(found[0].edge, by("Component Of"));
  assert.equal(found[0].target, by("CASE"));
  for (const n of nodes.filter((n) => n.name !== "Core")) assert.deepEqual(relationships(nodes, n), [], `${n.name} is the source of nothing`);
});

test("the relationship does not mutate or redefine either endpoint", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = readNodes(dir);
  const caseNode = before.find((n) => n.name === "CASE")!;
  assert.ok(!caseNode.markdown.includes("Core"), "CASE does not mention Core");
  assert.ok(!caseNode.markdown.includes(before.find((n) => n.name === "Core")!.id));
  rmSync(join(dir, "core", "Core.md"));
  const after = readNodes(dir);
  assert.equal(after.find((n) => n.name === "CASE")!.id, caseNode.id, "CASE is the same Node without the relationship");
  assert.equal(after.length, before.length - 1);
});

test("moving stored Nodes without changing bytes changes neither identity nor relationship", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = readNodes(dir);
  mkdirSync(join(dir, "a", "b"), { recursive: true });
  renameSync(join(dir, "core", "Core.md"), join(dir, "a", "anything"));
  renameSync(join(dir, "core", "CASE.md"), join(dir, "a", "b", "CASE.md"));
  const after = readNodes(dir);
  assert.deepEqual(after.map((n) => n.id).sort(), before.map((n) => n.id).sort());
  const core = after.find((n) => n.name === "Core")!;
  assert.equal(relationships(after, core)[0].target.id, before.find((n) => n.name === "CASE")!.id);
});

test("changing a referenced Node makes a new identity and never retargets the relationship", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = readNodes(dir);
  const oldCase = before.find((n) => n.name === "CASE")!;
  const path = join(dir, "core", "CASE.md");
  writeFileSync(path, readFileSync(path, "utf8") + "\n");
  const changed = readNodes(dir);
  const newCase = changed.find((n) => n.name === "CASE")!;
  assert.notEqual(newCase.id, oldCase.id, "a changed CASE is a different Node");
  const core = changed.find((n) => n.name === "Core")!;
  assert.throws(() => relationships(changed, core), /no Node has ID/, "Core still names the old CASE and does not follow the new one");
  assert.ok(checkBootstrap(Object.fromEntries([...Object.entries(payload()), ["core/CASE.md", readFileSync(path, "utf8")]])).length > 0, "the new CASE is not admitted until sealed");
  writeFileSync(join(dir, "core", "CASE2.md"), readFileSync(path, "utf8"));
  writeFileSync(path, oldCase.markdown);
  const both = readNodes(dir);
  assert.equal(relationships(both, both.find((n) => n.name === "Core")!)[0].target.id, oldCase.id, "with both present, still the old one");
});

test("an occurrence must name an Edge and a resolvable target", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const by = (name: string) => nodes.find((n) => n.name === name)!;
  const fake = (line: string) => ({ ...by("Core"), markdown: line });
  const co = by("Component Of").id;
  const target = by("CASE");
  assert.throws(() => relationships(nodes, fake(`Component Of ${by("Node").id} -> CASE ${target.id}`)), /is named Node/);
  assert.throws(() => relationships(nodes, fake(`Node ${by("Node").id} -> CASE ${target.id}`)), /is not typed by Edge/);
  assert.throws(() => relationships(nodes, fake(`Component Of ${co} -> CASE ${"f".repeat(64)}`)), /no Node has ID/);
  assert.throws(() => relationships(nodes, fake(`Component Of ${co} -> Core ${target.id}`)), /is named CASE, not Core/);
});

test("every Node Core carries is admitted, and exactly those are sealed", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  assert.deepEqual(nodes.map((n) => n.name).sort(), ["CASE", "Component Of", "Core", "Edge", "KAAL Definition", "Node"]);
  assert.deepEqual(checkBootstrap(), []);
  for (const n of nodes) assert.ok(!n.markdown.includes(n.id), `${n.name} does not contain its own ID`);
});
