// Module-linker bootstrap only. Repository/file reads use the selected Hosting API.
// Selection records an installation identity; it does not authenticate that installation.
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
export async function resolveRuntime(context) {
  const require=createRequire(resolve(context,"package.json"));
  const modulePath=require.resolve("kaal-branching");
  const packagePath=require.resolve("kaal-branching/package.json");
  const load=(name)=>import(pathToFileURL(require.resolve(name)).href);
  const [product,hosting,foundation]=await Promise.all([
    load("kaal-branching"),load("kaal-hosting"),load("@kaihacksai/kaal-foundation/sha256")
  ]);
  if(typeof product.classify!=="function") throw new Error("Selected Branching runtime has no classification interface.");
  const pkg=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(await hosting.readFile(packagePath)));
  if(pkg.name!=="kaal-branching") throw new Error("Selected runtime package identity is not kaal-branching.");
  return {
    classify:product.classify,readFile:hosting.readFile,sha256:foundation.sha256,
    identity:{name:pkg.name,version:pkg.version,module:modulePath,sourceDigest:foundation.sha256(await hosting.readFile(modulePath))}
  };
}

