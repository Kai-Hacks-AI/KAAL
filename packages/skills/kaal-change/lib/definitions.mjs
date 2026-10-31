// The Definitions kaal-change ships, as references a Node's type or an
// Edge's type names: each is { name, id }, where id is the SHA-256 of the
// shipped file's exact bytes. test/definitions.test.mjs holds each to its file,
// so a runtime that reads no file still names exactly what is shipped.

/** capability/Change-Definition.md: a Change Node is typed by it. */
export const CHANGE = Object.freeze({ name: "Change", id: "cd9c0a091a63b18ddd45f2a02c7b710e57ada63d66a1abff87c71047afb4b097" });

/** capability/Succeeds.md: a Change's Edges to the Changes it succeeds. */
export const SUCCEEDS = Object.freeze({ name: "Succeeds", id: "17ea150ff2ab6284a456da33632c9a882017f7ee98b8f40fe51a7d33ae0c996a" });

/** capability/Delivers.md: a Change's Edges to the Intents it delivers. */
export const DELIVERS = Object.freeze({ name: "Delivers", id: "e22604f781aee125a51836260cf28ce732ac1b3b0af02c4910833e09f13d6d05" });
