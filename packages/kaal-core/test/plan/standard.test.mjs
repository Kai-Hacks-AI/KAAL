// core/C34 planned outer tests: Core's Standard, Applies to and scope Definitions. Immutable to
// DO and CHECK; core/C35 turns them GREEN. Each title names the contracts it checks (plan/standard/*.md).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { claimsForm, identify, identifyRoot } from "kaal-graph";

const PACKAGE = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, PACKAGE));
const KAAL_DEFINITION = { name: "KAAL Definition", id: "a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2" };
const NAMES = { "Standard.md": "Standard", "Applies-to.md": "Applies to", "Repository-native.md": "Repository-native", "KAAL-Integration.md": "KAAL Integration", "KAAL-Package.md": "KAAL Package" };

/** The exact bytes this PLAN's Architecture states for each Definition: its fenced text plus one final line feed. */
const planned = () => {
  const text = read("plan/standard/architecture.md").toString("utf8");
  const out = {};
  for (const m of text.matchAll(/^`payload\/core\/([^`]+)`:\n\n```markdown\n([\s\S]*?)\n```$/gm)) out[m[1]] = `${m[2]}\n`;
  assert.deepEqual(Object.keys(out).sort(), Object.keys(NAMES).sort(), "the Architecture states each of the five Definitions");
  return out;
};

/** Every Node the payload carries, keyed by its `/`-separated path under payload/. */
const payloadNodes = () => {
  const root = fileURLToPath(new URL("payload/", PACKAGE));
  const nodes = {};
  for (const e of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!e.isFile() || !e.name.endsWith(".md")) continue;
    const path = relative(root, join(e.parentPath, e.name)).replaceAll("\\", "/");
    const bytes = readFileSync(join(e.parentPath, e.name));
    if (claimsForm(bytes)) nodes[path] = path === "core/Node.md" ? identifyRoot(bytes) : identify(bytes);
  }
  return nodes;
};

/** The payload's one Node named `name`, or a failure naming what the payload does not carry. */
const carried = (nodes, name) => {
  const found = Object.values(nodes).filter((n) => n.name === name);
  assert.equal(found.length, 1, `the payload carries exactly one Node named ${name}, not ${found.length}`);
  return { name, id: found[0].id };
};

describe("Core's Standard, Applies to and scope Definitions (core/C34)", () => {
  it("core/T87 [core/F81, core/F82, core/F83, core/N22, core/A40]: each of the five Definitions is in payload/core/, byte-identical to the text in this PLAN's Architecture", () => {
    const text = planned();
    for (const [file, bytes] of Object.entries(text)) {
      const path = `payload/core/${file}`;
      assert.ok(existsSync(new URL(path, PACKAGE)), `the payload carries ${path}`);
      assert.equal(read(path).toString("utf8"), bytes, `${path} is the Architecture's text, byte for byte`);
    }
  });

  it("core/T88 [core/F83, core/N21, core/A40]: each is a Node typed by Core's KAAL Definition, its name is unique in the payload, and none declares Edges", () => {
    const nodes = payloadNodes();
    assert.deepEqual(carried(nodes, "KAAL Definition"), KAAL_DEFINITION, "KAAL Definition is the one the foundation fixes");
    for (const [file, name] of Object.entries(NAMES)) {
      carried(nodes, name);
      const node = nodes[`core/${file}`];
      assert.ok(node, `core/${file} is a Node in the payload`);
      assert.equal(node.name, name, `core/${file} is named ${name}`);
      assert.deepEqual({ name: node.type.name, id: node.type.id }, KAAL_DEFINITION, `${name} is typed by KAAL Definition`);
      assert.equal(node.frontmatter.edges, undefined, `${name} declares no Edges, so it contains and relates to nothing`);
    }
  });

  it("core/T89 [core/F84, core/I25, core/A42]: with the payload, evaluate admits a Node typed by Standard whose Applies to Edge group targets KAAL Capability and KAAL Package, and still admits every payload Node", async () => {
    const nodes = payloadNodes();
    const [standard, appliesTo, capability, pkg] = ["Standard", "Applies to", "KAAL Capability", "KAAL Package"].map((name) => carried(nodes, name));
    const ref = (r, indent) => `${indent}name: ${r.name}\n${indent}id: ${r.id}\n`;
    const fixture = Buffer.from(
      `---\nname: Example Standard\ntype:\n${ref(standard, "  ")}edges:\n  - type:\n${ref(appliesTo, "      ")}    targets:\n      - ${ref(capability, "        ").trimStart()}      - ${ref(pkg, "        ").trimStart()}---\n\n# Example Standard\n\nA fixture Standard, applying to every Capability and every package.\n`,
    );
    const { evaluate, payload } = await import("kaal-core");
    const files = payload();
    const engine = evaluate({ ...files, "fixture/Example-Standard.md": fixture });
    assert.deepEqual(engine.rejected, [], "nothing is rejected");
    const id = identify(fixture).id;
    assert.ok(engine.nodes.some((n) => n.id === id), "the fixture Standard is admitted");
    assert.equal(engine.nodes.length, evaluate(files).nodes.length + 1, "every payload Node is still admitted");
  });

  it("core/T90 [core/A41]: installation.kaal.json lists each of the five as an asset deployed to .kaal/core/, and its catalogue lists the file's SHA-256", () => {
    const contract = JSON.parse(read("installation.kaal.json").toString("utf8"));
    for (const file of Object.keys(NAMES)) {
      const asset = (contract.assets ?? []).find((a) => a.source === `payload/core/${file}`);
      assert.ok(asset, `the contract lists payload/core/${file} as an asset`);
      assert.equal(asset.target, `.kaal/core/${file}`, `${file} deploys to .kaal/core/`);
      if (!existsSync(new URL(asset.source, PACKAGE))) assert.fail(`the payload carries no ${asset.source}`);
      const digest = createHash("sha256").update(read(asset.source)).digest("hex");
      assert.ok((contract.catalogue?.[asset.target] ?? []).includes(digest), `the catalogue lists ${asset.target} at its bytes' SHA-256`);
    }
  });
});
