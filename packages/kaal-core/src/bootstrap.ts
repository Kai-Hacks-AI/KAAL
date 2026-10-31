import { readFrontmatter } from "#node/form";
import { Admitted } from "./admitted.js";
import { HostingError, initialize, kind, read } from "kaal-hosting";
import { evaluate, type Engine, type EvaluateOptions } from "./engine.js";
import { KaalError, sha256 } from "./node.js";
import { foundation, payload, type Files } from "./payload.js";
import { assemble, REGISTRATION_SCHEMA, REGISTRATION_TYPE, type Assembly, type RegistrationStatement } from "./registration.js";

/**
 * Materialize an Engine from the foundational payload into `dir` (a host's
 * `.kaal/`). Core decides; Hosting publishes. A missing or empty directory
 * receives the payload through Hosting's `initialize`: a missing one appears
 * complete or not at all, and an empty one is kept, never removed or replaced
 * (it may be the current directory). An existing Engine is recognized by
 * identity, not layout: if it already verifies (the Kernel present by its
 * exact bytes, the six foundational Nodes admitted by their exact ids, every
 * Node admitted), nothing is written, wherever its files are. Any other
 * existing directory, and anything at `dir` that is not a directory, is
 * refused and nothing is written. Returns the paths written.
 */
export async function bootstrap(dir: string): Promise<string[]> {
  return bootstrapWith(dir, {});
}

/**
 * `bootstrap`, publishing `extra` beside the payload in the same `initialize`, so the Engine and
 * those files appear together or not at all (core/C19). Internal: no entry point exports it.
 */
export async function bootstrapWith(dir: string, extra: Files): Promise<string[]> {
  const what = await kind(dir);
  if (what === "file" || what === "other") throw new KaalError(`${dir} exists and is not a valid Engine; nothing was written:\n  ${dir} is not a directory`);
  if (what === "directory") {
    const files = await read(dir);
    if (Object.keys(files).length > 0) {
      const existing = check(files);
      if (existing.ok) return [];
      throw new KaalError(`${dir} exists and is not a valid Engine; nothing was written:\n  ${existing.problems.join("\n  ")}`);
    }
  }
  try {
    return await initialize(dir, { ...payload(), ...extra });
  } catch (e) {
    if (e instanceof HostingError && e.code === "NOT_EMPTY") throw new KaalError(`${dir} exists and is not a valid Engine; nothing was written:\n  ${e.message}`);
    throw e;
  }
}

export interface Verification {
  ok: boolean;
  problems: string[];
  engine: Engine;
  /** The assembled registrations, when the Engine holds any (core/A28, core/F56). */
  registrations?: { paths: string[]; assembly: Assembly };
}

/** Verify an Engine's files; see `verify`. */
export function check(files: Files, options: EvaluateOptions = {}): Verification {
  const problems: string[] = [];
  const f = foundation();
  if (!Object.values(files).some((bytes) => sha256(bytes) === f.kernel)) problems.push(`the Kernel (${f.kernel}) is not present`);
  // Core's own Type, `Core/Registration`, is always validated against Core's schema (core/A25).
  const engine = evaluate(files, { ...options, types: { ...options.types, [REGISTRATION_TYPE]: REGISTRATION_SCHEMA } });
  const admitted = new Admitted(engine.nodes);
  for (const ref of [f.node, f.definition, f.capability, f.agent, f.skill, f.extension]) {
    if (!admitted.resolve(ref)) problems.push(`foundational Node ${ref.name} (${ref.id}) is not admitted`);
  }
  for (const r of engine.rejected) problems.push(`${r.path}: ${r.reason}`);
  for (const a of engine.artifacts) {
    if (a.state === "unknown" || a.state === "invalid") problems.push(`${a.path}: ${a.type} is ${a.state}: ${a.findings.map((f) => (f.key === null ? f.rule : `${f.key} (${f.rule})`)).join("; ")}`);
  }
  // Registrations, among the typed artifacts the Engine recognizes, are assembled (core/A28). A
  // finding fails verification; a cycle, an untraced instance, a shared term or Graph's absence never does (core/F56).
  const paths = engine.artifacts.filter((a) => a.type === REGISTRATION_TYPE && a.state !== "invalid" && a.state !== "unknown").map((a) => a.path);
  if (paths.length === 0) return { ok: problems.length === 0, problems, engine };
  const assembly = assemble(paths.map((p) => readFrontmatter(files[p]) as unknown as RegistrationStatement));
  for (const f of assembly.findings) problems.push(`registration: ${f.rule}: ${JSON.stringify(Object.fromEntries(Object.entries(f).filter(([k]) => k !== "rule" && k !== "verdict")))}`);
  return { ok: problems.length === 0, problems, engine, registrations: { paths, assembly } };
}

/**
 * Verify an Engine: the Kernel is present by its exact bytes, the six
 * foundational Nodes are admitted by their exact ids, every file that claims
 * to be a Node is admitted, and no typed artifact's Type is unknown, or
 * invalid against a supplied schema (core/F32). An unregistered Type does not
 * fail verification, and is never reported as verified: `engine.artifacts`
 * lists it. Locations are not consulted, and no file is changed.
 */
export async function verify(dir: string, options: EvaluateOptions = {}): Promise<Verification> {
  if ((await kind(dir)) !== "directory") return { ok: false, problems: [`${dir} is not an Engine directory`], engine: evaluate({}) };
  return check(await read(dir), options);
}

/** Write the foundational Core payload into `outDir`, which must not exist or be empty. Returns the paths written. */
export async function exportPayload(outDir: string): Promise<string[]> {
  const what = await kind(outDir);
  if (what === "file" || what === "other") throw new KaalError(`${outDir} exists and is not an empty directory`);
  try {
    return await initialize(outDir, payload());
  } catch (e) {
    if (e instanceof HostingError && e.code === "NOT_EMPTY") throw new KaalError(`${outDir} exists and is not an empty directory`);
    throw e;
  }
}
