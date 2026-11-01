# Testing

Three loops remain distinct. **change/T41–T44, T47 and T49** exercise proposal
validation, nonfunctional/Defect paths, new dependents/cycles, both interface
directions, incomplete/forged evidence and deterministic/stale binding.
**T45 and T46** are delivered controlled capability examples: an incoming driver
exercises a real charging subject with an outgoing rate double; replacing the
subject loses discrimination. An independently configured percent-to-basis-point
provider can disagree with that passing double, and a separate contract check
detects it. These are example implementations, not real payment-service assurance.

**T48** is publisher-side architecture conformance: permitted core, prohibited
host import and undecidable dynamic host access. **T50** is publisher-side
capability acceptance using Testing's `install()` and caller-packed tarballs in
a fresh npm host. It uses public exports and installed verification, then proves
tampered code refuses verification.

`npm test` runs delivered verification. `npm run test:publisher` runs publisher
architecture/negative checks. `npm run mutations` challenges implementation
variants against the unchanged delivered Cases; it restores the original bytes.
Acceptance is discovered by the repository's existing three-host lane.

The verifier requires exactly the declared Cases, each observed once and passed;
skip/todo/missing/duplicate/undeclared results cannot verify. A matching file
inventory establishes consistency only. Complete code/contract correctness,
repository provenance and real outside integrations remain outside this evidence.

## Skill anchor

| Case | Loop | Contract |
| --- | --- | --- |
| change/T51 | Implementation, delivered | Documented example command invokes the public API and preserves authority/execution qualifications across complete, omitted-interface and new-dependent models. |
| change/T52 | Architecture, publisher | Core admits Change Practice as a Skill; Engineer Skill checks the Agent Skill. |
| change/T53 | Capability acceptance | Relocated packed skill runs in an External operator environment without target changes; a broken resource reference fails its public checker. |
| change/T54 | Capability acceptance | Core registers only the packaged Skill contribution into an arbitrary Engine; installed 0.0.1 verification observes all nine delivered Cases. |

T51 and T52 begin assertion RED against executable/admitted scaffolds, then GREEN.
Mechanical checks do not establish the correctness of an agent's reasoning;
worked-use validation is reported separately from test execution.

## Package-only installation

| Case | Loop | Contract |
| --- | --- | --- |
| change/T55 | Architecture, publisher | The actual package declares all providers needed by shipped verification as exact production dependencies. |
| change/T57 | Publisher integration | The existing Release readiness gate names missing required Graph/Hosting versions before packing; controlled registry observations do not claim publication. |
| change/T56 | Publisher integration, explicit artifact probe | With fresh consumer/cache, request only the Change tarball; npm resolves declared dependencies through checked local-tarball overrides, then the existing Release judge validates all installed Cases and their statuses. |

Run T56 from the source workspace after a caller has packed once:

```sh
npm run test:package-only -- <absolute packed-manifest.json> <absolute fresh consumer directory>
```

The probe neither builds nor packs. Its overrides supply artifact transport only;
providers are not preinstalled or additional install arguments. The pre-fix
package fails by assertion because installed verification cannot import its
providers. Both T55 and this unchanged T56 probe must pass with the correction.
T56 is an explicit publisher integration command, not an extra installation hidden
inside Testing's acceptance ledger or a shipped consumer command. It does not
claim a real registry release. Production publication still requires all exact
dependency versions and the existing release gates.
