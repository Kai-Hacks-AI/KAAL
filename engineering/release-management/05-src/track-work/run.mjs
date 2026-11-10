// track Work: `node run.mjs --role cto|cpo [--repo owner/name]`. Read-only; prints what the role can work on next.
import { execFileSync } from "node:child_process";
import { gather } from "./gather.mjs";
import { render, trackWork } from "./track-work.mjs";

const args = process.argv.slice(2);
const opt = (flag) => args[args.indexOf(flag) + 1];
const role = args.includes("--role") ? opt("--role") : undefined;
const repo = args.includes("--repo") ? opt("--repo") : "Kai-Hacks-AI/KAAL";
if (role !== "cto" && role !== "cpo") {
  console.error("usage: node run.mjs --role cto|cpo [--repo owner/name]");
  process.exit(2);
}
const gh = (a) => JSON.parse(execFileSync("gh", ["api", ...a], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
console.log(render(trackWork(await gather(gh, repo), { role }), { role }));
