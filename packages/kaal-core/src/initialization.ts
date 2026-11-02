// Internal C40 preparation. This is not a declaration loader or a public API.
// Owner-approved delivery bindings and lifecycle integration remain separate.
import type { Kind } from "./register.js";
import type { Ref } from "./node.js";
import type { Files } from "./payload.js";

export interface RequiredContribution {
  readonly owner: string;
  readonly kind: Kind;
  readonly name: string;
  readonly reference: Ref;
  readonly files: Record<string, string | Uint8Array>;
}

export function planInitialization(_present: Files, _required: readonly RequiredContribution[]): Files | undefined {
  throw new Error("initialization preflight is not implemented");
}

export async function initializeContributions(_dir: string, _required: readonly RequiredContribution[]): Promise<string[]> {
  throw new Error("initialization preflight is not implemented");
}
