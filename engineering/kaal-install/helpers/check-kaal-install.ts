// check-kaal-install [--into <dir>]
// Does this checkout hold what the packages currently deliver? Exit 0: yes.
// Exit 1: no, naming what differs. It never repairs; install-kaal does. The
// committed bytes are never the authority for package-derived state, and
// `.kaal/changes` is outside the question.
import { delivery } from "./delivery.js";
import { parse } from "./args.js";
import { check } from "./state.js";

const { target } = parse(process.argv.slice(2), "usage: check-kaal-install [--into <dir>]");
const problems = check(target, await delivery());
for (const problem of problems) console.error(problem);
process.exit(problems.length === 0 ? 0 : 1);
