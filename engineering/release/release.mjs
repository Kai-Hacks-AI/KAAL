// Shim: the Release engine moved to engineering/release-management/05-src/release-engine/ (release-management PLAN, version Package,
// approve Publishing, verify Package Promotion). Kept because other capabilities' Cases and .github/workflows/release.yml still call this path;
// .github travels alone, so the wiring moves in its own Change, and this shim goes with it.
export * from "../release-management/05-src/release-engine/release.mjs";
