# C97 interface

The drafts the DO takes as its files. T1170 passes on them in a throwaway copy (`evidence.md`).

## Draft of F75.md

Goes to `engineering/release-management/02-requirements/F75-wire-template-names-no-delivery-root/F75.md`.

`````
---
id: release/F75
title: wire-template-names-no-delivery-root
kind: functional
serves: [release/I53]
---
# release/F75 wire-template-names-no-delivery-root

The WIRE pull request template (`05-src/wiring/templates/wire.md`) says where a WIRE may install by pointing to the declaration of the delivery locations (release/A67), the wirable ones, and it names no delivery root itself: not `.github`, `.githooks`, `.kaal`, `.agents` nor `.claude`. It keeps its cue and exactly its three chapters, Source, Target and Verification (release/F22). When a location is added to the declaration or made wirable, the template needs no edit.
`````

## Draft change of the template source

Applies to `engineering/release-management/05-src/wiring/templates/wire.md`.

```diff
@@ -8,7 +8,7 @@
 
 ## Target
 
-<!-- The operational destination, by path: `.githooks/` or `.github/`. -->
+<!-- The operational destination, by path, under one of the wirable delivery locations declared in `engineering/release-management/03-architecture/A67-delivery-locations/delivery-locations.json`. -->
 
 ## Verification
```

## Draft change of T281

Applies to `engineering/release-management/00-changes/C27-wire-delivery-operation/T281.test.mjs`: the equality with the draft of release/C27 gives way to the judgement of the source.

```diff
@@ -30,11 +30,7 @@
   assert.equal(judge(`${good}\n## Notes\n`), false, 'an extra chapter is accepted');
   assert.equal(judge(good.replace(CUE, '')), false, 'a missing cue is accepted');
   assert.equal(judge(`${CUE}\n${good}`), false, 'a repeated cue is accepted');
-  const iface = join(repo, 'engineering/release-management/00-changes/C27-wire-delivery-operation/interface.md');
-  assert.ok(existsSync(iface), 'the interface is absent');
-  const text = draft(readFileSync(iface, 'utf8'));
-  assert.ok(judge(text), 'the draft is not a WIRE template');
   const src = join(repo, 'engineering/release-management/05-src/wiring/templates/wire.md');
   assert.ok(existsSync(src), 'the WIRE template source is absent from the Engineering wiring sources');
-  assert.equal(readFileSync(src, 'utf8'), text, 'the template source differs from the draft');
+  assert.ok(judge(readFileSync(src, 'utf8')), 'the template source is not a WIRE template');
 }
```

T1170 is renamed from `.red.mjs` to `.test.mjs`. In `T281.test.mjs` the unused `draft` helper and its imports may be removed by the DO.
