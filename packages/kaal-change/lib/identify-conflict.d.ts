import type { SuccessionRecord } from './succession.mjs';
export interface OpenChange extends SuccessionRecord { claimed: readonly string[] }
export type ConflictFinding =
  | { kind: 'conflict'; path: string; changes: [string, string]; ordered: false; resolved: false }
  | { kind: 'conflict'; path: string; changes: [string, string]; before: string; after: string; ordered: true; resolved: false }
  | { kind: 'resolved'; path: string; changes: [string, string]; before: string; after: string; ordered: true; resolved: true }
  | { kind: 'unreadable'; fact: string; change?: string };
export interface ConflictResult { kind: 'pass' | 'fail' | 'unknown'; findings: ConflictFinding[]; note?: string }
export function identifyConflict(facts: {
  pinOf: (text: string) => string;
  changes: readonly OpenChange[];
  resolved?: ReadonlyArray<{ path: string; before: string; after: string }>;
}): ConflictResult;
