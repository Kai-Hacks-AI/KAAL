export interface Package {
  /** The ecosystem whose realization described the artifact, such as "npm". */
  ecosystem: string;
  name: string;
  version: string;
  /** The SHA-256 of the artifact's bytes, 64 lowercase hexadecimal digits. */
  sha256: string;
}
export interface Tool {
  /** The ecosystem tool that described the artifact, such as "npm". */
  name: string;
  /** Its version, exactly as it printed it. */
  version: string;
}
export interface Measurement {
  package: Package;
  tool: Tool;
  /** The artifact's length in bytes, from its own bytes. */
  packed: number;
  /** The sum of its files' sizes, as the tool reported them. */
  unpacked: number;
  /** Every file, by path relative to the package root, sorted by path. */
  files: { path: string; size: number }[];
}
export interface Attribution {
  groups: { group: string; bytes: number; files: number }[];
  unattributed: { bytes: number; files: number };
  unpacked: number;
}
export interface Delta {
  before: number;
  after: number;
  delta: number;
}
export interface Comparison {
  before: Package;
  after: Package;
  packed: Delta;
  unpacked: Delta;
  /** One entry per named group, in the order given, then `null` for the unattributed bytes. */
  groups: ({ group: string | null } & Delta)[];
  /** Every path whose size changed, or that was added or removed. */
  paths: ({ path: string } & Delta)[];
  added: string[];
  removed: string[];
}
export interface Limits {
  /** The most files the tool may report. */
  files: number;
  /** The most UTF-8 bytes in one path. */
  path: number;
  /** The most unpacked bytes the tool may report. */
  unpacked: number;
  /** The most characters the tool may write as its report. */
  output: number;
}
export const LIMITS: Readonly<Limits>;
/** `npm`, when given, is the absolute location of a Node script that behaves as npm (packaging/A13). */
export function measure(artifact: string, options: { work: string; limits?: Partial<Limits>; npm?: string }): Promise<Measurement>;
export function attribute(measurement: Measurement, groups: string[]): Attribution;
export function compare(before: Measurement, after: Measurement, groups?: string[]): Comparison;
export function write(measurement: Measurement): string;
export function read(record: string): Measurement;
export function report(subject: Measurement | Comparison, options?: { format?: "text" | "json" }): string;
