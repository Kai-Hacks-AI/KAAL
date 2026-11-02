# Script ownership and BASS: bounded completion PLAN

Status: proposed PLAN for independent review. Engineering owns the assessment
provisionally under the Owner's 2026-11-02 instruction. This is not a new
capability, an allocation authority, an executable gate or a publication decision.

## Outcome

An agent can find an existing script, understand its purpose, owner, supported
execution context and effects, and decide whether to invoke it through an
existing Skill, a public package interface or a repository procedure. The agent
retains judgment; deterministic checks establish bounded facts only.

The assessment is complete at the snapshots in [evidence.md](evidence.md).
The Owner's subsequent instruction to work it advances the focused PLANs below.
It does not itself accept these new requirements or authorize their integration.

## Responsibilities

| Concern | Owner / route |
| --- | --- |
| Assess repository scripts and incubate unassigned concerns | Engineering provisionally |
| BASS and the procedure for producing/updating Agent Skills | Engineer Skill; separate package-owned PLAN |
| Repository-specific discovery, orchestration and narrow Engineering claims | Engineering; reuse C5 #610 and C11/P3/C16 |
| Public script/API behavior and its local tests | The capability whose contract it realizes |
| Test/evidence interpretation | Testing |
| Generic package delivery conformance | Packaging |
| Node admission and catalog mechanics | Core |
| Host operations and supported host facts | Hosting |
| Reusable Branching behavior | Existing #797 route; Engineering retains current policy/wiring until governed cutover |
| Agents orient/preach delivery | Agents' existing release work; follow-up proposal, not an Engineering adoption |

Neither a file's directory nor an execution level assigns its semantic owner.
Unresolved ownership is recorded as unresolved. Engineering can retain interim
stewardship without declaring a new public package or broadening another owner.

## Proposed sequence

1. Review this Engineering carrier and the separate Engineer Skill BASS procedure
   PLAN. They can be reviewed independently. No main-to-collector synchronization
   or registry publication is required to review them.
2. After its PLAN is independently accepted, Engineer Skill delivers a bounded
   procedure step and contained decision reference, preserving its Skill Node,
   BASS Definition, checker semantics and public interfaces. Its own cases and
   installed/relocated use evidence qualify that delivery.
3. Engineering incorporates its script-family entry points and effect limits in
   the existing C5 discovery route. The narrow repository guidance can be
   proposed independently of Standards semantics and the full Standards view.
   Do not transplant unaccepted #610 content or create a competing register.
4. Resolve actual ownership through the existing C11/P3/C16 route and each
   affected owner's accepted identity. Add only agreed narrow claims. The root
   claim remains limited to package.json and package-lock.json. A new claim or
   enforcement change needs its own owning PLAN/DO review.
5. Prepare the Agents delivery finding for Agents' existing release work.
   Engineering does not modify or publish Agents as part of this sequence.
6. Reassess any remaining host/digest boundary signals against accepted owner
   migrations before proposing another correction. Presence of an import alone
   does not authorize rewriting preserved implementation bytes.

The later ordinary DOs require their accepted PLANs, frozen case obligations,
independent review and current required checks. No integrated or published
completion is inferred from this PLAN.

## Engineering obligations for the follow-up

The labels below are local review labels, not allocated engineering subject IDs.

- **D1. Complete bounded inventory.** Use tracked paths at an exact revision and
  include extensionless executable hooks, shebangs, bins, source-script candidates,
  npm script declarations and inline workflow execution. Separate test modules,
  helpers and executable-interface evidence. Exclude declarations and generated,
  dependency or untracked files only with their scope stated. Do not equate a
  source extension with an executable contract.
- **D2. Existing ownership machinery.** Reuse Testing inventory/claim/attribution
  contracts. Core supplies independently admitted owner identities when a result
  claims resolved attribution. Missing or conflicting evidence stays unresolved.
  A readable matching claim is not by itself an authoritative ownership result.
- **D3. Existing discovery machinery.** Reuse C5's per-owner entry points, optional
  Core discovery and agreement/unknown rules. Do not put an authoritative central
  directory in AGENTS.md or .kaal. A derived script view is not a source of owners'
  contracts and must not restate their meanings.
- **D4. Purpose and effects.** Explain whether a command lists facts, runs tests,
  writes source/scratch/evidence or can mutate external state. Identify runtime,
  shell, dependencies and supported context. Identify wrapper/prebuild effects
  separately from the called driver's effects.
- **D5. Judgment stays visible.** Separate observations, potential defects,
  architectural concerns, judgments and unknowns using Testing's vocabulary.
  Script placement, semantic duplication, applicability and LOVE are reviewed
  judgments. Machine checks must not silently resolve them.
- **D6. No blanket placement rule.** A Skill's own procedural adapters belong in
  its contained scripts. Public bins/libraries can remain package interfaces;
  test, build, release and CI implementation can remain in its owning context.
  No new runtime or repository-wide scanner is required by this PLAN. A reusable
  adapter is proposed only after evidence shows an existing tool is insufficient.

## Minimal discovery content

Link the authoritative procedure rather than copying it. The initial Engineering
content should explain the existing root inventory, attribution, contracts,
coverage and report commands; source/acceptance lanes; packer and release engine;
and current Git/CI adapters. Call out that coverage executes tests, reports may
write evidence, npm wrappers may build, and release commands can publish.

Use existing domain Skills for Graph, Foundation, Core, Testing, Change, Guard,
Packaging, Sealing and supported Branching inspection. Engineer Skill remains the
procedure for producing Skills, not a universal repository operator.

## Discriminating acceptance obligations

These design future Cases; none is claimed as executable or GREEN here.

| Obligation | Required observation / challenge |
| --- | --- |
| Inventory reach | An extensionless hook, bin, shebang script, npm inline command and workflow run block are accounted for; a .d.ts file is not reported as executable code |
| Candidate distinction | A pure imported helper and a test module do not become public executable contracts because of their extension |
| Owner evidence | A readable claim with absent/stale owner admission stays unresolved; conflicting claims are named rather than resolved by path proximity |
| Discovery and disagreement | With and without Core, owner entries remain discoverable by the existing contract; missing or disagreeing entries do not yield an empty clean result |
| Effects | A nominal measurement command with a build wrapper is not described as having the driver's read-only footprint alone |
| Placement judgment | A valid public bin outside a Skill and a Skill-contained adapter can both be appropriate; a generic move-all rule is rejected |
| Nonmutation | Inventory/discovery assessment changes no subject bytes or live policy; unresolved findings neither repair files nor create owner claims |
| Evidence calibration | Unknown dynamic invocation, untested host support and uncertain semantic duplication remain explicit after a deterministic scan |

Engineering's own tooling has Engineering Cases. Each delivered Skill/CLI keeps
its own acceptance and public-interface obligations. Testing's methodology and
Packaging's delivery cases are reused rather than implemented again here.

## Gates and scope limits

No runtime, Skill, script, tests, package identity, dependencies, manifest, lock,
workflow, owner Node or ownership claim changes in this carrier. No new capability
or required global registry/format is introduced. Existing tests and provenance
remain immutable. A later extraction must establish lifecycle, non-overlapping
ownership, independent verification and encapsulation under LOVE.

PLAN acceptance is the next product gate. DO implementation can proceed after
its own accepted prerequisites without waiting for npm publication. Integration,
collector synchronization, promotion and publication each retain their separate
Owner authorization and governance. Auto-merge remains off.
