// install-kaal [--into <dir>]
// Makes a checkout hold what the packages deliver for the Skills it has
// installed, as Core reports them: the KAAL directory (Core, registered
// Skills, seals) and the host's Agent Skills. A fresh checkout gets Core only;
// a Skill enters by being registered through Core, not by being named here.
// Nothing is authored here; `.kaal/changes` is never touched. Idempotent.
// Refuses, and writes nothing, if a sealed file would take other bytes.
import { delivery } from "./delivery.js";
import { parse } from "./args.js";
import { install } from "./state.js";

const { target, select } = parse(process.argv.slice(2), "usage: install-kaal [--into <dir>] [--select <Node ID>]...", true);
try {
  install(target, await delivery(target, undefined, select));
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
