// Shared by the C144 RED Cases: the scratch-repository helpers of the C143 Cases, and a repository's declared Delivery paths.
import { ALWAYS } from "../../../../packages/kaal-guard/test/acceptance/discovery-support.mjs";
export * from "../../../../packages/kaal-guard/test/acceptance/discovery-support.mjs";
/** Where a repository declares its Delivery paths (provisional name and shape; the DO fixes them), beside the always-run file. */
export const DELIVERY = ALWAYS.replace(/kaal-guard\.json$/, "delivery.json");
/** The declaration's text: the globs of the paths that are Delivery, relative to the repository root. */
export const delivery = (...paths) => JSON.stringify({ paths }, null, 2);
/** What a KAAL-like repository declares. The Cases name these only to declare them; Guard names none. */
export const KAAL_DELIVERY = delivery(".github/**", ".githooks/**", ".kaal/**", "*");
