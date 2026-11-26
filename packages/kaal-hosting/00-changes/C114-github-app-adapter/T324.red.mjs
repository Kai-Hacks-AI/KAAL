// hosting/T324 draft (hosting/C114): the adapter stays behind Hosting and handles no secret by itself.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { it } from "node:test";
import { fileURLToPath } from "node:url";

it("hosting/T324: the App adapter modules import no node:fs, node:child_process or node:http and read no environment variable", () => {
  for (const name of ["app-manifest", "app-token", "app-reads", "app-logo"]) {
    const file = fileURLToPath(new URL(`./github/${name}.js`, import.meta.resolve("@kaihacksai/kaal-hosting")));
    assert.ok(existsSync(file), `${name} is shipped`);
    const text = readFileSync(file, "utf8");
    assert.doesNotMatch(text, /from ["']node:(fs|child_process|http|https)["']|require\(["']node:(fs|child_process)/, name);
    assert.doesNotMatch(text, /process\.env/, `${name} reads no environment variable`);
  }
});
