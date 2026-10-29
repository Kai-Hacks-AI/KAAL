export interface Package {
  /** The ecosystem whose realization read the artifact, such as "npm". */
  ecosystem: string;
  name: string;
  version: string;
  /** The SHA-256 of the artifact's bytes, 64 lowercase hexadecimal digits. */
  sha256: string;
}
export interface Measurement {
  package: Package;
  /** The artifact's bytes. */
  packed: number;
  /** The sum of its files' bytes. */
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
  /** The most bytes the archive may decompress to. */
  archive: number;
  /** The most files it may hold. */
  files: number;
  /** The most UTF-8 bytes in one path. */
  path: number;
}
export const LIMITS: Readonly<Limits>;
export function measure(artifact: Uint8Array, limits?: Partial<Limits>): Measurement;
export function attribute(measurement: Measurement, groups: string[]): Attribution;
export function compare(before: Measurement, after: Measurement, groups?: string[]): Comparison;
export function write(measurement: Measurement): string;
export function read(record: string): Measurement;
export function report(subject: Measurement | Comparison, options?: { format?: "text" | "json" }): string;
