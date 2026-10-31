// The shipped platform coupling conformance suite (hosting/F31, hosting/A13).
// This is the only entry that loads node:test, and only a runner loads it; the
// inspected capability never depends on Hosting.
import { describe, it } from "node:test";
import { boundary, CASES, LINE } from "./boundary-core.js";
import type { BoundaryOptions, ReviewRequest } from "./boundary-core.js";

export { boundary, CASES, LINE } from "./boundary-core.js";
export type { BoundaryCase, BoundaryOptions, BoundaryResult, ReviewRequest } from "./boundary-core.js";

/** The diagnostic a review request is emitted as. */
const diagnostic = ({ finding: f, id, question }: ReviewRequest): string => `${id} ${f.kind}${f.acknowledged ? ` (acknowledged: ${f.acknowledged})` : ""}: ${question}`;

/**
 * Register the suite for one capability with `node:test`: one Test Case per
 * deterministic case, and `judgment requested`, reported as todo while any
 * review is requested, never as a pass (hosting/F31).
 */
export function boundarySuite(options: BoundaryOptions): void {
  const done = boundary(options).then((r) => {
    console.log(`${LINE} ${JSON.stringify(r)}`);
    return r;
  });
  describe(`Hosting boundary: ${options.name}`, () => {
    for (const name of CASES) {
      it(name, async (t) => {
        const r = await done;
        const c = r.cases.find((x) => x.name === name)!;
        if (c.outcome === "not run") return t.skip(r.failures.join("; "));
        if (c.outcome === "fail") throw new Error(name === CASES[0] ? r.failures.join("; ") : `${name}: see the ${LINE} line`);
      });
    }
    it("judgment requested", async (t) => {
      const r = await done;
      for (const request of r.reviews) t.diagnostic(diagnostic(request));
      if (r.reviews.length) t.todo(`${r.reviews.length} review requests`);
    });
  });
}
