// INTERIM Engineering ownership (Kai, 9 Nov 2026: "Engineering can own things before a package is up and running"): the
// acceptance lane's pin-behind rule of foundation/C19. It moves to Packaging when Packaging is installed; Testing's held
// PLAN/DO (#1286/#1288, Cases T141 to T147) are the reference for the semantics.
//
// Testing's findings() fails any installed package whose bytes differ from the packed tarball. Under C19 a consumer may
// stay on an older published copy, which npm nests under that consumer. This reads the same evidence Testing read (what
// each host holds) and turns exactly those findings, and no others, from a verified failure into a visible pin-behind:
// the held entry is nested (more than one node_modules/ segment), and its version and the packed version are plain
// x.y.z with the held one strictly below. Top-level, same, newer, odd or missing versions stay verified failures.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { compare } from "../acceptance/pin-ratchet/classify.mjs";

const PLAIN = /^\d+\.\d+\.\d+$/;

/** Per recorded host, the packages npm records it holds, or { unreadable } (the same read Testing makes). */
export async function readHolds(records) {
  const holds = {};
  for (const { host } of records) {
    try {
      holds[host] = JSON.parse((await readFile(join(host, "node_modules", ".package-lock.json"))).toString("utf8")).packages;
    } catch (e) {
      holds[host] = { unreadable: e.message };
    }
  }
  return holds;
}

/**
 * @param {{ manifest: Record<string, { integrity: string, version?: string }>, records: { scenario: string, host: string }[],
 *           findings: { kind: string, subject: string, evidence: string }[], holds: Record<string, object> }} input
 * @returns the findings, with each nested strictly-older mismatch turned into { kind: "pin-behind", ... }.
 */
export function reclassify({ manifest, records, findings, holds }) {
  // The pin-behind entries per (scenario, Testing's exact evidence text): identical texts are matched by count, so a
  // top-level copy with the same registry URL is never excused by a nested one.
  const budget = new Map();
  const detail = new Map();
  for (const { scenario, host } of records) {
    const held = holds[host];
    if (!held || held.unreadable) continue;
    for (const [at, entry] of Object.entries(held)) {
      const name = entry.name ?? at.split("node_modules/").pop();
      const packed = manifest[name];
      if (!packed || entry.integrity === packed.integrity) continue;
      const nested = at.split("node_modules/").length > 2;
      if (!nested || !PLAIN.test(String(entry.version)) || !PLAIN.test(String(packed.version)) || compare(entry.version, packed.version) >= 0) continue;
      const evidence = `${host} holds ${name} from ${entry.resolved ?? "elsewhere"}, not the packed tarball`;
      const key = `${scenario}\0${evidence}`;
      budget.set(key, (budget.get(key) ?? 0) + 1);
      const consumer = at.slice(0, at.lastIndexOf("/node_modules/")).split("node_modules/").pop();
      if (!detail.has(key)) detail.set(key, `pin-behind: ${consumer} in ${host} stays on ${name}@${entry.version}, packed ${packed.version} (fix soon; interim Engineering rule, foundation/C19)`);
    }
  }
  return findings.map((f) => {
    if (f.kind !== "verified failure") return f;
    const key = `${f.subject}\0${f.evidence}`;
    const left = budget.get(key) ?? 0;
    if (left === 0) return f;
    budget.set(key, left - 1);
    return { kind: "pin-behind", subject: f.subject, evidence: detail.get(key) };
  });
}
