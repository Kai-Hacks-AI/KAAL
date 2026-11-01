# KAAL Branching — configuration slice

Private 0.0.1 candidate under the accepted [Branching PLAN](https://github.com/Kai-Hacks-AI/KAAL/pull/797). This Change delivers strict, pure validation of explicit consumer JSON configuration; it is not a completed Agent Skill or release candidate.

`import { validateConfiguration } from "kaal-branching"` is the only delivered product interface. Pass exact JSON text. A structurally accepted supported configuration returns `{kind:"pass", configuration, findings:[]}`; rejected input returns `{kind:"fail", findings:[{code,path,message}]}` and no usable configuration. Objects are not accepted because decoded objects have already lost duplicate-key evidence.

The validator checks the schema's required/unknown fields, decoded duplicate keys, finite values, branch selectors, role references, transaction kinds/methods/obligations and consistent governance/lifecycle declarations. It recognizes `kaal-branching/1`, GitHub, same-repository transactions and the three reviewed transaction kinds. Unsupported features are rejected. Names and permitted role pairs belong to the consumer. Prefix selectors end at a slash boundary; the single working-role remainder is the explicit complement of all exact/prefix selectors. JSON nesting beyond 128 levels is refused.

Embed's configuration is read by its future trusted adapter. External supplies authorized target-bound policy from the controller; no target .kaal or KAAL check is required by this pure validator. External holds use `source:"authorized-policy-interface", path:null`; Embed's trusted-revision holds use an explicit repository-relative path. A check identity may be null when the consumer has no additional named KAAL check requirement. Existing/native required checks still need independent Boundary evidence.

The initial governance vocabulary supports required auto-merge, strict freshness, complete host-rule enumeration, explicit review requirements, forbidden bypass and manual FIFO/Owner-override preflight. Unknown choices fail. The schema records provider requirements, but this slice does not check whether providers are installed or admitted.

A pass establishes configuration structure only. It does not authenticate the policy provider, establish target identity or freshness, select an actual Git transaction, verify effective host rules, perform any repository operation or establish Package/Boundary assurance. Skill/scripts, policy authority, live adapters and KAAL CI migration remain pending. No existing Branching checker is replaced.

The source tree's `test/README.md` describes tests and precise scope/evidence; tests are not shipped as part of the runtime package. The root Workspaces lane runs architecture/implementation tests; the existing Acceptance lane discovers the installed configuration scenario. The package stays private and is not authorized for npm publication.

