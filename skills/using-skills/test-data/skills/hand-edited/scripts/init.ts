import fs from "node:fs";

export function init(target: string): void {
  fs.writeFileSync(target, "---\nname: hand-edited\ndescription: What init generates.\n---\n\n# Body\n");
}
