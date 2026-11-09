// The held-copy classifier (packaging/C28: F53 to F57, N13, A28). A pure function of one neutral
// fact: it reaches no file, network or clock, and names no package, consumer or role.
import { REGISTRY_TARBALL } from "./registry.mjs";

const PLAIN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const parts = (v) => v.split(".").map(Number);

/** Is plain version `a` strictly lower than plain version `b`? */
function lower(a, b) {
  const x = parts(a);
  const y = parts(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i];
  return false;
}

const failure = (reason) => ({ verdict: "verified failure", reason });

/**
 * Judge what an installation host holds for one package against the packed tarball.
 * @param {{ package: string, at: string, depth: number, consumer: string | null, held: string, packed: string, integrity: string, packedIntegrity: string, resolved?: string | null }} fact
 * @returns {{ verdict: "match" | "pin-behind" | "verified failure", reason: string }}
 */
export function classifyHeld(fact) {
  const { package: name, at, depth, consumer, held, packed, integrity, packedIntegrity, resolved } = fact;
  const subject = `${name} at ${at}`;
  if (typeof integrity === "string" && integrity !== "" && integrity === packedIntegrity) return { verdict: "match", reason: `${subject} holds the packed bytes` };
  if (!Number.isInteger(depth) || depth < 1) return failure(`${subject}: the depth is not known, so the copy cannot be placed`);
  if (depth === 1) return failure(`${subject} is a top-level copy with other bytes than the packed ${packed}`);
  if (typeof held !== "string" || typeof packed !== "string" || !PLAIN.test(held) || !PLAIN.test(packed)) {
    return failure(`${subject}: held ${JSON.stringify(held)} and packed ${JSON.stringify(packed)} are not both plain x.y.z versions, so they cannot be compared`);
  }
  if (!lower(held, packed)) return failure(`${subject}: held ${held} is not older than the packed ${packed}`);
  if (typeof resolved !== "string" || !REGISTRY_TARBALL.test(resolved)) return failure(`${subject}: held ${held} did not come from a registry (${JSON.stringify(resolved ?? null)}), so it may be a replaced copy`);
  if (typeof consumer !== "string" || consumer === "") return failure(`${subject}: the consumer of the nested copy is not named`);
  return { verdict: "pin-behind", reason: `${name} ${held} is held under ${consumer} while ${packed} was packed (nested, from a registry, strictly older)` };
}
