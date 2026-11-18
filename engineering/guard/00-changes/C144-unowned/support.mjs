// Shared by the C144 RED Cases: the scratch-repository helpers of the C143 Cases, and the Delivery list.
export * from "../../../../packages/kaal-guard/test/acceptance/discovery-support.mjs";
import { ALWAYS as KAAL_ROOT_FILE } from "../../../../packages/kaal-guard/test/acceptance/discovery-support.mjs";
/** Where the declared Delivery areas are listed (provisional name), beside the always-run file in the .kaal root. */
export const DELIVERY = KAAL_ROOT_FILE.replace(/kaal-guard\.json$/, "delivery.json");
/** The list's text: engineering areas that are Delivery, as { "areas": [...] }. */
export const delivery = (...areas) => JSON.stringify({ areas }, null, 2);
