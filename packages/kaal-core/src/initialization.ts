// Internal C40 preparation. This is not a declaration loader or a public API.
// Owner-approved delivery bindings and lifecycle integration remain separate.
import type { Kind } from "./register.js";
import { KaalError, type Ref } from "./node.js";
import { payload, type Files } from "./payload.js";
import { check } from "./bootstrap.js";
import { planRegistration } from "./contribution.js";
import { HostingError, initialize, kind, read } from "kaal-hosting";

export interface RequiredContribution {
  readonly owner: string;
  readonly kind: Kind;
  readonly name: string;
  readonly reference: Ref;
  readonly files: Record<string, string | Uint8Array>;
}

export function planInitialization(present: Files, required: readonly RequiredContribution[]): Files | undefined {
  if (required.length === 0) throw new KaalError("no required owner contributions were supplied; nothing was written");
  // Validate every binding against the prospective Engine before considering a
  // publication. This does not acquire declarations or infer owners from npm.
  const prospective = payload();
  const plans = required.map((contribution) => {
    try {
      const plan = planRegistration(prospective, contribution.kind, contribution.name, contribution.files);
      if (!plan.ids.includes(contribution.reference.id)) throw new KaalError(`required ${contribution.reference.name} (${contribution.reference.id}) is not admitted with the declared CASE kind`);
      const verified = check({ ...prospective, ...Object.fromEntries(Object.entries(plan.files).map(([p, b]) => [`${plan.prefix}/${p}`, b])) });
      if (!verified.engine.nodes.some((n) => n.id === contribution.reference.id && n.name === contribution.reference.name)) throw new KaalError("the required declaration name does not match its identity");
      for (const [path, bytes] of Object.entries(plan.files)) prospective[`${plan.prefix}/${path}`] = bytes;
      return plan;
    } catch (e) {
      throw new KaalError(`${contribution.owner}: ${(e as Error).message}; nothing was written`);
    }
  });
  const verified = check(prospective);
  if (!verified.ok) throw new KaalError(`prospective Engine does not verify; nothing was written:\n  ${verified.problems.join("\n  ")}`);
  if (Object.keys(present).length === 0) return prospective;

  const existing = check(present);
  if (!existing.ok) throw new KaalError(`not a valid Engine; nothing was written:\n  ${existing.problems.join("\n  ")}`);
  for (const plan of plans) {
    const paths = Object.keys(present).filter((p) => p.startsWith(`${plan.prefix}/`));
    if (paths.length !== Object.keys(plan.files).length || !Object.entries(plan.files).every(([p, b]) => present[`${plan.prefix}/${p}`]?.equals(b))) {
      throw new KaalError(`incomplete initialization: ${plan.prefix}/ is missing or differs; explicit recovery is required; inspect and preserve this Engine, then initialize a separate missing or empty target; nothing was written`);
    }
  }
  return undefined;
}

export async function initializeContributions(dir: string, required: readonly RequiredContribution[]): Promise<string[]> {
  const what = await kind(dir);
  if (what !== "missing" && what !== "directory") throw new KaalError(`${dir} is not a directory; nothing was written`);
  const prospective = planInitialization(what === "directory" ? await read(dir) : {}, required);
  if (prospective === undefined) return [];
  try {
    return await initialize(dir, prospective);
  } catch (e) {
    if (e instanceof HostingError && e.code === "NOT_EMPTY") throw new KaalError(`${dir} changed before initialization; explicit recovery is required; nothing was written`);
    throw e;
  }
}
