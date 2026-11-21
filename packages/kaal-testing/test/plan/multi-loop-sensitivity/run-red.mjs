// Runs the testing/C69 planned RED Cases and prints each Case's outcome.
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir).filter((f) => /^T\d+\.(red|test)\.mjs$/.test(f)).sort();

let red = 0;
let green = 0;
let error = 0;

for (const f of files) {
  const mod = await import(pathToFileURL(join(dir, f)).href);
  try {
    await mod.run();
    green += 1;
    console.log(`GREEN  ${mod.id} (${f}) [${mod.tests.join(", ")}]`);
  } catch (err) {
    if (err?.code === "ERR_ASSERTION") {
      red += 1;
      console.log(`RED    ${mod.id} (${f}) [${mod.tests.join(", ")}]: ${err.message.split("\n")[0]}`);
    } else {
      error += 1;
      console.log(`ERROR  ${mod.id} (${f}) [${mod.tests.join(", ")}]: ${err?.stack ?? err}`);
    }
  }
}

console.log(`Summary: ${red} RED-observed, ${green} GREEN, ${error} ERROR`);
if (error > 0) process.exitCode = 2;
