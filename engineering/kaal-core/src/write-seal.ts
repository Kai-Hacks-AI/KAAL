import { writeFileSync } from "node:fs";
import { kernelSeal } from "./seal.js";

writeFileSync(new URL("../../kernel.sha256", import.meta.url), kernelSeal() + "\n");
