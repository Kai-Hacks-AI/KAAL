// Shared helpers for graph/C15 Cases. They use Graph's package surface only.
import assert from 'node:assert/strict';
import * as graph from '../../skills/kaal-graph/scripts/edges.mjs';

/** An export of Graph, or the reason the Case is blocked before any behavioural assertion. */
export function exported(name) {
  assert.equal(typeof graph[name], 'function', `blocked before behavioural assertion: kaal-graph exports no ${name}`);
  return graph[name];
}
export const map = (o) => new Map(Object.entries(o));
export const shuffled = (o) => map(Object.fromEntries(Object.entries(o).reverse().map(([k, v]) => [k, [...v].reverse()])));
