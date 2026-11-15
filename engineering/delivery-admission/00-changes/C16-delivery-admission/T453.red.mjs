// Case engineering/T453 (engineering/C16): the mechanism is stock-neutral: an invented stock with a conforming record passes with no code change
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, entry, REGISTRATION, HEAD } from "./helper.mjs";

test("engineering/T453 [engineering/C16]: the mechanism is stock-neutral: an invented stock with a conforming record passes with no code change", async () => {
  const { admit } = await load();
  const registration = { accepted: true, entries: [entry("invented", "invented/*", "invented-q")] };
  const v = admit(facts("invented/y", "invented", { registration, out: okOut("invented", "invented-q") }));
  assert.equal(v.kind, "pass");
  assert.equal(v.stock, "invented");
});
