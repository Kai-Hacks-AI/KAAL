// PROVISIONAL, BIRTH-ONLY bootstrap policy: checking the Kernel's genesis seal,
// and recording each newly born Node's seal into the Embedding. The checking and
// recording are Core's private bootstrap sealing (packages/kaal-core/src/
// bootstrap.ts), reached in the built package; what stays here is the genesis
// seal's authority, kept outside the package so Core cannot vouch for itself.
import { readFileSync } from "node:fs";
import { payload } from "kaal-core";

type Machinery = typeof import("../../../packages/kaal-core/dist/bootstrap.js");
const machinery: Machinery = await import(new URL("../../../../packages/kaal-core/dist/bootstrap.js", import.meta.url).href);

/** The Kernel's genesis seal: a control seal kept outside the payload's seals/. */
const GENESIS_SEAL = new URL("../../kernel.sha256", import.meta.url);

/** The problems with a payload's seals; empty means none. */
export function checkBootstrap(files: Record<string, string> = payload()): string[] {
  return machinery.checkBootstrap(files, readFileSync(GENESIS_SEAL, "utf8").trim());
}

/** Seal one newly born Node of Core: its admission marker, touching no other seal. Returns the sealed ID. */
export const { sealNode } = machinery;
