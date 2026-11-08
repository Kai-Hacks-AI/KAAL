// The shipped platform coupling conformance suite (hosting/F31, hosting/A13).
// This is the only entry that loads node:test, and only a runner loads it; the
// inspected capability never depends on Hosting.
import { describe, it } from "node:test";
import { boundary, CASES, LINE, portability, PORTABILITY_CASES } from "./boundary-core.js";
import type { BoundaryOptions, HostReviewRequest, PortabilityOptions, ReviewRequest } from "./boundary-core.js";

export { boundary, CASES, LINE, portability, PORTABILITY_CASES } from "./boundary-core.js";
export type {
  Applicability,
  ApplicabilityFinding,
  BoundaryCase,
  BoundaryOptions,
  BoundaryResult,
  HostReviewRequest,
  PortabilityCase,
  PortabilityOptions,
  PortabilityResult,
  ReviewRequest,
} from "./boundary-core.js";

/** The diagnostic a review request is emitted as. */
const diagnostic = (request: ReviewRequest | HostReviewRequest): string =>
  "finding" in request ? `${request.id} ${request.finding.kind}${request.finding.acknowledged ? ` (acknowledged: ${request.finding.acknowledged})` : ""}: ${request.question}` : `${request.id}: ${request.question}`;

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

/**
 * Register the portability audit for one capability with `node:test`: the
 * five deterministic cases, and `judgment requested` as todo while any review
 * is requested, never as a pass (hosting/F40).
 */
export function portabilitySuite(options: PortabilityOptions): void {
  const done = portability(options).then((r) => {
    console.log(`${LINE} ${JSON.stringify(r)}`);
    return r;
  });
  describe(`Hosting portability: ${options.name}`, () => {
    for (const name of [...CASES, ...PORTABILITY_CASES]) {
      it(name, async (t) => {
        const r = await done;
        const c = r.cases.find((x) => x.name === name)!;
        if (c.outcome === "not run") return t.skip(r.failures.join("; "));
        if (c.outcome === "not applicable") return t.skip("not applicable: the operating-system boundary may scope by platform");
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
