// The manifest GitHub's App-from-manifest flow reads, from a declaration (hosting/F98): stable JSON, never a field the
// declaration did not give. The hook is inert and there are no events.
import { permissionsOf, validateAppDeclaration } from "./app-declaration.js";

export function renderAppManifest(declaration: unknown): string {
  const d = validateAppDeclaration(declaration);
  const permissions = Object.fromEntries(Object.entries({ ...permissionsOf(d.abilities), metadata: "read" }).sort(([x], [y]) => (x < y ? -1 : 1)));
  const manifest = {
    name: d.name,
    url: "https://github.com",
    public: false,
    hook_attributes: { url: "https://example.invalid", active: false },
    default_events: [] as string[],
    default_permissions: permissions,
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
