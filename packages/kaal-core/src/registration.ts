// Capability registration and one-way traceability (core/C24, core/C30, core/C32; delivered by core/C26).
// Core's admission of registrations: who holds which scope, which kinds each owner defines with its
// outgoing rule, which instances each holder holds, and whether each stated trace resolves and is
// permitted. Pure: it imports no host module, reads nothing and writes nothing (core/N14).
// Scopes, identities and kind names are opaque text, compared only for equality (core/F48).
// Graph's analysis, `reach`, incoming views and observed cycles, is an optional complement
// (core/F80, core/A27). This part ships without it, so those views are unavailable (`null`).
import type { Schema } from "./frontmatter.js";

/** A kind reference: a kind name in the referring registration's own scope, or a kind in a named scope (core/F50). */
export type KindRef = string | { readonly scope: string; readonly kind: string };
/** A trace target: an identity in the source's own scope, or an assembly identity (core/F48). */
export type Target = string | { readonly scope: string; readonly id: string };

/** A kind as its owner registers it: its outgoing rule, and an opaque pointer to its Definition (core/F51). */
export interface KindDefinition {
  readonly traces: readonly KindRef[] | "any";
  readonly definition?: string;
}

/** An instance as its holder states it: its identity, its kind and its outgoing traces (core/F52). */
export interface InstanceStatement {
  readonly id: string;
  readonly kind: KindRef;
  readonly traces?: readonly Target[];
}

/** One holder's registration, as its frontmatter states it (core/F47, core/A25). */
export interface RegistrationStatement {
  readonly holder: string;
  readonly scope: string;
  readonly kinds?: { readonly [name: string]: KindDefinition };
  readonly instances?: readonly InstanceStatement[];
}

/** A kind, qualified by its owner's scope. */
export interface QualifiedKind {
  readonly scope: string;
  readonly kind: string;
}

/** An assembly identity: the scope its holder claims, and the identity within it. */
export interface AssemblyId {
  readonly scope: string;
  readonly id: string;
}

export interface Claim {
  readonly scope: string;
  readonly holder: string;
}

export interface AssembledKind extends QualifiedKind {
  readonly owner: string;
  /** The owner's opaque pointer to the kind's Definition, which Core reports and never reads. */
  readonly definition: string | null;
  readonly traces: readonly QualifiedKind[] | "any";
}

export interface AssembledInstance extends AssemblyId {
  readonly holder: string;
  /** The stated kind, qualified: never read from the identity's spelling, and never another scope's. */
  readonly kind: QualifiedKind;
}

/** A trace as its source states it. */
export interface Trace {
  readonly source: AssemblyId;
  readonly target: AssemblyId;
}

export interface Candidate extends QualifiedKind {
  readonly owner: string;
}

/** A finding: always Core's global verdict on the assembly, never a Capability's local one (core/F56). */
export type Finding = { readonly verdict: "core"; readonly rule: string } & { readonly [detail: string]: unknown };

/** A term several owners define, reported unaligned and never resolved (core/F66). */
export interface SharedTerm {
  readonly term: string;
  readonly aligned: false;
  readonly kinds: readonly (Candidate & { readonly definition: string | null })[];
  /** The relationships among those kinds that their rules state by name. None is inferred. */
  readonly related: readonly { readonly from: QualifiedKind; readonly to: QualifiedKind }[];
}

/** What assembly finds (core/A26). */
export interface Assembly {
  readonly scopes: readonly Claim[];
  readonly kinds: readonly AssembledKind[];
  readonly instances: readonly AssembledInstance[];
  readonly terms: readonly SharedTerm[];
  readonly findings: readonly Finding[];
  /** The observed cycles, each naming its instances: Graph's analysis, unavailable (`null`) without it (core/F80). */
  readonly cycles: readonly (readonly AssemblyId[])[] | null;
  /** The instances that state no trace. A report, never a finding (core/F55). */
  readonly untraced: readonly AssemblyId[];
  /** The traces an instance states. */
  outgoing(scope: string, id: string): readonly Trace[];
  /** The traces ending at an instance, derived by Graph; unavailable (`null`) without it (core/F54, core/F80). */
  incoming(scope: string, id: string): readonly Trace[] | null;
  /** The instances reachable from one, by Graph; unavailable (`null`) without it (core/F53, core/F80). */
  reach(scope: string, id: string): readonly AssembledInstance[] | null;
}

/** The Type a registration is an artifact of (core/A25). */
export const REGISTRATION_TYPE = "Core/Registration";

const TEXT = { value: "parameter", pattern: "\\S" } as const;
const KIND_REF = { value: "either", of: [TEXT, { value: "record", fields: { scope: { ...TEXT, required: true }, kind: { ...TEXT, required: true } } }] } as const;
const TARGET = { value: "either", of: [TEXT, { value: "record", fields: { scope: { ...TEXT, required: true }, id: { ...TEXT, required: true } } }] } as const;

/**
 * The Registration Type's schema, in `kaal-core/frontmatter`'s shape (core/A25, core/C27): `holder`
 * and `scope`; `kinds`, each with its `traces` rule, a list of kind references or `any`, and an
 * optional `definition`; and `instances`, each with its `id`, `kind` and `traces`. There is no
 * field for an incoming trace (core/N15).
 */
export const REGISTRATION_SCHEMA: Schema = {
  keys: {
    holder: { ...TEXT, required: true },
    scope: { ...TEXT, required: true },
    kinds: {
      value: "map",
      key: TEXT,
      of: {
        value: "record",
        fields: {
          traces: { value: "either", required: true, of: [{ value: "enum", values: ["any"] }, { ...KIND_REF, list: true }] },
          definition: TEXT,
        },
      },
    },
    instances: {
      value: "record",
      list: true,
      fields: { id: { ...TEXT, required: true }, kind: { ...KIND_REF, required: true }, traces: { ...TARGET, list: true } },
    },
  },
};

const INSTANCE_MEMBERS = new Set(["id", "kind", "traces"]);
const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const canonical = (v: unknown): string =>
  JSON.stringify(v, (_, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => cmp(a, b))) : x));
const byCanonical = <T>(xs: T[]): T[] => xs.map((x) => [canonical(x), x] as const).sort(([a], [b]) => cmp(a, b)).map(([, x]) => x);
/** Ordered by scope, then kind, then owner. */
const byScope = <T extends Candidate>(xs: T[]): T[] => [...xs].sort((a, b) => cmp(a.scope, b.scope) || cmp(a.kind, b.kind) || cmp(a.owner, b.owner));
const key = (scope: string, name: string) => `${scope}\u0000${name}`;
const qualify = (ref: KindRef, own: string): QualifiedKind => (typeof ref === "string" ? { scope: own, kind: ref } : { scope: ref.scope, kind: ref.kind });
const locate = (t: Target, own: string): AssemblyId => (typeof t === "string" ? { scope: own, id: t } : { scope: t.scope, id: t.id });
const finding = (rule: string, details: Record<string, unknown>): Finding => ({ verdict: "core", rule, ...details });

/**
 * Assemble registrations (core/A26). Core's admission needs no Graph (core/F80): scope claims and
 * their collisions (core/F49), kinds qualified by their owner's scope (core/F50), each owner's
 * rule (core/F51), each trace's resolution and permission (core/F52), stated incoming traces
 * refused (core/F54), untraced instances reported (core/F55), and shared terms surfaced
 * (core/F66, core/F67). Nothing is inferred and no cycle is judged. The same registrations, in
 * any order, give the same result (core/N14).
 */
export function assemble(registrations: readonly RegistrationStatement[]): Assembly {
  const findings: Finding[] = [];

  // Scope claims: one scope, one holder (core/F49).
  const holders = new Map<string, string[]>();
  for (const r of registrations) holders.set(r.scope, [...(holders.get(r.scope) ?? []), r.holder]);
  const collided = new Set([...holders].filter(([, hs]) => hs.length > 1).map(([s]) => s));
  for (const s of collided) findings.push(finding("scope collision: one scope has one holder", { scope: s, holders: [...holders.get(s)!].sort(cmp) }));
  const scopes = byCanonical(registrations.map((r) => ({ scope: r.scope, holder: r.holder })));

  // Kinds, each its owner's, qualified by the owner's scope (core/F50).
  const kinds: AssembledKind[] = [];
  const defined = new Map<string, AssembledKind>();
  for (const r of registrations) {
    for (const [name, k] of Object.entries(r.kinds ?? {})) {
      const traces = k.traces === "any" ? ("any" as const) : (k.traces ?? []).map((t) => qualify(t, r.scope));
      const kind: AssembledKind = { scope: r.scope, kind: name, owner: r.holder, definition: k.definition ?? null, traces };
      kinds.push(kind);
      if (!collided.has(r.scope)) defined.set(key(r.scope, name), kind);
    }
  }
  const resolveKind = (q: QualifiedKind) => defined.get(key(q.scope, q.kind));

  /** Every other scope defining a kind of this name, with its owner; none is chosen (core/F67). */
  const candidates = (name: string, except: string): Candidate[] =>
    byScope(kinds.filter((k) => k.kind === name && k.scope !== except).map((k) => ({ scope: k.scope, kind: k.kind, owner: k.owner })));
  const unknownKind = (ref: KindRef, q: QualifiedKind) => (typeof ref === "string" ? candidates(ref, q.scope) : []);

  // Each rule names only registered kinds (core/F51).
  for (const r of registrations) {
    for (const [name, k] of Object.entries(r.kinds ?? {})) {
      if (k.traces === "any") continue;
      for (const ref of k.traces ?? []) {
        const q = qualify(ref, r.scope);
        if (!resolveKind(q)) findings.push(finding("rule names an unknown kind", { owner: r.holder, kind: { scope: r.scope, kind: name }, names: q, candidates: unknownKind(ref, q) }));
      }
    }
  }

  // Instances, held by their scope's holder, of their stated kind (core/F48).
  const instances: AssembledInstance[] = [];
  const stated: { instance: AssembledInstance; traces: AssemblyId[]; kind: AssembledKind | undefined }[] = [];
  const byId = new Map<string, AssembledInstance[]>();
  for (const r of registrations) {
    for (const i of r.instances ?? []) {
      const kind = qualify(i.kind, r.scope);
      const instance: AssembledInstance = { scope: r.scope, id: i.id, holder: r.holder, kind };
      instances.push(instance);
      const k = resolveKind(kind);
      if (!k) findings.push(finding("unknown kind", { instance: { scope: r.scope, id: i.id }, kind, candidates: unknownKind(i.kind, kind) }));
      for (const member of Object.keys(i).filter((m) => !INSTANCE_MEMBERS.has(m)).sort(cmp)) {
        findings.push(finding("refused: an incoming trace is never stated, only derived", { instance: { scope: r.scope, id: i.id }, member }));
      }
      stated.push({ instance, traces: (i.traces ?? []).map((t) => locate(t, r.scope)), kind: k });
      byId.set(key(r.scope, i.id), [...(byId.get(key(r.scope, i.id)) ?? []), instance]);
    }
  }
  for (const [, same] of byId) {
    if (same.length > 1 && !collided.has(same[0].scope)) findings.push(finding("identity stated twice in one scope", { scope: same[0].scope, id: same[0].id, holder: same[0].holder, statements: same.length }));
  }

  // Each trace resolves, and is permitted by its source kind's rule (core/F52).
  for (const { instance, traces, kind } of stated) {
    const source = { scope: instance.scope, id: instance.id };
    for (const target of traces) {
      const refuse = (reason: string) => findings.push(finding(reason, { source, target }));
      if (!holders.has(target.scope)) refuse("unclaimed scope: the target's scope has no holder");
      else if (collided.has(target.scope)) refuse("collided scope: the target does not resolve");
      else {
        const found = byId.get(key(target.scope, target.id));
        if (!found) refuse("unresolved: no instance has the target's identity");
        else if (found.length > 1) refuse("unresolved: the target's identity is stated twice");
        else if (kind) {
          const to = resolveKind(found[0].kind);
          if (!to) refuse("unknown kind: the target's kind is not registered");
          else if (kind.traces !== "any" && !kind.traces.some((t) => t.scope === to.scope && t.kind === to.kind))
            findings.push(finding("not permitted by the rule", { source, target, from: { scope: kind.scope, kind: kind.kind }, to: { scope: to.scope, kind: to.kind } }));
        }
      }
    }
  }

  // Shared terms: surfaced, unaligned, and never resolved (core/F66).
  const names = new Map<string, AssembledKind[]>();
  for (const k of kinds) names.set(k.kind, [...(names.get(k.kind) ?? []), k]);
  const terms: SharedTerm[] = [...names]
    .filter(([, ks]) => new Set(ks.map((k) => k.scope)).size > 1)
    .sort(([a], [b]) => cmp(a, b))
    .map(([term, ks]) => {
      const among = (q: QualifiedKind) => ks.some((k) => k.scope === q.scope && k.kind === q.kind);
      const related = ks.flatMap((k) =>
        k.traces === "any" ? [] : k.traces.filter((t) => among(t) && t.scope !== k.scope).map((t) => ({ from: { scope: k.scope, kind: k.kind }, to: { scope: t.scope, kind: t.kind } })),
      );
      return {
        term,
        aligned: false as const,
        kinds: byScope(ks.map((k) => ({ scope: k.scope, kind: k.kind, owner: k.owner, definition: k.definition }))),
        related: byCanonical(related),
      };
    });

  const outgoing = new Map<string, Trace[]>();
  for (const { instance, traces } of stated) {
    const k = key(instance.scope, instance.id);
    outgoing.set(k, [...(outgoing.get(k) ?? []), ...traces.map((target) => ({ source: { scope: instance.scope, id: instance.id }, target }))]);
  }

  return {
    scopes,
    kinds: byCanonical(kinds),
    instances: byCanonical(instances),
    terms,
    findings: byCanonical(findings),
    cycles: null,
    untraced: byCanonical(stated.filter((s) => s.traces.length === 0).map(({ instance }) => ({ scope: instance.scope, id: instance.id }))),
    outgoing: (scope, id) => byCanonical([...(outgoing.get(key(scope, id)) ?? [])]),
    incoming: () => null,
    reach: () => null,
  };
}
