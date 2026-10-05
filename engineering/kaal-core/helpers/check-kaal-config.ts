// check-kaal-config [<kaal-dir>]
// Checks an installed KAAL against the Core configuration it carries
// (`<kaal-dir>/core/config`; the KAAL directory defaults to `.kaal`). The check
// is Core's, private to the package and reached in the built file; this is only
// its command. Exits 0 if the instance conforms, 1 if not, naming each
// non-conformance, 2 on bad usage. It never repairs. It knows nothing of Git,
// branches, pull requests or GitHub: controls outside Core call this command.
import { existsSync } from "node:fs";
import { resolve } from "node:path";

type Machinery = typeof import("../../../packages/kaal-core/dist/config.js");
const { checkConfig }: Machinery = await import(new URL("../../../../packages/kaal-core/dist/config.js", import.meta.url).href);

const args = process.argv.slice(2);
if (args.length > 1) {
  console.error("usage: check-kaal-config [<kaal-dir>]");
  process.exit(2);
}
const dir = resolve(process.env.INIT_CWD ?? process.cwd(), args[0] ?? ".kaal");
if (!existsSync(dir)) {
  console.error(`${dir} is not a directory`);
  process.exit(2);
}
const problems = checkConfig(dir);
for (const problem of problems) console.error(problem);
process.exit(problems.length === 0 ? 0 : 1);
