// kaal-compose: composition of a KAAL Engine from explicitly selected
// capabilities. It has no `payload()`: it delivers no Node of its own.
export { heldBy, install, Refusal, stage, type Held, type Installed, type Kind, type Request, type Staged } from "./compose.js";
export { fromDirectory, fromNpm, type Offer } from "./sources.js";
export { compatibility, named, prefix } from "./compat.js";
