// install-kaal [--into <dir>]
// Makes a checkout hold what the packages deliver: the KAAL directory (Core,
// registered capabilities, seals) and the host's Agent Skills. Nothing is
// authored here; `.kaal/changes` is never touched. Idempotent. Refuses, and
// writes nothing, if a sealed file would take other bytes.
import { delivery } from "./delivery.js";
import { parse } from "./args.js";
import { install } from "./state.js";

const { target } = parse(process.argv.slice(2), "usage: install-kaal [--into <dir>]");
try {
  install(target, await delivery());
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
