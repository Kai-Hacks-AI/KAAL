// INTERIM Engineering ownership (Kai, 9 Nov 2026: "Engineering can own things before a package is up and running"): the
// acceptance lane's pin-behind rule of foundation/C19. It moves to Packaging when Packaging is installed; Testing's held
// PLAN/DO (#1286/#1288, Cases T141 to T147) are the reference for the semantics.
//
// Testing's findings() fails any installed package whose bytes differ from the packed tarball. Under C19 a consumer may
// stay on an older published copy, which npm nests under that consumer. This reads the same evidence Testing read (what
// each host holds) and turns exactly those findings, and no others, from a verified failure into a visible pin-behind:
// the held entry is nested (more than one node_modules/ segment), and its version and the packed version are plain
// x.y.z with the held one strictly below. Top-level, same, newer, odd or missing versions stay verified failures.
//
// Identity: Testing's findings carry no installed path, and a top-level and a nested copy can print the same text. So
// no finding is ever matched to an entry by its text or position. For each recorded host this takes Testing's whole
// "holds ... not the packed tarball" class out and regenerates it from the held entries themselves, one finding per
// mismatched entry, each naming its installed path. Before it does, the class must agree with the held entries (same
// count, same texts); if it does not, nothing is excused and a verified failure says so.
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

const HOLDS = (host) => (f, scenario) => f.kind === "verified failure" && f.subject === scenario && f.evidence.startsWith(`${host} holds `) && f.evidence.endsWith(", not the packed tarball");

/** The held entries of one host that differ from the packed tarball, in the shape Testing judges them. */
function mismatches({ manifest, host, held }) {
  const out = [];
  for (const [at, entry] of Object.entries(held)) {
    const name = entry.name ?? at.split("node_modules/").pop();
    const packed = manifest[name];
    if (!packed || entry.integrity === packed.integrity) continue;
    const nested = at.split("node_modules/").length > 2;
    const behind = nested && PLAIN.test(String(entry.version)) && PLAIN.test(String(packed.version)) && compare(entry.version, packed.version) < 0;
    const testing = `${host} holds ${name} from ${entry.resolved ?? "elsewhere"}, not the packed tarball`;
    const consumer = at.slice(0, at.lastIndexOf("/node_modules/")).split("node_modules/").pop();
    out.push({
      testing,
      kind: behind ? "pin-behind" : "verified failure",
      evidence: behind
        ? `pin-behind: ${consumer} in ${host} stays on ${name}@${entry.version}, packed ${packed.version} [at ${at}] (fix soon; interim Engineering rule, foundation/C19)`
        : `${testing} [at ${at}]`,
    });
  }
  return out;
}

/**
 * @param {{ manifest: Record<string, { integrity: string, version?: string }>, records: { scenario: string, host: string }[],
 *           findings: { kind: string, subject: string, evidence: string }[], holds: Record<string, object> }} input
 * @returns the findings, with each mismatched held entry judged on its own installed path: a nested, strictly older
 *          copy is { kind: "pin-behind" }, every other mismatch is a verified failure naming its path.
 */
export function reclassify({ manifest, records, findings, holds }) {
  let out = findings;
  for (const { scenario, host } of records) {
    const held = holds[host];
    if (!held || held.unreadable) continue;
    const mine = HOLDS(host);
    const theirs = out.filter((f) => mine(f, scenario));
    const ours = mismatches({ manifest, host, held });
    const agree = theirs.length === ours.length && JSON.stringify(theirs.map((f) => f.evidence).sort()) === JSON.stringify(ours.map((m) => m.testing).sort());
    if (ours.length === 0 && theirs.length === 0) continue;
    if (!agree) {
      out = [...out, { kind: "verified failure", subject: scenario, evidence: `pin-behind attribution failed: Testing reported ${theirs.length} holds findings for ${host}, the install record shows ${ours.length}; no finding was excused` }];
      continue;
    }
    const first = out.findIndex((f) => mine(f, scenario));
    const rest = out.filter((f) => !mine(f, scenario));
    const before = out.slice(0, first).filter((f) => !mine(f, scenario)).length;
    rest.splice(before, 0, ...ours.map((m) => ({ kind: m.kind, subject: scenario, evidence: m.evidence })));
    out = rest;
  }
  return out;
}

/**
 * The settled findings of one acceptance run and whether it passed: Testing's findings after the pin-behind rule, plus
 * `packaging`'s. It passes only when no finding is a verified failure; Testing's runner and ledger failures are
 * findings of that kind, so none of them can be turned into success here.
 */
export function settle({ manifest, records, findings, holds, packaging }) {
  const settled = [...reclassify({ manifest, records, findings, holds }), ...packaging];
  return { findings: settled, passed: !settled.some((f) => f.kind === "verified failure") };
}
