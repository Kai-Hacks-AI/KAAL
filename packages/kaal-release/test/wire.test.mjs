// Case pull/T34: the wiring of the engineering Cases (pull/C6). It lives in test/pull/T34.test.mjs and exports run().
import { describe, it } from "node:test";
import { run, id, tests } from "./pull/T34.test.mjs";

describe("pull wiring (pull/C6)", () => {
  it(id, async () => {
    if (!tests?.length) throw new Error("pull/T34 does not name the requirements it tests");
    await run();
  });
});
