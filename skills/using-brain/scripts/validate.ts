import { pathToFileURL } from "node:url";
import { edgeErrors, learningOf, nodeIndex, parseNode, relativeIdentity, ROOT } from "./brain.js";

export function validate(root = ROOT): string[] {
  const known = nodeIndex(root);
  const errors: string[] = [];
  for (const file of known.values()) {
    let node;
    let born;
    try {
      node = parseNode(file);
      born = learningOf(root, file);
    } catch (e) {
      errors.push(String(e));
      continue;
    }
    errors.push(...edgeErrors(root, relativeIdentity(root, file), born, node.edges ?? [], known));
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = validate();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  }
}
