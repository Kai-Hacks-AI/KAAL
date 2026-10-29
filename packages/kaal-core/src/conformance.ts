// Core's conformance Test Cases for the Installation Contract (core/T10–core/T13), parametrized by an instance.
import { checkContract, type Finding } from "./installation.js";

/** One case's result against one instance. */
export interface CaseResult {
  readonly id: string;
  readonly holds: boolean;
  readonly failures: readonly string[];
}

type Check = (contract: unknown) => readonly Finding[];
type Contract = Record<string, unknown>;
interface Mutation {
  readonly key: string;
  readonly apply: (c: Contract) => Contract | undefined;
  readonly refused: (keys: readonly string[]) => boolean;
}

const PROBE = "conformance-probe";
const named = (key: string) => (keys: readonly string[]) => keys.includes(key);
const under = (prefix: string) => (keys: readonly string[]) => keys.some((k) => k.startsWith(prefix));
const isObject = (v: unknown): v is Contract => typeof v === "object" && v !== null && !Array.isArray(v);
const firstAsset = (c: Contract): Contract | undefined => (Array.isArray(c.assets) && isObject(c.assets[0]) ? c.assets[0] : undefined);
const withAsset = (c: Contract, change: (a: Contract) => Contract): Contract | undefined => {
  const a = firstAsset(c);
  return a && { ...c, assets: [change(a), ...(c.assets as unknown[]).slice(1)] };
};

const T11: readonly Mutation[] = [
  { key: PROBE, apply: (c) => ({ ...c, [PROBE]: 1 }), refused: named(PROBE) },
  { key: "record", apply: ({ record, ...c }) => c, refused: named("record") },
  { key: "version", apply: (c) => ({ ...c, version: 2 }), refused: named("version") },
  { key: "format", apply: (c) => ({ ...c, format: { name: "Installation Contract", id: "0".repeat(64) } }), refused: named("format") },
  { key: "assets.0.kind", apply: (c) => withAsset(c, (a) => ({ ...a, kind: "link" })), refused: named("assets.0.kind") },
  { key: `assets.0.${PROBE}`, apply: (c) => withAsset(c, (a) => ({ ...a, [PROBE]: 1 })), refused: named(`assets.0.${PROBE}`) },
];
const T12: readonly Mutation[] = [
  ...["/abs/x", "../x", "C:/x", "dir\\x"].map((target) => ({ key: "assets.0.target", apply: (c: Contract) => withAsset(c, (a) => ({ ...a, target })), refused: named("assets.0.target") })),
  { key: "catalogue", apply: (c) => ({ ...c, catalogue: { ...(isObject(c.catalogue) ? c.catalogue : {}), [`elsewhere/${PROBE}.md`]: ["0".repeat(64)] } }), refused: under("catalogue") },
  { key: "catalogue digest", apply: (c) => { const a = firstAsset(c); return a && typeof a.target === "string" ? { ...c, catalogue: { [a.target]: ["abc"] } } : undefined; }, refused: under("catalogue") },
];
const location = (c: Contract) => `.claude/skills/${typeof c.capability === "string" ? c.capability : PROBE}`;
const T13: readonly Mutation[] = [
  { key: "provides", apply: (c) => ({ ...c, provides: [{ skill: location(c) }] }), refused: under("provides") },
  { key: "provides", apply: (c) => ({ ...c, provides: [{ path: location(c) }] }), refused: under("provides") },
];

/** core/T10–core/T13 against one Installation Contract instance, judged with `check`. Pure: it registers no test. */
export function installationConformance(instance: unknown, check: Check = checkContract): CaseResult[] {
  const base = check(instance).map((f) => String(f.key));
  const results: CaseResult[] = [{ id: "core/T10", holds: base.length === 0, failures: base.map((k) => `${k}: found`) }];
  for (const [id, mutations] of [["core/T11", T11], ["core/T12", T12], ["core/T13", T13]] as const) {
    if (base.length > 0 || !isObject(instance)) {
      results.push({ id, holds: false, failures: ["core/T10 does not hold: the instance does not conform"] });
      continue;
    }
    const failures: string[] = [];
    for (const m of mutations) {
      const mutated = m.apply(instance);
      const failure = mutated === undefined ? `${m.key}: cannot apply` : m.refused(check(mutated).map((f) => String(f.key))) ? undefined : `${m.key}: not refused`;
      if (failure && !failures.includes(failure)) failures.push(failure);
    }
    results.push({ id, holds: failures.length === 0, failures });
  }
  return results;
}
