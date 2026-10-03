// check-kaal-agent [--agents <file>] [--kaal <dir>]
// Does this AGENTS.md have the expected KAAL wiring? Exit 0: yes. Exit 1: no.
// It never repairs anything; wire-kaal-agent establishes the wiring.
import { existsSync, readFileSync } from "node:fs";
import { checkWiring } from "./agents-md.js";
import { parse } from "./args.js";

const { agentsFile, kaalDir } = parse(process.argv.slice(2), "usage: check-kaal-agent [--agents <file>] [--kaal <dir>]");
const problems = checkWiring(agentsFile, existsSync(agentsFile) ? readFileSync(agentsFile, "utf8") : undefined, kaalDir);
for (const problem of problems) console.error(problem);
process.exit(problems.length === 0 ? 0 : 1);
