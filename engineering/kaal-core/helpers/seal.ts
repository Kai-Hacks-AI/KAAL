// The bytes-and-seal primitives are Core's private bootstrap sealing (the
// authoritative implementation lives in packages/kaal-core/src/bootstrap.ts and
// nodes.ts), reached in the built package and not through its public API. This
// only re-exports them for the helpers and acceptance tests here.
type Machinery = typeof import("../../../packages/kaal-core/dist/bootstrap.js");
type Nodes = typeof import("../../../packages/kaal-core/dist/nodes.js");
const bootstrap: Machinery = await import(new URL("../../../../packages/kaal-core/dist/bootstrap.js", import.meta.url).href);
const nodes: Nodes = await import(new URL("../../../../packages/kaal-core/dist/nodes.js", import.meta.url).href);
export const { checkBytes, writeSeal } = bootstrap;
export const { sha256 } = nodes;
