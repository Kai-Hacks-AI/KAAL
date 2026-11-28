// Id claims (core/C251): an id of a numbered kind is claimed before content uses it. A claim is one
// file, `<kind>-<id>.json`, holding `{ capability, kind, id }`. Core judges the claims and the uses
// it is given and nothing else (core/N34): it reads no file, takes no branch and names no host. The
// folder the claims live in, the first claimable number of each kind and the owner of each use are
// the adopter's data. `ID_CLAIM_LANE` is the one row of the fast lane's table that this payload
// needs (core/A69); the lane itself belongs to Release.

/** The row for the lane's table (release/C191): the root, the name pattern whose capture is the uniqueness key, and add-only. */
export const ID_CLAIM_LANE = Object.freeze({
  kind: "id-claim",
  roots: Object.freeze(["packages/kaal-core/00-claims/"]),
  name: "^([a-z]+-[1-9][0-9]*)\\.json$",
  allow: "^packages/kaal-core/00-claims/$",
  status: Object.freeze(["A"]),
});

export interface Claim {
  readonly name: string;
  readonly content: unknown;
}
export interface Use {
  readonly capability: string;
  readonly kind: string;
  readonly id: number;
  readonly path: string;
  /** True for a record the change under judgement adds, false for one that already exists. */
  readonly added: boolean;
}
export interface IdFinding {
  readonly rule: "mismatch" | "duplicate" | "below-start" | "unclaimed" | "foreign" | "reused";
  /** The claim file or the record the finding is about. */
  readonly at: string;
  readonly detail?: string;
}
export type IdVerdict = { verdict: "pass" | "fail"; findings: IdFinding[] } | { verdict: "unknown"; fact: "claims" | "used" | "from"; findings: [] };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const positive = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0;
const word = (v: unknown): v is string => typeof v === "string" && /^[a-z]+$/.test(v);

interface Shaped {
  readonly capability: string;
  readonly kind: string;
  readonly id: number;
}
/** The claim's content when it is exactly `{ capability, kind, id }`, else undefined. */
function shaped(content: unknown): Shaped | undefined {
  if (!isObject(content)) return undefined;
  if (Object.keys(content).sort().join() !== "capability,id,kind") return undefined;
  const { capability, kind, id } = content;
  return typeof capability === "string" && capability !== "" && word(kind) && positive(id) ? { capability, kind, id } : undefined;
}
const claimsOk = (v: unknown): v is Claim[] => Array.isArray(v) && v.every((c) => isObject(c) && typeof c.name === "string");
const fromOk = (v: unknown): v is Record<string, number> => isObject(v) && Object.values(v).every(positive);
const useOk = (v: unknown): v is Use =>
  isObject(v) && typeof v.capability === "string" && v.capability !== "" && typeof v.kind === "string" && positive(v.id) && typeof v.path === "string" && v.path !== "" && typeof v.added === "boolean";

const unknown = (fact: "claims" | "used" | "from"): IdVerdict => ({ verdict: "unknown", fact, findings: [] });
const order = (a: IdFinding, b: IdFinding) => (a.rule + a.at + (a.detail ?? "")).localeCompare(b.rule + b.at + (b.detail ?? ""));

/**
 * Judge the claims and the uses of one change (core/F133–core/F138, core/F140). `from` maps each
 * claimable kind to its first claimable number. An input that is not the shape it should be is
 * unknown, naming the fact, never a pass (core/N34). The verdict does not depend on order.
 */
export function judgeIdClaims(input: unknown): IdVerdict {
  if (!isObject(input) || !claimsOk(input.claims)) return unknown("claims");
  if (!Array.isArray(input.used) || !input.used.every(useOk)) return unknown("used");
  if (!fromOk(input.from)) return unknown("from");
  const { claims, from } = input as { claims: Claim[]; used: Use[]; from: Record<string, number> };
  const uses = input.used as Use[];
  const findings: IdFinding[] = [];
  const add = (rule: IdFinding["rule"], at: string, detail?: string) => findings.push(detail === undefined ? { rule, at } : { rule, at, detail });
  const start = (kind: string): number | undefined => (Object.prototype.hasOwnProperty.call(from, kind) ? from[kind] : undefined);

  const held = new Map<string, { name: string; capability: string }[]>();
  for (const claim of claims) {
    const c = shaped(claim.content);
    if (c === undefined) {
      add("mismatch", claim.name, "a claim is exactly { capability, kind, id }");
      continue;
    }
    if (claim.name !== `${c.kind}-${c.id}.json`) add("mismatch", claim.name, `the name must be ${c.kind}-${c.id}.json`);
    const first = start(c.kind);
    if (first === undefined) add("mismatch", claim.name, `${c.kind} has no first claimable number`);
    else if (c.id < first) add("below-start", claim.name, `${c.kind} ids start at ${first}`);
    const key = `${c.kind}-${c.id}`;
    held.set(key, [...(held.get(key) ?? []), { name: claim.name, capability: c.capability }]);
  }
  for (const [key, list] of held) {
    if (list.length > 1) add("duplicate", key, [...new Set(list.map((l) => l.capability))].sort().join(", "));
  }

  const records = new Map<string, Use[]>();
  for (const u of uses) {
    const first = start(u.kind);
    if (first === undefined) continue;
    const own = `${u.capability}\n${u.kind}-${u.id}`;
    records.set(own, [...(records.get(own) ?? []), u]);
    if (u.id < first) {
      if (u.added) add("below-start", u.path, `${u.kind} ids start at ${first}`);
      continue;
    }
    const claimed = held.get(`${u.kind}-${u.id}`) ?? [];
    if (claimed.length === 0) add("unclaimed", u.path, `${u.kind}-${u.id}`);
    else if (!claimed.some((c) => c.capability === u.capability)) add("foreign", u.path, `${u.kind}-${u.id} is claimed by ${[...new Set(claimed.map((c) => c.capability))].sort().join(", ")}`);
  }
  for (const group of records.values()) {
    const paths = new Set(group.map((u) => u.path));
    if (paths.size < 2) continue;
    for (const u of group) if (u.added) add("reused", u.path, `${u.capability} already gives ${u.kind}-${u.id} to another record`);
  }
  findings.sort(order);
  return { verdict: findings.length === 0 ? "pass" : "fail", findings };
}

/**
 * The next number to claim for a kind (core/F139): one above the highest claim of that kind, or the
 * kind's first claimable number when there is none. It never fills a gap and reserves nothing; its
 * answer stands only until a claim lands. `{ id: null, reason }` when it cannot answer.
 */
export function nextClaim(claims: unknown, from: unknown, kind: unknown): { id: number } | { id: null; reason: string } {
  if (!claimsOk(claims)) return { id: null, reason: "claims cannot be read" };
  if (!fromOk(from)) return { id: null, reason: "from cannot be read" };
  if (typeof kind !== "string" || !Object.prototype.hasOwnProperty.call(from, kind)) return { id: null, reason: `${String(kind)} has no first claimable number` };
  let top = 0;
  for (const claim of claims) {
    const c = shaped(claim.content);
    if (c === undefined) return { id: null, reason: `${claim.name} cannot be read` };
    if (c.kind === kind && c.id > top) top = c.id;
  }
  return { id: Math.max(top + 1, from[kind]) };
}
