# BASS procedure: PLAN

Status: proposed Engineer Skill-owned PLAN for independent review, following the
Owner's 2026-11-02 script assessment and instruction to work the focused
corrections. Subject IDs and Change numbering are not allocated by this draft.

## Problem and intended behavior

Engineer Skill already delivers BASS, Bare < Agent < Skill < Script. Its
SKILL.md describes creating a Skill Node, writing an Agent Skill, running the
structural checker, using Core for admission and Testing for verification. It
does not explicitly guide the author through deciding which behaviors require
agent judgment and which should reuse a deterministic tool.

After the bounded DO, the same Skill guides that decision. It searches for useful
existing tools inside and outside the Skill, distinguishes a public package
interface from a Skill-private adapter, and leaves meaning, applicability and
ownership judgments with the responsible agent/owner. It does not become a
repository-wide architectural allocator.

## Proposed requirements

These are local labels for review; BASS and existing public contracts retain
their identities and semantics.

- **B1. Choose determinism per behavior.** Ask what must repeat and what requires
  interpretation, prioritization, semantic comparison or an authority decision.
  Increasing determinism is not increasing correctness or authority. The agent
  follows the Skill and interprets script output; a script cannot certify its
  own adequacy, ownership or permission.
- **B2. Discover before building.** Find the existing capability and Skill that
  own the behavior. Inspect its declared bin/API and any relevant repository
  procedure, including tools outside the Skill. Reuse the declared interface
  when it suffices; do not copy its implementation or require a new script merely
  to give the step a Script heading.
- **B3. Place by role.** An adapter implementing this Skill's agent procedure
  belongs in the Skill with contained relative resources. An existing public
  CLI/library may remain in its owning package and be invoked through its public
  interface. Build, test, release and CI code remains in its owning context unless
  a separately justified procedural adapter is needed. Location alone assigns
  no semantic owner and never makes private internals a consumer interface.
- **B4. State the invocation contract.** Before relying on a tool, identify its
  selected installed runtime, dependencies, supported hosts/shell, inputs,
  effect/write footprint and result meanings. Resolve Skill-relative resources
  from the actual Skill location. Do not assume a source checkout, host placement,
  current working directory or a registry fallback. External use changes no target
  instructions or Engine merely to discover the tool.
- **B5. Calibrate the result.** Record the observations a tool establishes and
  the judgments/unknowns it leaves. Missing tools/evidence are unknown, not an
  empty clean inventory. Test reporting follows Testing; delivery conformance
  follows Packaging. Nothing here creates a new evidence vocabulary.
- **B6. Demonstrate without expanding scope.** Use a contained short worksheet
  and worked choices: a judgment-only step; reuse of an existing public bin
  outside the Skill; a justified contained adapter; a build/test/CI tool that
  stays outside; and uncertain ownership that stays unresolved. Record candidate,
  purpose, semantic owner/evidence, chosen BASS realization, interface/effects,
  placement rationale, verification and remaining judgment. This worksheet is an
  aid, not a mandatory repository-wide schema or ownership registry.

## Bounded DO and dependencies

The proposed DO changes the existing SKILL.md and adds one contained reference
under skills/kaal-engineer-skill/references/. The procedure links it relatively.
It preserves Engineer-Skill.md, BASS.md, checker/validator behavior, exports/bin,
dependencies and version. It writes no other capability's content or Engine.
Its own focused publisher/acceptance Cases qualify the new delivered guidance.
Existing assertions are not edited to accommodate the change.

No generic executable-location checker or new capability is proposed. The
existing checker continues to establish its existing standard and containment
findings, not semantic correctness of a BASS choice. Engineering retains the
repository assessment and its discovery/claim work separately.

Implementation needs an accepted PLAN and existing Engineer Skill, Core/Hosting
and Testing contracts as applicable. Local installed/relocated verification can
use the exact existing packed dependencies; it need not wait for their registry
publication. A later independently publishable delivery must separately meet
LOVE and Packaging's release requirements. This guidance Change is not a full
Engineer Skill 0.0.1 release programme.

## Verification and validation design

No executable Cases are added or claimed GREEN by this PLAN. After acceptance,
freeze the new obligations in the owning tests before DO. Use the smallest
discriminating Cases; do not mirror prose wording or weaken existing assertions.

| Obligation | Evidence / discriminating negative |
| --- | --- |
| Existing conformance | Existing Skill checker accepts the delivered Skill; an escaping or missing reference is still refused by unchanged checks |
| Installed resource availability | Normal packed inventory includes the linked reference; installed use without the source tree can read it; omitted-resource challenge fails |
| Relocation | Move the installed Skill to another supported Skill location and resolve its contained reference from there; no cwd/source fallback masks a missing resource |
| Public-tool reuse | A worked existing public bin remains outside the Skill and retains its owner/interface; a rule requiring every executable to move into the Skill is rejected in independent review |
| Judgment retention | A judgment-only choice and uncertain owner remain explicit; a structurally passing checker is never presented as semantic approval |
| Nonmutation and authority | A read-only authoring-assessment exercise records a proposal without moving scripts, editing target instructions/Engine or invoking release actions |

Structural/resource observations are verification. Whether the examples preserve
scope, exercise useful judgment and select a proportionate realization is
independent validation. An agent-use trial records its supplied task, exact Skill
bytes, actions and qualifications; it is not general proof of agent effectiveness.
No instruction in this PLAN authorizes delegation or self-approval.

## Review and integration

The [Engineering carrier #844](https://github.com/Kai-Hacks-AI/KAAL/pull/844)
tracks the overall sequence; this PLAN governs only
Engineer Skill's procedure. Establish its canonical collector from current main
if absent, as the repository's Establish rule requires, then propose this ordinary
Change there. Do not route a working branch directly to main or carry another
collector's unpromoted work.

Independent PLAN acceptance precedes DO. Each ordinary Change lands by squash
only after independent review, required current-head checks and separate Owner
integration authorization. No synchronization, promotion, auto-merge activation,
relocation, new capability or npm publication is authorized by this PLAN.
