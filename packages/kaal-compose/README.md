# kaal-compose

Composition of a KAAL Engine from explicitly selected capabilities, as an npm package. Given exact Node IDs and a source of packages, it stages the whole resulting Engine, checks it, and only then installs it into the Engine and host skills directories it is told, never anywhere else. It has no `payload()` and no Node of its own.

- `kaal-compose held --kaal ENGINE`: the Skills and Extensions the Engine holds, as Core reports them.
- `kaal-compose offers (--source DIR | --npm SPEC)... [--kaal ENGINE]`: what the sources offer, as `{name, id}` from Core's answer after staging, marked `held`.
- `kaal-compose install (--source DIR | --npm SPEC)... --kaal ENGINE [--skills DIR] --select NODE_ID...`: exit 0 done, 1 refused with nothing written, 2 usage.

Identity is Core's. A package is read as data (`kaal/` and `skills/`), put into a throwaway KAAL, and Core says whether it is a Skill or an Extension and which Nodes it holds. Selection is by exact Node ID; a name, an unknown ID or an unadmitted Node is refused. A package's name, version and directory are placement, never identity. The Engine is seeded from the Core this tool carries, and an Engine whose Core differs is refused.

Refusal is whole: the candidate Engine (what it holds plus what is selected) must hold exactly that, every held Skill's declared needs (`compatibility` in its SKILL.md) must be met by a Node Core reports held in the named slot, and the committed state is read back through Core. Nothing is added that was not selected, and no dependency is selected for you.

Sources are plain modules. A local directory is read as one package or a directory of packages. npm is invoked only in its adapter, with scripts disabled, into a throwaway directory; whatever npm obtained is offered, dependencies included, and npm alone resolves package dependencies. Package executables are npm's to deliver, not this tool's: installing a Skill places its Nodes in the Engine and its Agent Skill in the skills directory, and installing an Extension places its Node in the Engine; the Extension's code stays in the package the operator installed with npm.

Trust is exact-ID selection, byte equality and Core admission. Nothing here authenticates who published a package. Needs Node.js 20 or later. Build and test: from the repository root, `npm test`.
