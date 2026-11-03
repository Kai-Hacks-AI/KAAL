#!/usr/bin/env node
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Admitted } from "./admitted.js";
import { kind, readFile } from "kaal-hosting";
import { bootstrap, exportPayload, verify } from "./bootstrap.js";
import { loadEngine } from "./engine.js";
import { CORE_VERSION, ENGINE, initEngine, remove, upgrade, versions, type Applied } from "./lifecycle.js";
import { FormError, KaalError, readNode } from "./node.js";
import { record as RECORD } from "./realization.js";
import { catalog, isKind, readContribution, register } from "./register.js";

const USAGE = `usage: kaal <command> [--engine <dir>]

Installed is not registered: installing a package is not registering it. Two transactions, in this order:
  1. kaal init                              install the instance: materialize ./.kaal from the kaal-core payload
  2. kaal register capability core <dir>    register Core itself like any package, <dir> being the installed
                                            package's own capability/ directory (node_modules/<package>/capability)
Core's features that depend on its registration, such as the Registration Type Definition, are active only after step 2.
kaal init never registers. docs/operations.md in the package describes both.

  init                                     materialize the Engine from the kaal-core payload
  verify                                   verify the Engine
  list                                     list the Capabilities, Agents, Skills and Extensions the Engine holds
  resolve <name> [<id>]                    resolve a Node of the Engine by name, or by name and id
  identify <file>...                       print the id, name and type of Node files
  register <capability|agent|skill|extension> <name> <source-dir>
                                           register a contribution, atomically
  export <out-dir>                         write the foundational Core payload into an empty directory
  version                                  print the kaal-core that runs and the version the Engine's record holds
  upgrade                                  bring ./.kaal to this kaal-core's Installation Contract
  remove                                   remove Core's installation from ./.kaal, keeping what is not Core's

--engine <dir> is the Engine directory itself, absolute or relative to the
current directory, under any name. Without it, the Engine is ./.kaal. Only
./.kaal has a record, so upgrade and remove act on it alone.`;

async function main(argv: string[]): Promise<number> {
  const args = [...argv];
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
      // Installed is not registered (core/C52): Core says so only when its installation is established by its own record,
      // and registered means the Engine admits the very Node this package ships as capability/Core.md, not any Node named Core.
      const shipped = join(dirname(fileURLToPath(import.meta.url)), "..", "capability");
      if (recorded && (await kind(join(engine, RECORD.slice(ENGINE.length + 1)))) === "file" && (await kind(join(shipped, "Core.md"))) === "file") {
        const core = readNode(await readFile(join(shipped, "Core.md")));
        if (!v.engine.nodes.some((n) => n.id === core.id)) {
          const path = relative(process.cwd(), shipped).split("\\").join("/");
          console.log(`Core is installed but not registered in this Engine. Register it with: kaal register capability core ${/\s/.test(path) ? `"${path}"` : path}`);
        }
      }
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
