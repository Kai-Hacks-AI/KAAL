// PROVISIONAL, preservation: what a candidate KAAL directory must keep of a
// baseline KAAL directory that was already admitted. Two operations over two
// KAAL directories, and nothing else:
//
//   preserveChanges  every Change closed in the baseline is still closed, with
//                    the same identity, in the candidate (where it lies is free)
//   preserveSeals    every Node seal of the baseline is still sealed in the
//                    candidate, and the Kernel (core/KERNEL.md) has the same
//                    identity
//
// Each returns the reasons it refuses, empty exactly when the candidate
// preserves. They express preservation over KAAL itself and know no repository
// layout, no package, no Git, GitHub, branch, PR or CI: whatever hosts the
// lineage supplies the two directories and enforces the verdict. Tree and
// Change seals are not looked at here beyond closure, which is identity-based;
// making a pushed seal of any kind unremovable and immutable is a distinct
// hardening and is not done here.
import { existsSync, lstatSync } from "node:fs";
import { join } from "node:path";
import { closedChanges } from "./changes.js";
import { identity, markers } from "./sealing.js";

/** Where the Kernel lies in a KAAL directory; its identity is the SHA-256 of its exact bytes. */
export const KERNEL = "core/KERNEL.md";

/** Every Change closed in the baseline is closed in the candidate with the same identity. */
export function preserveChanges(baseline: string, candidate: string): string[] {
  const now = new Set(closedChanges(candidate).map((c) => c.id));
  return closedChanges(baseline)
    .filter(({ id }) => !now.has(id))
    .map(({ path, id }) => `the Change ${path} is closed in the baseline as ${id}, but no closed Change with that identity is in the candidate`);
}

const kernelId = (kaalDir: string): string | undefined => {
  const file = join(kaalDir, KERNEL);
  return existsSync(file) && lstatSync(file).isFile() ? identity.artifactId(file) : undefined;
};

/** Every Node seal of the baseline is a seal of the candidate, and the Kernel keeps its identity. */
export function preserveSeals(baseline: string, candidate: string): string[] {
  const reasons: string[] = [];
  const now = new Set(markers.sealed(join(candidate, "seals")));
  for (const id of markers.sealed(join(baseline, "seals")))
    if (!now.has(id)) reasons.push(`the Node seal ${id} is in the baseline, but it is not a seal of the candidate`);
  const before = kernelId(baseline);
  if (before !== undefined) {
    const after = kernelId(candidate);
    if (after === undefined) reasons.push(`the Kernel ${KERNEL} is in the baseline as ${before}, but the candidate has none`);
    else if (after !== before) reasons.push(`the Kernel ${KERNEL} is ${before} in the baseline, but ${after} in the candidate`);
  }
  return reasons;
}
