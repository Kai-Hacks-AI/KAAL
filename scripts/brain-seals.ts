import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../skills/using-brain/scripts/brain.js";
import { validate } from "../skills/using-brain/scripts/validate.js";
import {
  checkChain,
  HEADS_FILE,
  LOCK_FILE,
  readHeads,
  SEAL_FILE,
  sealChain,
} from "../skills/using-seals/scripts/seals.js";

/**
 * KAAL's sealing policy for BRAIN. using-seals is the mechanism and knows
 * nothing of BRAIN; this decides what it seals: one chain per lineage, named
 * after the lineage, with one unit per learning, oldest first. A learning is
 * closed when it is sealed.
 */

const LEARNING = /^\d{2}$/;

/** Every lineage's learnings as units, oldest first: `<lineage>/YY/MM/DD/CC`. */
export function brainChains(root = ROOT): Map<string, string[]> {
  const chains = new Map<string, string[]>();
  if (!fs.existsSync(root)) return chains;
  const dirs = (dir: string) =>
    fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  for (const lineage of dirs(root)) {
    const units: string[] = [];
    // YY/MM/DD/CC are fixed-width, so sorting each level orders learnings in time.
    const walk = (dir: string, parts: string[]) => {
      if (parts.length === 4) {
        units.push([lineage, ...parts].join("/"));
        return;
      }
      for (const part of dirs(dir).filter((d) => LEARNING.test(d))) walk(path.join(dir, part), [...parts, part]);
    };
    walk(path.join(root, lineage), []);
    chains.set(lineage, units);
  }
  return chains;
}

/**
 * The chains to check: every lineage in BRAIN, and every chain recorded in the
 * heads even if its lineage is gone, so removing a whole lineage is noticed.
 */
function chainsToCheck(root: string): Map<string, string[]> {
  const chains = brainChains(root);
  for (const chain of readHeads(root).keys()) if (!chains.has(chain)) chains.set(chain, []);
  return chains;
}

/**
 * Seals every learning not yet sealed, lineage by lineage. Returns the
 * learnings it sealed. A sealed learning can never be fixed, so sealing first
 * requires the whole BRAIN to be valid and every existing seal intact, and
 * refuses before writing anything, never leaving BRAIN partly closed.
 */
export function sealBrain(root = ROOT): string[] {
  const errors = brainErrors(root);
  if (errors.length) throw new Error(`refusing to seal BRAIN:\n${errors.join("\n")}`);
  // A lineage can still fail while sealing (an entry that cannot be sealed, a
  // failed write). It rolls itself back; the lineages sealed before it are
  // rolled back here, so BRAIN is sealed all or nothing.
  const heads = path.join(root, HEADS_FILE);
  const headsBefore = fs.existsSync(heads) ? fs.readFileSync(heads) : undefined;
  const sealed: string[] = [];
  try {
    for (const [lineage, units] of brainChains(root)) if (units.length) sealed.push(...sealChain(root, lineage, units));
  } catch (e) {
    for (const unit of sealed) fs.rmSync(path.join(root, unit, SEAL_FILE), { force: true });
    if (headsBefore === undefined) fs.rmSync(heads, { force: true });
    else fs.writeFileSync(heads, headsBefore);
    throw e;
  }
  return sealed;
}

/** Every broken seal in BRAIN, lineage by lineage. */
export function checkBrain(root = ROOT): string[] {
  let chains: Map<string, string[]>;
  try {
    chains = chainsToCheck(root);
  } catch (e) {
    return [`${HEADS_FILE}: unreadable chain heads (${e instanceof Error ? e.message : String(e)})`];
  }
  return [...chains].flatMap(([lineage, units]) => checkChain(root, lineage, units));
}

/**
 * Seal state is written only by sealing on main, never by a change: a change
 * that adds, modifies or deletes a seal, the chain heads or the lock would let
 * it rewrite sealed history, which file-based seals alone cannot detect.
 * Takes `git diff --name-status --no-renames` output and returns one error per
 * seal-state path it touches.
 */
export function sealStateChanges(nameStatus: string, root = ROOT): string[] {
  const state = new Set([HEADS_FILE, LOCK_FILE]);
  const prefix = `${root.split(path.sep).join("/")}/`;
  return nameStatus
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => {
      const [status, file] = line.split("\t");
      if (!file?.startsWith(prefix)) return [];
      const inRoot = file.slice(prefix.length);
      const sealState = state.has(inRoot) || inRoot === SEAL_FILE || inRoot.endsWith(`/${SEAL_FILE}`);
      return sealState ? [`${file}: seal state may only be written by sealing on main (${status})`] : [];
    });
}

/** Everything that stops a BRAIN from being sealed: invalid nodes and broken seals. */
export function brainErrors(root = ROOT): string[] {
  return [...validate(root), ...checkBrain(root)];
}
