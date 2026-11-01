#!/usr/bin/env node
import { resolve } from "node:path";
import { Graph } from "@kaihacksai/kaal-graph";
import { readFile } from "@kaihacksai/kaal-hosting";
import { bootstrap, exportPayload, verify } from "./bootstrap.js";
import { loadEngine } from "./engine.js";
import { CORE_VERSION, ENGINE, initEngine, remove, upgrade, versions, type Applied } from "./lifecycle.js";
import { FormError, KaalError, readNode } from "./node.js";
import { catalog, isKind, readContribution, register } from "./register.js";

const USAGE = `usage: kaal <command> [--engine <dir>]

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
      for (const a of v.engine.artifacts) console.log(`${a.path}\t${a.type}\t${a.state}${a.findings.length ? `\t${a.findings.map((f) => f.rule).join("; ")}` : ""}`);
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
      const admitted = new Graph((await loadEngine(engine)).nodes);
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
