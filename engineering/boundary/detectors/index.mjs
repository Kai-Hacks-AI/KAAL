// The typed detectors of the Boundary Engine. Adding a generic detector is an Engineering Change (engineering/boundary/PLAN.md R2):
// a definition can only name a detector listed here, and carries no code or regular expression.
import * as callWithLiteral from "./call-with-literal.mjs";
import * as fileIdentity from "./file-identity.mjs";
import * as tokenSequence from "./token-sequence.mjs";

export const DETECTORS = new Map([fileIdentity, tokenSequence, callWithLiteral].map((d) => [d.name, d]));
