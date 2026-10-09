#!/usr/bin/env bash
# Replays the finding-judgment scenario with the capabilities that exist today.
# Usage: run.sh <repo-root> <output-dir>. Writes only into <output-dir>; reads the subject beside this script.
# The "Reviewer" is scripted by this file: it states so in its own rounds and holds no seat.
set -u
REPO=$(cd "$1" && pwd); OUT=$2; HERE=$(cd "$(dirname "$0")" && pwd)
REVIEW="node $REPO/packages/kaal-review/skills/kaal-review/scripts/review.mjs"
ID="node $REPO/packages/kaal-sealing/skills/kaal-sealing/scripts/artifact-id.mjs"
INCIDENT="node $REPO/packages/kaal-incident/skills/kaal-incident/scripts/incident.mjs"
rm -rf "$OUT"; mkdir -p "$OUT/review" "$OUT/defects/01" "$OUT/live"
S="$OUT/live"; cp -r "$HERE/subject/." "$S"
sha() { $ID "$1"; }
say() { printf '\n== %s\n' "$*"; }
run() { printf '$ %s\n' "$*"; "$@"; printf '(exit %s)\n' "$?"; }

REQ=$(sha "$S/requirements.md"); ARCH=$(sha "$S/architecture.md")
say "1. Agreed results, by identity (no seal needed to cite them)"
echo "requirements.md  $REQ"; echo "architecture.md  $ARCH"

say "2. D4: the Worker realizes the architecture (v1) and the green suite passes"
cp "$S/ledger.v1.mjs" "$S/ledger.mjs"; L1=$(sha "$S/ledger.mjs"); echo "ledger.mjs v1  $L1"
(cd "$S" && run node tests/ledger.test.mjs)

say "3. D5/D6: independent examination of the Code against the agreed Architecture and Requirements (round 01, findings)"
cat > "$OUT/r01.reviewer" <<'T'
This round was written by the trial script standing in for a Reviewer. It holds no seat under any Owner's authority and shows no independence; it exists to exercise the form and the Worker's handling of findings.
T
cat > "$OUT/r01.findings" <<'T'
F1. append accepts a value that is not an object, against R4. Reproduce: node append-rejects-nonobject.mjs
F2. Ids are not unique over the life of a ledger, against R1: append, append, retract the first, append gives two entries the same id. Reproduce: node ids-unique.red.mjs
F3. retract of an id that is not in the ledger throws. Reproduce: node retract-unknown-id-throws.claimed.mjs
T
$REVIEW write "$OUT/review/01.md" --of Code --identity "$L1" --outcome findings --reviewer @"$OUT/r01.reviewer" --findings @"$OUT/r01.findings"
$REVIEW check "$OUT/review/01.md"; echo "(check exit $?)"

say "4. The Worker investigates each finding; it does not take them as orders"
cd "$S"
echo "-- F1 against v1"; run node append-rejects-nonobject.mjs 2>&1 | grep -E "AssertionError|exit" | sed 's/^/   /'
echo "-- F2 against v1"; run node ids-unique.red.mjs 2>&1 | grep -E "R1 violated|exit" | sed 's/^/   /'
echo "-- F3 against v1"; run node retract-unknown-id-throws.claimed.mjs 2>&1 | grep -E "holds|exit|AssertionError" | sed 's/^/   /'
cd - >/dev/null

say "5. Dispositions: F1 valid and in scope (now); F2 valid, outside scope (later); F3 invalid (rejected)"
cp "$S/ledger.v2.mjs" "$S/ledger.mjs"; L2=$(sha "$S/ledger.mjs"); echo "ledger.mjs v2  $L2"
cd "$S"
echo "-- F1 against v2"; run node append-rejects-nonobject.mjs 2>&1 | sed 's/^/   /'
echo "-- green suite against v2"; run node tests/ledger.test.mjs 2>&1 | sed 's/^/   /'
echo "-- F2 against v2 (the red test stays red; the code is faithful to the architecture)"; run node ids-unique.red.mjs 2>&1 | grep -E "R1 violated|exit" | sed 's/^/   /'
cd - >/dev/null

REDID=$(sha "$S/ids-unique.red.mjs")
cat > "$OUT/dispositions.md" <<T
# The Worker's position on review/01.md, written before round 02 (the next round, not the Worker, decides whether a finding stands)

F1. Position: stands. Reproduced against ledger.mjs $L1; violates R4. Inside the authorized scope (the architecture itself says append refuses non-objects). Now: corrected in ledger.mjs (identity $L2); append-rejects-nonobject.mjs passes.

F2. Position: stands. Reproduced against ledger.mjs $L2 with ids-unique.red.mjs ($REDID). Violates R1 ($REQ). The cause is the id rule of architecture.md ($ARCH), which ledger.mjs realizes faithfully; correcting it means revising the agreed architecture, which this Work is not authorized to do (scope.md). Later: preserved as defects/01; architecture.md is untouched. The delivered Code remains correct against the architecture it was asked to realize; it does not satisfy R1 once retract is used, and that is stated, not hidden.

F3. Position: does not stand. retract-unknown-id-throws.claimed.mjs exits 1: retract of an unknown id returns false, which is what R3 says. Rejected with this reasoning; nothing changes.
T

say "6. Round 02: the Reviewer examines the Code as it now stands against its standard, and says whether each earlier finding stands"
cat > "$OUT/r02.reviewer" <<T
This round was written by the trial script standing in for a Reviewer. It holds no seat under any Owner's authority and shows no independence.
Earlier findings: F1 does not stand any more, append-rejects-nonobject.mjs passes on the Code named here. F2 stands as a fact (ids-unique.red.mjs, $REDID, fails) but is a defect in the standard, architecture.md ($ARCH), not in the Code examined against it; it is preserved in defects/01 and is not part of what this round asks the Worker to change. F3 does not stand, the claim is false. This round concerns the Code against the Architecture and Requirements as they stand; it does not decide what becomes of F2.
T
$REVIEW write "$OUT/review/02.md" --of Code --identity "$L2" --outcome converged --reviewer @"$OUT/r02.reviewer"
$REVIEW converged "$OUT/review" "$L2"; echo "(converged on v2: exit $?)"
$REVIEW converged "$OUT/review" "$L1"; echo "(converged on v1: exit $? , expected 1)"

say "7. Preservation: the confirmed Defect and its red test, beside the agreed architecture and not in it"
D="$OUT/defects/01"; cp "$S/ids-unique.red.mjs" "$D/ids-unique.red.mjs"
(cd "$S" && node ids-unique.red.mjs 2>&1 | grep AssertionError) > "$D/observed.txt"
cat > "$D/defect.md" <<T
# Defect

Claim: ids are not unique over the life of a ledger (append, append, retract the first, append gives two entries one id).
Affected: architecture.md $ARCH ; ledger.mjs $L2
Violated: requirements.md $REQ, R1
Reproduction: from the directory holding ledger.mjs, node ids-unique.red.mjs ; it exits 1
Red test: ids-unique.red.mjs $REDID ; its observed output is in observed.txt
Validity: reproduced by the Worker (dispositions.md F2) and stated to stand in review/02.md
Disposition: later
Reason: correction means revising architecture.md, outside the authorized scope of this Work
Established result: architecture.md $ARCH is unchanged
T
echo "architecture.md still $(sha "$S/architecture.md")  (recorded $ARCH)"; [ "$(sha "$S/architecture.md")" = "$ARCH" ] && echo "unchanged: yes"
echo "defects/01 identity (named, domain defect): $($ID --named --domain defect "$D")"
echo "-- red test preserved byte for byte:"; cmp "$S/ids-unique.red.mjs" "$D/ids-unique.red.mjs" && echo "identical"
echo "-- still red when run from the preserved copy, with the Code beside it:"; cp "$S/ledger.mjs" "$D/ledger.mjs"; (cd "$D" && node ids-unique.red.mjs 2>&1 | grep -E "R1 violated"; echo "(exit ${PIPESTATUS[0]})"); rm "$D/ledger.mjs"

say "8. Could an Incident carrier hold this Defect? (kaal-incident: addressed to KAAL, two parts)"
mkdir -p "$OUT/kaal-dir/changes" "$OUT/kaal-dir/core" "$OUT/kaal-dir/seals"
run $INCIDENT write "$OUT/kaal-dir" --date 2026-10-09 --happened "A ledger built to the agreed architecture gave two entries one id after a retract." --expected "Ids stay unique for the life of the ledger (R1)." 2>&1 | sed 's/^/   /'
echo "   (the carrier has no place for the red test, the affected identities or a validity judgment; and kaal-incident says it is not for the client's own defects)"
rm -rf "$OUT/kaal-dir"

say "9. A later governed Change finds the Defect by reading closed Changes, and decides"
mkdir -p "$OUT/later/defects" && cp -r "$OUT/defects/01" "$OUT/later/defects/"
grep -rl '^Disposition: later' "$OUT/later" | sed "s#$OUT/later/##"
echo "-- is the architecture it was found against still the one in force? (it compares identities; it decides nothing)"
echo "recorded  $(sed -n 's/^Established result: architecture.md \(.*\) is unchanged/\1/p' "$OUT/later/defects/01/defect.md")"
echo "in force  $(sha "$S/architecture.md")"
rm -rf "$OUT/later"

say "10. Cleanup of scratch (the preserved record is review/, dispositions.md, defects/)"
rm -f "$OUT"/r0*.reviewer "$OUT"/r0*.findings; rm -rf "$OUT/live"
find "$OUT" -type f | sort | sed "s#$OUT/#  #"
