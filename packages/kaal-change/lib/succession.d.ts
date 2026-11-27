export interface SuccessionRecord { identity: string; text: string }
export interface Edge { from: string; to: string; pin: string; because: string }
export type SuccessionFinding =
  | { kind: 'malformed'; change: string; predecessor: string; reason: string }
  | { kind: 'duplicate' | 'not-hard' | 'unresolved'; change: string; predecessor: string }
  | { kind: 'stale'; change: string; predecessor: string; pinned: string; present: string }
  | { kind: 'cycle'; changes: string[] }
  | { kind: 'derived-stated' | 'overlap-stated'; change: string; key: string }
  | { kind: 'undeclared'; change: string };
export interface Succession {
  findings: SuccessionFinding[];
  edges: Edge[];
  /** The Changes that succeed the given one, derived from the entries of the other records. */
  successors(identity: string): string[];
}
/** `pinOf` derives the pin from a record's exact bytes: the SHA-256, lowercase hexadecimal. */
export function readSuccession(records: readonly SuccessionRecord[], options: { pinOf: (text: string) => string; require?: readonly string[] }): Succession;
