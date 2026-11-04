// The host operations the structure checker uses, in one place, so that checker names no package
// (packaging/T110) and every host operation still goes through Hosting (packaging/A1).
export { execute, kind, read, readFile } from "kaal-hosting";
