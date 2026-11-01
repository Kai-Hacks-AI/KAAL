// Test driver only. The caller packs once; this driver and scenarios never pack.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "kaal-hosting";
import { accept } from "kaal-testing/acceptance";
const [manifestPath, runPath] = process.argv.slice(2);
if (!manifestPath || !runPath) throw new Error("usage: node test/run-acceptance.mjs <caller-packed-manifest.json> <new-run-directory>");
const cwd = fileURLToPath(new URL("../",import.meta.url));
const manifest = JSON.parse((await readFile(resolve(manifestPath))).toString("utf8"));
const result = await accept({manifest, scenarios:[fileURLToPath(new URL("acceptance/configuration.test.mjs",import.meta.url))],run:resolve(runPath),cwd});
process.stdout.write(JSON.stringify(result,null,2)+"\n");
process.exitCode = result.passed ? 0 : 1;

