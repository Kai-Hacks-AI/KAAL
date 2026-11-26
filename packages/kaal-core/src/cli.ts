#!/usr/bin/env node
import { basename, resolve } from "node:path";
import { Admitted } from "./admitted.js";
import { kind, read, readFile } from "@kaihacksai/kaal-hosting";
import { bootstrap, exportPayload, verify } from "./bootstrap.js";
import { loadEngine } from "./engine.js";
import { CORE_VERSION, ENGINE, initEngine, remove, upgrade, versions, type Applied } from "./lifecycle.js";
import { FormError, KaalError, readNode } from "./node.js";
import { catalog, isKind, readContribution, register } from "./register.js";
import { judgeSkill, readBaseline, type Baseline, type Instance, type Lifecycle, type Verdict } from "./skill.js";

const USAGE = `usage: kaal <command> [--engine <dir>]

  init                                     materialize the Engine from the kaal-core payload
  verify                                   verify the Engine
  list                                     list the Capabilities, Agents, Skills and Extensions the Engine holds
  resolve <name> [<id>]                    resolve a Node of the Engine by name, or by name and id
  identify <file>...                       print the id, name and type of Node files
  register <capability|agent|skill|extension> <name> <source-dir>
                                           register a contribution, atomically
  export <out-dir>                         write the foundational Core payload into an empty directory
  skill check <dir> [--json] [--baseline <file>] [--instance | --variant <id>] [--lifecycle development|published]
                                           judge a Skill directory against the Skill standard: exit 0, 1 (blocks) or 2 (cannot judge)
  version                                  print the kaal-core that runs and the version the Engine's record holds
  upgrade                                  bring ./.kaal to this kaal-core's Installation Contract
  remove                                   remove Core's installation from ./.kaal, keeping what is not Core's

--engine <dir> is the Engine directory itself, absolute or relative to the
current directory, under any name. Without it, the Engine is ./.kaal. Only
./.kaal has a record, so upgrade and remove act on it alone.`;

/** The text a person reads for a verdict: no path, so the same files give the same report wherever they sit. */
function render(v: Verdict): string {
  const lines = [`${v.skill}: ${v.level} (${v.words} words), ${v.conformance}${v.ratchet ? `, ${v.ratchet}` : ""}${v.blocks ? ", blocks" : ""}`];
  if (v.warning) lines.push(`  ${v.warning.level}: review the router, consolidate, move detail to references (${v.warning.required.join(", ")})`);
  for (const f of v.findings) lines.push(`  ${f.rule}: ${f.path}`);
  for (const f of v.repoFree) lines.push(`  repo ${f.rule}: ${f.path}:${f.line}: ${f.text}`);
  return lines.join("\n");
}

/** `kaal skill check`: the one place that reads a Skill directory, through Hosting (core/F96, core/A51). Exit 2 is "cannot judge", never clean. */
async function skillCheck(args: string[]): Promise<number> {
  const unknown = (why: string): number => {
    console.error(`kaal: cannot judge: ${why}`);
    return 2;
  };
  const rest = [...args];
  const flag = (name: string): boolean => {
    const i = rest.indexOf(name);
    if (i < 0) return false;
    rest.splice(i, 1);
    return true;
  };
  const value = (name: string): string | undefined | null => {
    const i = rest.indexOf(name);
    if (i < 0) return undefined;
    const v = rest[i + 1];
    if (v === undefined || v.startsWith("--")) return null;
    rest.splice(i, 2);
    return v;
  };
  const json = flag("--json");
  const copy = flag("--instance");
  const variant = value("--variant");
  const file = value("--baseline");
  const lifecycle = value("--lifecycle");
  const allow = value("--allow");
  if (variant === null || file === null || lifecycle === null || allow === null) return unknown("an option needs its value");
  if (copy && variant !== undefined) return unknown("--instance and --variant cannot be given together");
  if (lifecycle !== undefined && lifecycle !== "development" && lifecycle !== "published") return unknown(`unknown lifecycle ${lifecycle}`);
  if (allow !== undefined && allow !== "hosting") return unknown(`unknown allowance ${allow}`);
  const [dir, ...extra] = rest;
  if (!dir || dir.startsWith("--") || extra.length > 0) return unknown(`usage: kaal skill check <dir> [options]`);
  let baseline: Baseline | undefined;
  if (file !== undefined && lifecycle !== "published") {
    try {
      baseline = readBaseline((await readFile(file)).toString("utf8"));
    } catch (e) {
      return unknown(`the baseline cannot be read: ${(e as Error).message}`);
    }
  }
  let files: Record<string, Buffer>;
  try {
    const at = await kind(resolve(dir));
    if (at !== "directory") return unknown(`${dir} is not a directory (${at})`);
    files = await read(resolve(dir));
  } catch (e) {
    return unknown(`${dir} cannot be read: ${(e as Error).message}`);
  }
  const instance: Instance = copy ? { kind: "copy" } : variant !== undefined ? { kind: "variant", id: variant } : { kind: "skill" };
  const verdict = judgeSkill({
    name: basename(resolve(dir)),
    skillMd: files["SKILL.md"]?.toString("utf8"),
    paths: Object.keys(files).sort(),
    baseline,
    instance,
    lifecycle: (lifecycle ?? "development") as Lifecycle,
    files: Object.entries(files)
      .filter(([path, bytes]) => (path === "SKILL.md" || /^(references|scripts|assets)\//.test(path)) && !bytes.includes(0))
      .map(([path, bytes]) => ({ path, text: bytes.toString("utf8") })),
    allow: allow === undefined ? [] : [allow],
  });
  console.log(json ? JSON.stringify(verdict, null, 2) : render(verdict));
  return verdict.blocks ? 1 : 0;
}

async function main(argv: string[]): Promise<number> {
  const args = [...argv];
  if (args[0] === "skill" && args[1] === "check") return skillCheck(args.slice(2));
  let engine = resolve(".kaal");
  const at = args.indexOf("--engine");
  if (at >= 0) {
    const dir = args[at + 1];
    if (!dir || dir.startsWith("--")) throw new KaalError("--engine needs a directory");
    engine = resolve(dir);
    args.splice(at, 2);
  }
  // Core's contract and record are written relative to the repository root (core/F46, core/A22).
  const recorded = engine === resolve(ENGINE);
  const option = args.find((a) => a.startsWith("--") && a !== "--help");
  if (option) throw new KaalError(`unknown or repeated option ${option}\n\n${USAGE}`);
  const [command, ...rest] = args;
  switch (command) {
    case "init": {
      // At ./.kaal the Engine and Core's record are published together (core/F43); elsewhere there is no record (core/F46).
      const written = recorded ? await initEngine(process.cwd()) : await bootstrap(engine);
      console.log(written.length ? `bootstrapped ${engine} (${written.length} files written)` : `${engine} already holds the foundation`);
      const v = await verify(engine);
      for (const p of v.problems) console.error(p);
      return v.ok ? 0 : 1;
    }
    case "verify": {
      const v = await verify(engine);
      for (const p of v.problems) console.error(p);
      if (v.ok) console.log(`ok: ${v.engine.nodes.length} Nodes admitted`);
      for (const a of v.engine.artifacts) console.log(`${a.path}\t${a.type}\t${a.state}${a.findings.length ? `\t${a.findings.map((f) => f.rule).join("; ")}` : ""}`);
      if (v.registrations) {
        // The assembled registrations beside the Nodes and artifacts (core/F56): reports, never failures.
        const r = v.registrations.assembly;
        for (const c of r.scopes) console.log(`scope\t${c.scope}\t${c.holder}`);
        console.log(`registration\t${r.kinds.length} kinds, ${r.instances.length} instances, ${r.findings.length} findings`);
        for (const u of r.untraced) console.log(`untraced\t${u.scope}\t${u.id}`);
        for (const t of r.terms) console.log(`term\t${t.term}\tunaligned\t${t.kinds.map((k) => `${k.scope} (${k.owner})`).join(", ")}`);
        console.log(r.cycles === null ? "cycles\tunavailable: Graph's analysis is not present" : `cycles\t${r.cycles.length}`);
      }
      return v.ok ? 0 : 1;
    }
    case "list": {
      const c = await catalog(engine);
      for (const r of c.capabilities) console.log(`capability\t${r.id}\t${r.name}`);
      for (const r of c.agents) console.log(`agent\t${r.id}\t${r.name}`);
      for (const r of c.skills) console.log(`skill\t${r.id}\t${r.name}`);
      for (const r of c.extensions) console.log(`extension\t${r.id}\t${r.name}`);
      return 0;
    }
    case "resolve": {
      const [name, id] = rest;
      if (!name) break;
      const admitted = new Admitted((await loadEngine(engine)).nodes);
      const found = (id ? [{ name, id }] : admitted.named(name)).flatMap((ref) => admitted.resolve(ref) ?? []);
      if (found.length === 0) throw new KaalError(id ? `no admitted Node is ${name} (${id})` : `no admitted Node is named ${name}`);
      for (const n of found) console.log(`${n.id}\t${n.name}\t${n.type ? `${n.type.name} ${n.type.id}` : "-"}\t${n.paths.join(",")}`);
      return 0;
    }
    case "identify": {
      if (rest.length === 0) break;
      for (const file of rest) {
        const n = readNode(await readFile(file));
        console.log(`${n.id}\t${n.name}\t${n.type ? `${n.type.name} ${n.type.id}` : "-"}`);
      }
      return 0;
    }
    case "register": {
      const [kind, name, source] = rest;
      if (!kind || !isKind(kind) || !name || !source) break;
      const r = await register(engine, kind, name, await readContribution(source));
      console.log(`${r.written ? "registered" : "already registered"} ${kind} ${name}: ${r.ids.join(" ")}`);
      return 0;
    }
    case "export": {
      if (!rest[0]) break;
      const written = await exportPayload(resolve(rest[0]));
      for (const p of written) console.log(p);
      return 0;
    }
    case "version": {
      const v = recorded ? await versions(process.cwd()) : { core: CORE_VERSION, engine: [] };
      console.log(`kaal-core ${v.core}`);
      console.log(v.engine.length === 0 ? "engine unrecorded" : v.engine.length === 1 ? `engine ${v.engine[0]}` : `engine mixed (${v.engine.join(", ")})`);
      return 0;
    }
    case "upgrade":
    case "remove": {
      if (!recorded) throw new KaalError(`${command} acts only on ./${ENGINE}, which Core's record describes; ${engine} has no record, and nothing was written`);
      const done: Applied = command === "upgrade" ? await upgrade(process.cwd()) : await remove(process.cwd());
      for (const p of done.written) console.log(`written\t${p}`);
      for (const p of done.removed) console.log(`removed\t${p}`);
      for (const k of done.kept) console.log(`kept\t${k.path}\t${k.reason}`);
      console.log(command === "upgrade" ? `${ENGINE} is at kaal-core ${CORE_VERSION}` : `removed Core's installation from ${ENGINE}`);
      return 0;
    }
    case undefined:
    case "help":
    case "--help":
      console.log(USAGE);
      return 0;
  }
  console.error(USAGE);
  return 2;
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (e) {
  if (!(e instanceof KaalError) && !(e instanceof FormError) && !(e as NodeJS.ErrnoException).code) throw e;
  console.error(`kaal: ${(e as Error).message}`);
  process.exitCode = 1;
}
