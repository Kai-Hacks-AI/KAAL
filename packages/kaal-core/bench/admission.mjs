// Reports how long admission takes for chains of types whose deepest Node
// sorts first. A report, not a test: nothing here gates CI.
//   npm run bench -w kaal-core
import { sha256 } from "@kaihacksai/kaal-graph";
import { evaluate, foundation, payload } from "../dist/index.js";

const node = (name, type) => `---\nname: ${name}\ntype:\n  name: ${type.name}\n  id: ${type.id}\n---\n`;

for (const depth of [1000, 2000, 4000, 8000, 16000]) {
  const files = { ...payload() };
  let type = foundation().definition;
  for (let i = 0; i < depth; i++) {
    const bytes = Buffer.from(node(`Link ${i}`, type));
    files[`chain/${String(depth - i).padStart(6, "0")}.md`] = bytes;
    type = { name: `Link ${i}`, id: sha256(bytes) };
  }
  const started = performance.now();
  const admitted = evaluate(files).nodes.length;
  console.log(`${String(depth).padStart(6)} chained Nodes: ${admitted} admitted in ${(performance.now() - started).toFixed(1)} ms`);
}
