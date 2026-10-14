#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { bootstrap, exportPayload, verify } from "./bootstrap.js";
import { loadEngine } from "./engine.js";
import { identify, KaalError } from "./node.js";
import { capabilities, readContribution, register } from "./register.js";

const USAGE = `usage: kaal <command> [--engine <dir>]

  init                                     materialize the Engine from the kaal-core payload
  verify                                   verify the Engine
  list                                     list the Skills and Extensions the Engine holds
  resolve <name> [<id>]                    resolve a Node of the Engine by name, or by name and id
  identify <file>...                       print the id, name and type of Node files
  register <skill|extension> <capability> <source-dir>
                                           register a contribution, atomically
  export <out-dir>                         write the foundational Core payload into an empty directory

--engine <dir> is the Engine directory itself, absolute or relative to the
current directory, under any name. Without it, the Engine is ./.kaal.`;

function main(argv: string[]): number {
  const args = [...argv];
  let engine = resolve(".kaal");
  const at = args.indexOf("--engine");
  if (at >= 0) {
    const dir = args[at + 1];
    if (!dir || dir.startsWith("--")) throw new KaalError("--engine needs a directory");
    engine = resolve(dir);
    args.splice(at, 2);
  }
  const option = args.find((a) => a.startsWith("--") && a !== "--help");
  if (option) throw new KaalError(`unknown or repeated option ${option}\n\n${USAGE}`);
  const [command, ...rest] = args;
  switch (command) {
    case "init": {
      const written = bootstrap(engine);
      console.log(written.length ? `bootstrapped ${engine} (${written.length} files written)` : `${engine} already holds the foundation`);
      const v = verify(engine);
      for (const p of v.problems) console.error(p);
      return v.ok ? 0 : 1;
    }
    case "verify": {
      const v = verify(engine);
      for (const p of v.problems) console.error(p);
      if (v.ok) console.log(`ok: ${v.engine.nodes.length} Nodes admitted`);
      return v.ok ? 0 : 1;
    }
    case "list": {
      const c = capabilities(engine);
      for (const r of c.skills) console.log(`skill\t${r.id}\t${r.name}`);
      for (const r of c.extensions) console.log(`extension\t${r.id}\t${r.name}`);
      return 0;
    }
    case "resolve": {
      const [name, id] = rest;
      if (!name) break;
      const e = loadEngine(engine);
      const found = id ? [e.resolve({ name, id })] : e.named(name);
      if (found.length === 0) throw new KaalError(`no admitted Node is named ${name}`);
      for (const n of found) console.log(`${n.id}\t${n.name}\t${n.type ? `${n.type.name} ${n.type.id}` : "-"}\t${n.paths.join(",")}`);
      return 0;
    }
    case "identify": {
      if (rest.length === 0) break;
      for (const file of rest) {
        const n = identify(readFileSync(file));
        console.log(`${n.id}\t${n.name}\t${n.type ? `${n.type.name} ${n.type.id}` : "-"}`);
      }
      return 0;
    }
    case "register": {
      const [kind, capability, source] = rest;
      if ((kind !== "skill" && kind !== "extension") || !capability || !source) break;
      const r = register(engine, kind, capability, readContribution(source));
      console.log(`${r.written ? "registered" : "already registered"} ${kind} ${capability}: ${r.ids.join(" ")}`);
      return 0;
    }
    case "export": {
      if (!rest[0]) break;
      const written = exportPayload(resolve(rest[0]));
      for (const p of written) console.log(p);
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
  process.exitCode = main(process.argv.slice(2));
} catch (e) {
  if (!(e instanceof KaalError) && !(e as NodeJS.ErrnoException).code) throw e;
  console.error(`kaal: ${(e as Error).message}`);
  process.exitCode = 1;
}
