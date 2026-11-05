// The host operations and the digest the checkers use, in one place, so that no checker names a package
// (packaging/T110, T123) and every host operation still goes through Hosting (packaging/A1).
// The digest is KAAL's own SHA-256 from Foundation (packaging/A27); Packaging holds no hash of its own.
export { execute, kind, read, readFile } from "kaal-hosting";
export { sha256 } from "@kaihacksai/kaal-foundation/sha256";
