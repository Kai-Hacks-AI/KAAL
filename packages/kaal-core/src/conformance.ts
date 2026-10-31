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
  readonly refused: (findings: readonly Finding[], instance: Contract) => boolean;
}

const PROBE = "conformance-probe";
const named = (key: string) => (findings: readonly Finding[]) => findings.some((f) => f.key === key);
const under = (prefix: string) => (findings: readonly Finding[]) => findings.some((f) => String(f.key).startsWith(prefix));
const ruled = (findings: readonly Finding[], key: string, rule: string) => findings.some((f) => f.key === key && f.rule === rule);
const isObject = (v: unknown): v is Contract => typeof v === "object" && v !== null && !Array.isArray(v);
const firstAsset = (c: Contract): Contract | undefined => (Array.isArray(c.assets) && isObject(c.assets[0]) ? c.assets[0] : undefined);
const withAsset = (c: Contract, change: (a: Contract) => Contract): Contract | undefined => {
  const a = firstAsset(c);
  return a && { ...c, assets: [change(a), ...(c.assets as unknown[]).slice(1)] };
};
/** A catalogue path that is no file asset's target and lies under no directory asset's target. */
const unowned = (c: Contract): string => {
  const targets = (Array.isArray(c.assets) ? c.assets : []).filter(isObject).map((a) => a.target).filter((t): t is string => typeof t === "string");
  for (let n = 0; ; n++) {
    const path = `${PROBE}-${n}/${PROBE}.md`;
    if (!targets.some((t) => path === t || path.startsWith(`${t}/`))) return path;
  }
};
/** The first catalogued path, whose digests a mutation replaces while every other entry stays. */
const catalogued = (c: Contract): string | undefined => (isObject(c.catalogue) ? Object.keys(c.catalogue)[0] : undefined);

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
  { key: "catalogue", apply: (c) => (isObject(c.catalogue) ? { ...c, catalogue: { ...c.catalogue, [unowned(c)]: ["0".repeat(64)] } } : undefined), refused: (f, c) => ruled(f, `catalogue.${unowned(c)}`, "no asset") },
  { key: "catalogue digest", apply: (c) => { const path = catalogued(c); return path === undefined ? undefined : { ...c, catalogue: { ...(c.catalogue as Contract), [path]: ["abc"] } }; }, refused: (f, c) => ruled(f, `catalogue.${catalogued(c)}`, "sha256") },
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
      const failure = mutated === undefined ? `${m.key}: cannot apply` : m.refused(check(mutated), instance) ? undefined : `${m.key}: not refused`;
      if (failure && !failures.includes(failure)) failures.push(failure);
    }
    results.push({ id, holds: failures.length === 0, failures });
  }
  return results;
}
