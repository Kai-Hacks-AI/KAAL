#!/usr/bin/env node
// kaal-sealing id|seal|verify|list: the command line of Sealing.
import { resolve } from "node:path";
import { KaalError } from "kaal-core";
import { HostingError } from "kaal-hosting";
import { artifactId, readArtifact, seal, sealed, verifySeal } from "./sealing.mjs";

const USAGE = `usage: kaal-sealing <command> [--engine <dir>]

  id <path> [--named] [--domain <domain>]    print the identity of a file or directory
  seal <path> [--named] [--domain <domain>]  seal the artifact as it now is; prints the Seal ref
  verify <path> --seal <ref>                 exit 0 if the artifact is exactly what that Seal binds;
                                             1 if the Seal is missing or corrupt, or the artifact differs
  list                                       list the refs of the intact Seals the Engine retains

--engine <dir> is the Engine directory, as for kaal. Without it, the Engine
is ./.kaal. The Engine must hold the Sealing Node.`;

/** Take `flag` and, with `value`, its argument out of `args`. */
function take(args, flag, value) {
  const at = args.indexOf(flag);
  if (at < 0) return undefined;
  if (!value) return (args.splice(at, 1), true);
  const v = args[at + 1];
  if (v === undefined || v.startsWith("--")) throw new KaalError(`${flag} needs a value`);
  args.splice(at, 2);
  return v;
}

async function main(argv) {
  const args = [...argv];
  const engine = resolve(take(args, "--engine", true) ?? ".kaal");
  const named = take(args, "--named", false) === true;
  const domain = take(args, "--domain", true);
  const ref = take(args, "--seal", true);
  const option = args.find((a) => a.startsWith("--") && a !== "--help");
  if (option) throw new KaalError(`unknown or repeated option ${option}\n\n${USAGE}`);
  const [command, path, ...extra] = args;
  const one = path !== undefined && extra.length === 0;
  const form = { named, ...(domain === undefined ? {} : { domain }) };
  switch (command) {
    case "id":
      if (!one || ref) break;
      console.log(artifactId(await readArtifact(path), form));
      return 0;
    case "seal":
      if (!one || ref) break;
      console.log(await seal(engine, await readArtifact(path), form));
      return 0;
    case "verify": {
      if (!one || !ref || named || domain !== undefined) break;
      const v = await verifySeal(engine, await readArtifact(path), ref);
      if (v.status === "ok") console.log(`ok\t${v.id}`);
      else if (v.status === "mismatch") console.error(`mismatch: the Seal binds ${v.sealed}, ${path} is ${v.id ?? "another kind of artifact"}`);
      else console.error(`${v.status}: no intact Seal ${ref} is retained in ${engine}`);
      return v.status === "ok" ? 0 : 1;
    }
    case "list":
      if (path !== undefined || ref || named || domain !== undefined) break;
      for (const r of await sealed(engine)) console.log(r);
      return 0;
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
  if (!(e instanceof KaalError) && !(e instanceof HostingError) && !e.code) throw e;
  console.error(`kaal-sealing: ${e.message}`);
  process.exitCode = 1;
}
