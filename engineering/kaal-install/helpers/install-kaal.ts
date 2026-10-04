// install-kaal [--into <dir>] [--skill <Node name>]...
// Makes a checkout hold what the packages deliver for the Skills it has
// installed (as Core reports them) and for those named with --skill: the KAAL
// directory (Core, registered Skills, seals) and the host's Agent Skills.
// Nothing is authored here; `.kaal/changes` is never touched. Idempotent.
// Refuses, and writes nothing, if a sealed file would take other bytes.
import { delivery } from "./delivery.js";
import { parse } from "./args.js";
import { install } from "./state.js";

const { target, skills } = parse(process.argv.slice(2), "usage: install-kaal [--into <dir>] [--skill <Node name>]...", true);
try {
  install(target, await delivery(target, skills));
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
