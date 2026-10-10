#!/usr/bin/env node
// kaal-compose held    --kaal ENGINE
// kaal-compose offers  (--source DIR | --npm SPEC)... [--kaal ENGINE]
// kaal-compose install (--source DIR | --npm SPEC)... --kaal ENGINE [--skills DIR] --select NODE_ID...
// Exit 0 done, 1 refused or failed (nothing written), 2 usage.
import { fromDirectory, fromNpm, heldBy, install, Refusal, stage } from "./index.js";
import type { Offer } from "./sources.js";

const usage = "usage: kaal-compose held --kaal ENGINE | offers (--source DIR | --npm SPEC)... [--kaal ENGINE] | install (--source DIR | --npm SPEC)... --kaal ENGINE [--skills DIR] --select NODE_ID...";
const MULTI = new Set(["--source", "--npm", "--select"]);
const SINGLE = new Set(["--kaal", "--skills"]);

function parse(args: string[]): Map<string, string[]> | undefined {
  const flags = new Map<string, string[]>();
  for (let i = 0; i < args.length; i += 2) {
    const [flag, value] = [args[i], args[i + 1]];
    if (value === undefined || !(MULTI.has(flag) || SINGLE.has(flag)) || (SINGLE.has(flag) && flags.has(flag))) return undefined;
    flags.set(flag, [...(flags.get(flag) ?? []), value]);
  }
  return flags;
}

const [command, ...rest] = process.argv.slice(2);
const flags = parse(rest);
const allowed: Record<string, string[]> = { held: ["--kaal"], offers: ["--source", "--npm", "--kaal"], install: ["--source", "--npm", "--kaal", "--skills", "--select"] };
if (!flags || !(command in allowed) || [...flags.keys()].some((f) => !allowed[command].includes(f)) || (command !== "offers" && !flags.has("--kaal")) || (command === "offers" && !flags.has("--source") && !flags.has("--npm"))) {
  console.error(usage);
  process.exit(2);
}
const one = (flag: string) => flags.get(flag)?.[0];
const line = (...cells: string[]) => console.log(cells.join("\t"));

let dispose = () => {};
try {
  if (command === "held") {
    for (const h of heldBy(one("--kaal")!)) line(h.kind, h.name, h.id);
  } else {
    const offers: Offer[] = (flags.get("--source") ?? []).flatMap(fromDirectory);
    if (flags.has("--npm")) {
      const npm = fromNpm(flags.get("--npm")!);
      dispose = npm.dispose;
      offers.push(...npm.offers);
    }
    if (command === "offers") {
      const have = new Set((one("--kaal") ? heldBy(one("--kaal")!) : []).map((h) => h.id));
      for (const s of stage(offers)) {
        if (s.error) console.error(`not offered: ${s.origin}: ${s.error}`);
        for (const n of s.nodes) line(s.kind!, n.name, n.id, s.delivery, have.has(n.id) ? "held" : "");
      }
    } else {
      const done = install({ engine: one("--kaal")!, skills: one("--skills"), offers, select: flags.get("--select") ?? [] });
      for (const h of done.installed) line("installed", h.kind, h.name, h.id);
      line("wrote", String(done.wrote.length), "files");
    }
  }
} catch (e) {
  console.error(`${e instanceof Refusal ? "refused" : "error"}: ${(e as Error).message}`);
  process.exitCode = 1;
} finally {
  dispose();
}
