// Case engineering/T453 (engineering/C16): the mechanism is stock-neutral: an invented stock with a conforming record passes with no code change
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okQual, REGISTRY, HEAD } from "./helper.mjs";

test("engineering/T453 [engineering/C16]: the mechanism is stock-neutral: an invented stock with a conforming record passes with no code change", async () => {
  const { admit } = await load();
  const registry = { ...REGISTRY, admission: { ...REGISTRY.admission, INVENTED: { qualifier: "invented-q", routes: ["invented/*"] } } };
  const v = admit(facts("invented/y", "INVENTED", { registry }));
  assert.equal(v.kind, "pass");
  assert.equal(v.stock, "INVENTED");
});
