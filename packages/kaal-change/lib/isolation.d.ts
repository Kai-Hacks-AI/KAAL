export interface Ref { name: string; id: string }
export interface Element { identity: string; ref: Ref; kind: 'intent' | 'requirement' | 'nonfunctional-requirement' | 'defect' | 'architecture' | 'case' | 'realization' }
export interface Interface { identity: string; ref: Ref; from: string; to: string; contract: Ref }
export interface Trace { source: Ref; type: Ref; target: Ref; boundary: string | null }
export interface Inventory { elements: Element[]; interfaces: Interface[]; traces: Trace[] }
export interface GraphNode { name: string; id: string; frontmatter?: Readonly<Record<string, unknown>> }
export interface GraphView {
  resolve(ref: Ref): GraphNode | undefined;
  check(): string[];
  out(id: string): ReadonlyArray<{ type: Ref; target: Ref }>;
  traverse(id: string, options: { direction: 'in' | 'out' }): Iterable<{ id: string; depth: number }>;
}
export interface Proposal { ref: Ref; alters: readonly string[]; scope: readonly string[] }
export interface Model { change: Ref; owners: readonly string[]; sources: ReadonlyArray<{ owner: string; ref: Ref }>; graph: GraphView }
export interface Finding { kind: 'violation' | 'unknown'; code: string; subject: string; reason: string }
export interface OwnedElement { identity: string; owner: string; kind: Element['kind'] | 'interface'; ref: Ref }
export interface Boundary extends OwnedElement { from: string; to: string; contract: Ref; direction: 'incoming' | 'outgoing' }
export interface Obligation {
  loop: 'architecture-conformance' | 'capability-acceptance' | 'implementation';
  kind: 'architecture-boundary' | 'regression' | 'real-subject' | 'case-execution' | 'behaviour' | 'driver' | 'controlled-collaborator' | 'contract' | 'real-integration';
  target: string; owner: string; boundary: string | null; status: 'not-assessed';
}
export interface IsolationAssessment {
  assessment: 'isolated' | 'violated' | 'unknown'; scope: string[];
  selected: OwnedElement[]; impact: OwnedElement[]; affectedOutside: OwnedElement[]; dependencies: OwnedElement[];
  boundaries: Boundary[]; externalReferences: Trace[]; obligations: Obligation[]; findings: Finding[]; modelDigest: string | null;
  proposal: Ref | null; sources: { owner: string; ref: Ref }[];
  authority: { status: 'unestablished'; coverage: 'supplied-model-only'; reason: string };
  execution: { status: 'not-assessed'; reason: string };
}
export function isolate(proposal: Proposal, model?: Model): IsolationAssessment;
