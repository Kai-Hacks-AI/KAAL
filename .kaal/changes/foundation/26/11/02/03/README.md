# Foundation C16 declaration delivery candidate

Implements approved C15 PLAN #836 using C12's unchanged Node and ownership
claim, independently approved in refreshed replacement #846. C15 is integrated;
C12 still awaits its current required CI and authorized integration. This is a
dependent draft on the exact approved #846 head, not a claim of collector
integration. Its provisional record is now 03 so C12's record 02 is preserved.
After C12 lands, refresh the DO onto the actual collector before integration.

The product changes are the exact Capability data export/file, package 0.0.2,
declaration byte attributes, delivered documentation, enrolled publisher and
Embedded cases, existing-lane Acceptance scenario and regenerated manifest.
Only the proposed explicit T9 version literal and T36 delivery assertions change;
the underlying SHA-256, owner identity, claim containment, CLI and existing
behavior/mutation tests remain. No Core/Hosting/Engineering file is changed.

Local Linux snapshot evidence (Node 24.22.1 / npm 11.9.0):

- Source npm test: 10 Embedded cases and 38 publisher tests pass; verified.
- T46–T49/T50 turn GREEN from the recorded missing-delivery RED baseline.
- Normal npm pack, without ignore-scripts, delivers exactly 21 files, equal to
  the documented inventory and manifest plus itself; ownership claim excluded.
- Clean installed verification accounts for all 10 declared cases. The public
  export resolves the exact C12 Node and the existing SHA-256 API still works.
- Missing/changed Node gives cannot verify, exit 2. Wrong name/type/type-id behind
  refreshed digests gives failed, exit 1, with T50 observed failing. Restoration
  returns to verified. Existing author Engine/configuration survives package
  install/read/uninstall; unscoped substitution is refused.
- Two normal packs produce SHA-256
  95868104203d2c08c050a7c6e2b3e55ad46932f9c519e72725608c7cb8c79a66,
  integrity sha512-dy++NYGXfKDzqL2XOgmZO6YiWwwVS3gUUMqPnM+TF1BtxuSDQGfSw6oGZwUS8LcFA6MeiGAgdWyDBWfkNmya6Q==.
  Manifest digest is 1bfa699926967dbe9aae324b537d95d5fd59ba0f8906a8fa3f4a6b26886e33c8.
  This is local evidence, not the workflow's npm 11.21.0 release artifact.

The local materialization is Foundation and its referenced repository bytes,
not a complete repository checkout. Full repository lanes, T51/native-host
execution, Core bootstrap compatibility, independent review and current main
integration remain separate. C15 records the exact Core 0.0.1 pin/root-lock and
trusted-main isolation dependencies. No consumer pin or lockfile is invented.

No merge, auto-merge activation, SYNC, promotion, publication or release
authorization is requested by executing tests or opening this dependent draft.

Refresh evidence: the complete packages/kaal-foundation Git subtree remains
81832e505cdf28c232ba55b80d500f71905df44a, exactly the previously tested #838
candidate. No product, test, manifest or packaged byte changes in this refresh.
The same 0.0.1 Core pin/root-lock/admission and native acceptance blockers remain.
