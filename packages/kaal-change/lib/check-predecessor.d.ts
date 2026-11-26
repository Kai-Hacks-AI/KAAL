import type { SuccessionFinding, SuccessionRecord } from './succession.mjs';
export type PredecessorFinding =
  | SuccessionFinding
  | { kind: 'elsewhere' | 'undelivered'; change: string; predecessor: string }
  | { kind: 'unreadable'; fact: 'pinOf' | 'main' | 'carried' | 'elsewhere' | 'delivered' };
export interface PredecessorResult { kind: 'pass' | 'fail' | 'unknown'; findings: PredecessorFinding[]; note?: string }
export function checkPredecessor(facts: {
  pinOf: (text: string) => string;
  main: readonly SuccessionRecord[];
  carried: readonly SuccessionRecord[];
  elsewhere: readonly SuccessionRecord[];
  delivered: readonly string[];
}): PredecessorResult;
