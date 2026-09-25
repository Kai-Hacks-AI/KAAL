import fs from "node:fs";

export function init(target: string): void {
  fs.writeFileSync(target, "---\nname: born\ndescription: Born from its own init.\n---\n\n# Body\n");
}
