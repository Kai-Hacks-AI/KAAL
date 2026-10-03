// wire-kaal-agent [--agents <file>] [--kaal <dir>]
// Establishes the KAAL wiring in AGENTS.md: creates the file if missing, keeps
// everything unrelated, and is idempotent (wire, wire gives the same result).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { wireText } from "./agents-md.js";
import { parse } from "./args.js";

const { agentsFile, kaalDir } = parse(process.argv.slice(2), "usage: wire-kaal-agent [--agents <file>] [--kaal <dir>]");
try {
  const before = existsSync(agentsFile) ? readFileSync(agentsFile, "utf8") : undefined;
  const after = wireText(agentsFile, before, kaalDir);
  if (after !== before) writeFileSync(agentsFile, after);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
