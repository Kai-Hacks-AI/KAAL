// Gives the contracts driver, and only it, the racing Hosting in hosting.mjs.
const DRIVER = new URL("../measure.mjs", import.meta.url).href;
const STAND_IN = new URL("./hosting.mjs", import.meta.url).href;

export async function resolve(specifier, context, next) {
  return specifier === "@kaihacksai/kaal-hosting" && context.parentURL === DRIVER ? { url: STAND_IN, shortCircuit: true } : next(specifier, context);
}
