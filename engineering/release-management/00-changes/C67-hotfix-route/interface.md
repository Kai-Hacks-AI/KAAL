# C67 interface

The drafts of the correction, as they are added in the DO. Cases T870 to T872 judge the control itself at its place and T873 judges F17; neither is a file of `main` until the DO.

## Draft of the change to envelope.mjs

`````diff
diff --git a/engineering/release-management/05-src/plan-body/envelope.mjs b/engineering/release-management/05-src/plan-body/envelope.mjs
index ae5d7e0..b4b766a 100644
--- a/engineering/release-management/05-src/plan-body/envelope.mjs
+++ b/engineering/release-management/05-src/plan-body/envelope.mjs
@@ -15,13 +15,14 @@ const CHANGE_ID = /\b[\w-]+\/[A-Z]\d+\b/;
 
 // Rows keyed by TYPE, for what headings cannot give. A TYPE without a row is reported as not judged.
 const ROUTE = {
-  PLAN: (f) => f.base.startsWith('kaal/'), DO: (f) => f.base.startsWith('kaal/'), ACT: (f) => f.base.startsWith('kaal/'), SYNC: (f) => f.base.startsWith('kaal/'),
-  PROMOTION: (f) => f.base === 'main' && f.head.startsWith('kaal/'),
-  HOTFIX: (f) => typeof f.head === 'string' && /^hotfix\/\S/.test(f.head),
+  PLAN: (f) => f.base.startsWith('kaal/'), DO: (f) => f.base.startsWith('kaal/'), ACT: (f) => f.base.startsWith('kaal/'),
+  SYNC: (f) => /^(kaal|hotfix|wire)\//.test(f.base),
+  PROMOTION: (f) => f.base === 'main' && (f.head.startsWith('kaal/') || f.head.startsWith('hotfix/')),
+  HOTFIX: (f) => typeof f.base === 'string' && /^hotfix\/\S/.test(f.base) && !(typeof f.head === 'string' && f.head.startsWith('hotfix/')),
 };
 // What a route row leaves unjudged on purpose, reported on every result of that TYPE.
-const ROUTE_HINT = { HOTFIX: 'a HOTFIX takes a head under hotfix/' };
-const ROUTE_UNJUDGED = { HOTFIX: 'the base of a HOTFIX is not judged: the Hotfix delivery path, a separate Change, decides it' };
+const ROUTE_HINT = { HOTFIX: 'a HOTFIX goes into a base under hotfix/ from a head that is not under hotfix/' };
+const ROUTE_UNJUDGED = {};
 // What the envelope cannot show about a HOTFIX, reported on every HOTFIX result.
 const HOTFIX_UNJUDGED = [
   'whether a HOTFIX corrects only its defect is not judged: the diff, the Case and the review decide it',
@@ -158,8 +159,8 @@ export function verifyEnvelope(facts, registry = {}, options = {}) {
     if (type === 'HOTFIX') {
       problems.push(...hotfixBodyRules(facts.body));
       notJudged.push(...HOTFIX_UNJUDGED);
-    } else if (typeof facts.head === 'string' && facts.head.startsWith('hotfix/')) {
-      problems.push(`a pull request from the head ${facts.head} must be a HOTFIX: a hotfix/ head takes the TYPE HOTFIX, not ${type}`);
+    } else if (typeof facts.head === 'string' && facts.head.startsWith('hotfix/') && type !== 'PROMOTION') {
+      problems.push(`a pull request from the head ${facts.head} must be a PROMOTION into main: a hotfix/ head is promoted, not ${type}`);
     }
     if (ROUTE[type]) {
       if (!ROUTE[type](facts)) problems.push(`the route of a ${type} (base ${facts.base}, head ${facts.head}) does not fit its TYPE${ROUTE_HINT[type] ? `: ${ROUTE_HINT[type]}` : ''}`);
`````

## Draft of the change to F17.md

The Route line, from:

`````
- Route: PLAN, DO, ACT and SYNC take a base under `kaal/`, never `main`. PROMOTION takes `main` as base and a head under `kaal/`. HOTFIX takes a head under `hotfix/` (the CPO decision recorded with the Hotfix interface of release/C11). The base of a HOTFIX is not judged and every HOTFIX result says so under not judged: its branch lifecycle, its base or bases and its admission path belong to the Hotfix delivery-path Change, a separate Change, and are not inferred from the HOTFIX template.
`````

to:

`````
- Route: PLAN, DO and ACT take a base under `kaal/`, never `main`. SYNC takes a base under `kaal/`, `hotfix/` or `wire/`. PROMOTION takes `main` as base and a head under `kaal/` or `hotfix/`. A HOTFIX goes into a base under `hotfix/` from a head that is not under `hotfix/`: it is the pull request that carries the correction into the hotfix branch, and the way from that branch into `main` is a PROMOTION. Every HOTFIX result still lists what the envelope cannot show under not judged (below); the base is no longer one of them.
`````

The HOTFIX body and head line, its first sentence and its list of what the review decides, from:

`````
- HOTFIX body and head: a pull request from a `hotfix/` head must be a HOTFIX, and any other TYPE from such a head is a finding. The Defect, Urgency and Approach chapters of a HOTFIX each need content, and the Change chapter of a HOTFIX is one line, `<id> <name>` (release/F16): the id, one space and a name of words joined by single spaces, where a word holds letters, digits and `_ . ' ( ) / & + -`. A colon, a description, markup, a control or an invisible character, and a second space in a row are findings. Everything else about a HOTFIX needs a reviewer and is listed under not judged on every HOTFIX result: whether the change corrects only its defect, and whether the Defect and the Urgency are true, beside the base and the Change identity. A HOTFIX never reaches PASS from the envelope alone.
`````

to:

`````
- HOTFIX body and head: a pull request from a `hotfix/` head must be a PROMOTION into `main`, and any other TYPE from such a head is a finding. The Defect, Urgency and Approach chapters of a HOTFIX each need content, and the Change chapter of a HOTFIX is one line, `<id> <name>` (release/F16): the id, one space and a name of words joined by single spaces, where a word holds letters, digits and `_ . ' ( ) / & + -`. A colon, a description, markup, a control or an invisible character, and a second space in a row are findings. Everything else about a HOTFIX needs a reviewer and is listed under not judged on every HOTFIX result: whether the change corrects only its defect, and whether the Defect and the Urgency are true, beside the Change identity. A HOTFIX never reaches PASS from the envelope alone.
`````

## The Cases the DO amends

Release/T161, T188, T189, T190, T191 and T192 assert the old route. The DO changes them to the agreed route and keeps what each one is for (the verdict and exit codes of T188 and T189, the finding of T191, the words of F17 in T190 and T192). Each was run against the corrected control and F17 in the PLAN and is listed in `evidence.md` as failing there.
