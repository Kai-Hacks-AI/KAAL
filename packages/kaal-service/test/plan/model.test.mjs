// service/C1 planned outer tests: the Service Management model (S3a).
// Immutable to DO and CHECK; service/C2 turns them GREEN. Each title names the
// contracts it checks (plan/model/*.md). Core admits by type alone and Graph
// derives relationships; what the Definitions mean stays validation.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, foundation, loadEngine, readContribution, register } from "kaal-core";
import { createNode, Graph, identify } from "kaal-graph";
import { readFile } from "kaal-hosting";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const CAPABILITY = join(PACKAGE, "capability");
const ref = ({ name, id }) => ({ name, id });

/** A planned Definition's Node, or the reason the tests are blocked before any behavioural assertion. */
async function definition(file) {
  if (!existsSync(join(CAPABILITY, file))) assert.fail(`blocked before behavioural assertion: capability/${file} does not exist`);
  return identify(await readFile(join(CAPABILITY, file)));
}

/** The Definitions this model adds, with S1's Service and provides. */
async function definitions() {
  const d = {};
  for (const [key, file] of [["agreement", "Agreement.md"], ["composes", "composes.md"], ["covers", "covers.md"], ["underpins", "underpins.md"], ["service", "Service-Definition.md"], ["provides", "provides.md"]]) d[key] = ref(await definition(file));
  return d;
}

/** A fresh Engine with Service's contribution and, when given, the Nodes of one more capability contribution. */
async function engine(nodes) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-service-model-"));
  await bootstrap(dir);
  await register(dir, "capability", "service", await readContribution(CAPABILITY));
  if (nodes.length) {
    // A capability contribution carries a Capability Node; the model's Nodes ride with one.
    const holder = createNode({ name: "Model", type: foundation().capability });
    const files = Object.fromEntries([holder, ...nodes].map((n) => [`${n.node.name}.md`, n.bytes]));
    await register(dir, "capability", "model", files);
  }
  const loaded = await loadEngine(dir);
  assert.deepEqual(loaded.rejected, []);
  const graph = new Graph(loaded.nodes);
  assert.deepEqual(graph.check(), [], "every Edge resolves");
  return graph;
}

const sources = (graph, target, type) => graph.in(target.id).filter((e) => e.type.id === type.id).map((e) => e.source.name).sort();

describe("Service Management model (service/C1)", () => {
  it("service/T1 [service/F2, service/F3, service/F4, service/A1]: Agreement, composes, covers and underpins are in Form, typed by Core's KAAL Definition, and admitted with Service's contribution", async () => {
    for (const [file, name] of [["Agreement.md", "Agreement"], ["composes.md", "composes"], ["covers.md", "covers"], ["underpins.md", "underpins"]]) {
      const n = await definition(file);
      assert.equal(n.name, name, file);
      assert.deepEqual(n.type, foundation().definition, file);
    }
    await engine([]);
  });

  it("service/T2 [service/F1, service/I1]: a Service's owner is a declared property, not an Edge, and independent of the Capability that provides it", async () => {
    const d = await definitions();
    const booking = createNode({ name: "Booking", type: d.service, frontmatter: { owner: "Booking Service Owner" } });
    const desk = createNode({ name: "Desk", type: foundation().capability, edges: [{ type: d.provides, targets: [ref(booking.node)] }] });
    const graph = await engine([booking, desk]);
    assert.equal(graph.node(booking.node.id).frontmatter.owner, "Booking Service Owner", "the owner reads back as declared");
    assert.deepEqual(graph.out(booking.node.id), [], "the owner is not an Edge");
    assert.deepEqual(sources(graph, booking.node, d.provides), ["Desk"], "the provider comes from provides alone, never from the owner");
  });

  it("service/T3 [service/F2, service/I2]: Graph derives what a supporting Service supports, across two levels, from the composes Edges the composed Services carry", async () => {
    const d = await definitions();
    const storage = createNode({ name: "Storage", type: d.service });
    const ledger = createNode({ name: "Ledger", type: d.service, edges: [{ type: d.composes, targets: [ref(storage.node)] }] });
    const booking = createNode({ name: "Booking", type: d.service, edges: [{ type: d.composes, targets: [ref(ledger.node)] }] });
    const graph = await engine([storage, ledger, booking]);
    assert.deepEqual(graph.out(storage.node.id), [], "a supporting Service lists nothing it supports");
    assert.deepEqual(sources(graph, storage.node, d.composes), ["Ledger"]);
    const up = [...graph.traverse(storage.node.id, { direction: "in", type: d.composes.id })].filter((s) => s.depth > 0).map((s) => graph.node(s.id).name).sort();
    assert.deepEqual(up, ["Booking", "Ledger"]);
  });

  it("service/T4 [service/F3, service/F4, service/I3]: an SLA covers a Service and an OLA and a UC underpin it, each with its kind and parties as declared, and Graph derives each target's Agreements", async () => {
    const d = await definitions();
    const booking = createNode({ name: "Booking", type: d.service });
    const covers = { type: d.covers, targets: [ref(booking.node)] };
    const sla = createNode({ name: "Booking SLA", type: d.agreement, edges: [covers], frontmatter: { kind: "SLA", parties: ["Booking Service Owner", "Booking Consumer"] } });
    const underpins = { type: d.underpins, targets: [ref(sla.node)] };
    const ola = createNode({ name: "Ledger OLA", type: d.agreement, edges: [covers, underpins], frontmatter: { kind: "OLA", parties: ["Booking Service Owner", "Ledger Service Owner"] } });
    const uc = createNode({ name: "Hosting UC", type: d.agreement, edges: [covers, underpins], frontmatter: { kind: "UC", parties: ["Booking Service Owner", "Hosting Supplier"] } });
    const graph = await engine([booking, sla, ola, uc]);
    assert.deepEqual(graph.typed(d.agreement).map((r) => r.name).sort(), ["Booking SLA", "Hosting UC", "Ledger OLA"]);
    for (const [n, kind] of [[sla, "SLA"], [ola, "OLA"], [uc, "UC"]]) assert.equal(graph.node(n.node.id).frontmatter.kind, kind, `${n.node.name}'s kind is as declared`);
    assert.deepEqual(sources(graph, booking.node, d.covers), ["Booking SLA", "Hosting UC", "Ledger OLA"]);
    assert.deepEqual(sources(graph, sla.node, d.underpins), ["Hosting UC", "Ledger OLA"]);
    assert.deepEqual(graph.out(booking.node.id), [], "a Service lists none of its Agreements");
  });

  it("service/T5 [service/N1]: no text Service delivers or plans names a customer organization or a tool realization, checked by hashed words", () => {
    // SHA-256 of the lowercase names; the names themselves never enter KAAL.
    const DENIED = new Set([
      "5c2e98a082a1eeca5678de6f2ec866342efde86141d61b3de379ab22dc400d59",
      "b5738c169b693bee89e1b74ebd48e0dfa53a34e8571790b7727721a0bfadc470",
      "e631d46bfe69dd4a1f685ad232e3f97e8d2f82705edfa15fa6e6b942892c54e9",
    ]);
    const found = [];
    const walk = (dir) => {
      for (const e of readdirSync(dir)) {
        if (e === "node_modules") continue;
        const p = join(dir, e);
        if (statSync(p).isDirectory()) walk(p);
        else for (const w of readFileSync(p, "utf8").toLowerCase().match(/[a-z0-9]+/g) ?? []) if (DENIED.has(createHash("sha256").update(w).digest("hex"))) found.push(p.slice(PACKAGE.length));
      }
    };
    walk(PACKAGE);
    assert.deepEqual([...new Set(found)], [], "a denied name appears in these files");
  });
});
