// Controlled example data shared by the skill demonstration and delivered Cases.
import { Graph, createNode, identifyRoot } from 'kaal-graph';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';

const root = identifyRoot(Buffer.from('---\nname: Model\n---\n\n# Model\n'));
const ref = n => ({ name: n.name, id: n.id });
export function example({ extraDependent = false, omitElement, omitInterface, scope = ['shop'] } = {}) {
  const graph = new Graph([root]);
  const trace = createNode({ name: 'Example trace', type: ref(root) }).node;
  graph.add(trace);
  const elements = [], interfaces = [], declarations = [];
  const make = (identity, kind, dependencies = []) => {
    const node = createNode({ name: identity, type: ref(root),
      edges: dependencies.length ? [{ type: ref(trace), targets: dependencies.map(d => d.ref) }] : [] }).node;
    graph.add(node);
    const row = { identity, kind, ref: ref(node) };
    elements.push(row);
    for (const d of dependencies) declarations.push({ source: row.ref, type: ref(trace), target: d.ref,
      boundary: identity === 'web/A1' ? 'web/A2' : d.identity === 'provider/A1' && identity === 'shop/A1' ? 'shop/A2' : null });
    return row;
  };
  const contract = make('provider/F1', 'requirement');
  const provider = make('provider/A1', 'architecture', [contract]);
  const intent = make('shop/I1', 'intent');
  const requirement = make('shop/F1', 'requirement', [intent]);
  const nonfunctional = make('shop/N1', 'nonfunctional-requirement', [intent]);
  const defect = make('shop/D1', 'defect', [requirement]);
  const architecture = make('shop/A1', 'architecture', [requirement, nonfunctional, defect, provider]);
  make('shop/T1', 'case', [architecture, defect]);
  make('shop/R1', 'realization', [architecture]);
  const incoming = make('web/A1', 'architecture', [architecture]);
  function boundary(identity, from, to) {
    const node = createNode({ name: identity, type: ref(root) }).node;
    graph.add(node);
    interfaces.push({ identity, ref: ref(node), from: from.identity, to: to.identity, contract: contract.ref });
  }
  boundary('web/A2', incoming, architecture);
  boundary('shop/A2', architecture, provider);
  if (extraDependent) make('audit/A1', 'architecture', [requirement]);
  const change = createNode({ name: 'shop/C1', type: ref(root),
    frontmatter: { alters: ['shop/I1'], scope } }).node;
  graph.add(change);
  const proposal = { ref: ref(change), alters: ['shop/I1'], scope };
  const owners = [...new Set(elements.map(e => e.identity.split('/')[0]))].sort();
  const sources = owners.map(owner => {
    const inventory = {
      elements: elements.filter(e => e.identity.startsWith(owner + '/') && e.identity !== omitElement),
      interfaces: interfaces.filter(i => i.identity.startsWith(owner + '/') && i.identity !== omitInterface),
      traces: declarations.filter(t => t.source.name.startsWith(owner + '/')),
    };
    const node = createNode({ name: owner + '/Isolation inventory', type: ref(root), frontmatter: { inventory } }).node;
    graph.add(node);
    return { owner, ref: ref(node) };
  });
  return { proposal, model: { change: proposal.ref, owners, sources, graph }, graph, elements, interfaces };
}

// Independent subject contract: expose the input units and a varying result.
// The outgoing collaborator supplies basis points; the real subject converts them.
export const charge = (amount, rates) => {
  if (!Number.isFinite(amount) || amount < 0) throw new RangeError('invalid amount');
  return amount + Math.round(amount * rates.basisPoints() / 10000);
};
export const driver = (subject, rates) => [0, 1000, 2000].map(amount => subject(amount, rates));
export const subjectCase = subject => {
  try { return JSON.stringify(driver(subject, { basisPoints: () => 2500 })) === '[0,1250,2500]'; }
  catch { return false; }
};
export const providerContract = provider => provider.basisPoints() === 2500;
export class RateProvider {
  constructor(percent) {
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new RangeError('invalid percent');
    this.percent = percent;
  }
  basisPoints() { return Math.round(this.percent * 100); }
}

// Owner-derived cyclic projection: the synthetic identities are fixture labels,
// not claims that directly embedded content-addressed Nodes form a hash cycle.
export function cyclic() {
  const freeze = x => { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); } return x; };
  const type = createNode({ name: 'Cyclic relation', type: ref(root) }).node;
  const a = { name: 'cyclic/I1', id: sha256(new TextEncoder().encode('cycle-a')) };
  const b = { name: 'cyclic/A1', id: sha256(new TextEncoder().encode('cycle-b')) };
  const node = (own, target) => freeze({ ...own, type: ref(root),
    frontmatter: { edges: [{ type: ref(type), targets: [target] }] } });
  const graph = new Graph([root, type, node(a, b), node(b, a)]);
  const change = createNode({ name: 'cyclic/C1', type: ref(root), frontmatter: { alters: ['cyclic/I1'], scope: ['cyclic'] } }).node;
  graph.add(change);
  const inventory = { elements: [{ identity: a.name, ref: a, kind: 'intent' }, { identity: b.name, ref: b, kind: 'architecture' }],
    interfaces: [], traces: [{ source: a, type: ref(type), target: b, boundary: null }, { source: b, type: ref(type), target: a, boundary: null }] };
  const source = createNode({ name: 'cyclic/Inventory', type: ref(root), frontmatter: { inventory } }).node;
  graph.add(source);
  return { proposal: { ref: ref(change), alters: ['cyclic/I1'], scope: ['cyclic'] },
    model: { graph, change: ref(change), owners: ['cyclic'], sources: [{ owner: 'cyclic', ref: ref(source) }] } };
}
