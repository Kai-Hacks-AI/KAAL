// engineering/C15: the SOURCE/EVIDENCE BOUNDARY. This module turns the files of one tree into the
// evidence collector-capability.mjs judges. It is given the files and nothing else:
//   - no Git, no network, no working directory, no deployed `.kaal/` Engine and no published
//     package. Core is read from the workspace source (`kaal-core`, `kaal-graph`), as
//     engineering/inventory/attribute.mjs does, so an unpublished Core is enough;
//   - the caller decides WHICH tree: check.mjs passes the default branch's tip, never a head.
// Fail-closed: whatever it cannot read, validate or assemble becomes null evidence, not a guess.
import { evaluate, foundation } from "kaal-core";
import { validate } from "kaal-core/frontmatter";
import { assemble, REGISTRATION_SCHEMA, REGISTRATION_TYPE } from "kaal-core/registration";
import { Graph } from "kaal-graph";
import { readFrontmatter } from "kaal-graph/form";

/** `files`: [{ path, bytes }]. Resolves to { registrations, capabilities } (either may be null). */
export function readEvidence(files) {
  let engine;
  try {
    engine = evaluate(Object.fromEntries(files.map(({ path, bytes }) => [path, bytes])));
  } catch {
    return { registrations: null, capabilities: null };
  }
  const admitted = new Graph(engine.nodes);
  const capabilities = new Set(admitted.typed(foundation().capability).map(({ name }) => name));

  const bytesOf = new Map(files.map(({ path, bytes }) => [path, bytes]));
  const statements = [];
  for (const artifact of engine.artifacts.filter((a) => a.type === REGISTRATION_TYPE)) {
    const bytes = bytesOf.get(artifact.path);
    let result;
    try {
      result = validate(bytes, { [REGISTRATION_TYPE]: REGISTRATION_SCHEMA });
    } catch {
      return { registrations: null, capabilities };
    }
    if (result.verdict !== "valid") return { registrations: null, capabilities };
    const { type: _type, ...statement } = readFrontmatter(bytes);
    statements.push(statement);
  }
  const assembled = assemble(statements);
  const collisions = assembled.findings.filter((f) => String(f.rule).startsWith("scope collision")).map((f) => f.scope);
  return { registrations: { claims: assembled.scopes.map(({ scope, holder }) => ({ scope, holder })), collisions }, capabilities };
}
