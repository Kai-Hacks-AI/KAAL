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

say "3. D5/D6: examination of the Code against the agreed Architecture and Requirements (round 01, findings)"
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

F2. Position: stands. Reproduced against ledger.mjs $L2 with ids-unique.red.mjs ($REDID). Violates R1 ($REQ). The cause is the id rule of architecture.md ($ARCH), which ledger.mjs realizes faithfully; correcting it means revising the agreed architecture, which this Work is not authorized to do (scope.md). Later: preserved as defects/01; architecture.md is untouched. The delivered Code realizes the architecture it was handed and does NOT satisfy R1 once retract is used. That is stated, not hidden: R1 is an upstream obligation this Work was not handed to deliver (scope.md), and it stays unmet. Had this Work been handed R1, lacking authority to revise the architecture would mean stopping and naming the Owner, not continuing.

F3. Position: does not stand. retract-unknown-id-throws.claimed.mjs exits 1: retract of an unknown id returns false, which is what R3 says. Rejected with this reasoning; nothing changes.
T

say "6. Round 02: the Reviewer examines the Code as it now stands against its standard, and says whether each earlier finding stands"
cat > "$OUT/r02.reviewer" <<T
This round was written by the trial script standing in for a Reviewer. It holds no seat under any Owner's authority and shows no independence.
Subject: the Code, ledger.mjs $L2. Standard: architecture.md ($ARCH). Expectation: does the Code realize the architecture it was handed. That is the whole of this round, a limited architecture-conformity review; it does not say the Code satisfies the Requirements.
Earlier findings: F1 does not stand any more, append-rejects-nonobject.mjs passes on the Code named here. F3 does not stand, the claim is false. F2 stands: ids-unique.red.mjs ($REDID) fails, so R1 ($REQ) is not satisfied by this Code. The Code follows the architecture's id rule; the cause is the architecture's own rule, so R1 stays unmet upstream and is not part of what this round asks the Worker to change. Continuing is legitimate only because scope.md did not hand this Work R1; this round does not decide that and does not decide what becomes of F2.
T
$REVIEW write "$OUT/review/02.md" --of Code --identity "$L2" --outcome converged --reviewer @"$OUT/r02.reviewer"
$REVIEW converged "$OUT/review" "$L2"; echo "(converged on v2: exit $?)"
$REVIEW converged "$OUT/review" "$L1"; echo "(converged on v1: exit $? , expected 1)"

say "7. Preservation: the confirmed Defect, its red test and the code it was found against, beside the agreed architecture and not in it"
D="$OUT/defects/01"; cp "$S/ids-unique.red.mjs" "$D/ids-unique.red.mjs"; cp "$S/ledger.mjs" "$D/ledger.mjs"
(cd "$D" && node ids-unique.red.mjs 2>&1 | grep AssertionError) > "$D/observed.txt"
LDID=$(sha "$D/ledger.mjs"); ARCHF=$(sha "$S/architecture.md")
cat > "$D/defect.md" <<T
# Defect

Claim: ids are not unique over the life of a ledger (append, append, retract the first, append gives two entries one id).
Affected: architecture.md $ARCH ; ledger.mjs $LDID (kept beside this file, because the red test imports it)
Violated: requirements.md $REQ, R1
Red test: ids-unique.red.mjs $REDID
Reproduction: in this directory, node ids-unique.red.mjs . It must exit 1 and print an AssertionError whose message is: R1 violated: ids [2,2] . Any other failure (for example ERR_MODULE_NOT_FOUND) is not this Defect. Before running, check that ledger.mjs here has the identity above and that the red test has the identity above.
Observed: observed.txt
Validity: the Worker's position in dispositions.md (F2) and the round that said it stands, review/02.md ; the finding as first made is in review/01.md
Disposition: later
Reason: correcting it means revising architecture.md, outside the authorized scope of this Work (scope.md)
Established result: architecture.md $ARCH is unchanged
T
echo "architecture.md still $(sha "$S/architecture.md")  (recorded $ARCH)"; [ "$(sha "$S/architecture.md")" = "$ARCH" ] && echo "unchanged: yes"
echo "defects/01 identity (named, domain defect): $($ID --named --domain defect "$D")"
echo "-- red test preserved byte for byte:"; cmp "$S/ids-unique.red.mjs" "$D/ids-unique.red.mjs" && echo "identical"
echo "-- run directly from the preserved directory:"; (cd "$D" && node ids-unique.red.mjs 2>&1 | grep AssertionError; echo "(exit ${PIPESTATUS[0]})")

say "8. Could an Incident carrier hold this Defect? (kaal-incident: addressed to KAAL, two parts)"
mkdir -p "$OUT/kaal-dir/changes" "$OUT/kaal-dir/core" "$OUT/kaal-dir/seals"
run $INCIDENT write "$OUT/kaal-dir" --date 2026-10-09 --happened "A ledger built to the agreed architecture gave two entries one id after a retract." --expected "Ids stay unique for the life of the ledger (R1)." 2>&1 | sed 's/^/   /'
echo "   (the carrier has no place for the red test, the affected identities or a validity judgment; and kaal-incident says it is not for the client's own defects)"
rm -rf "$OUT/kaal-dir"

say "9. A later reader, knowing only the retained Work convention, finds the Defect, resolves what it cites by identity, and reproduces it"
echo "-- lookup: every defect.md under the retained Work whose Disposition is later"
FOUND=$(grep -rl --include=defect.md '^Disposition: later' "$OUT" 2>/dev/null)
echo "$FOUND" | sed "s#$OUT/##"
for F in $FOUND; do
  DIR=$(dirname "$F")
  echo "-- cites (from $(basename "$F")):"
  CITED=$(grep -Eo '[0-9a-f]{64}' "$F" | sort -u)
  for H in $CITED; do
    WHERE=$(for C in "$HERE/subject"/* "$OUT"/*.md "$OUT"/review/*.md "$DIR"/*; do [ -f "$C" ] && [ "$(sha "$C")" = "$H" ] && echo "$C"; done | head -1)
    [ -n "$WHERE" ] && echo "   ${H:0:12}  resolves to ${WHERE#$HERE/}" | sed "s#$OUT/#out/#" || echo "   ${H:0:12}  not a file of the retained Work"
  done
  echo "-- the disposition and the original round it points at:"; grep -E '^(Validity|Disposition|Reason):' "$F" | sed 's/^/   /'; ls "$OUT/review" | sed 's/^/   review\//'
  echo "-- is the architecture it was found against still the one in force?"; grep -q "$(sha "$HERE/subject/architecture.md")" "$F" && echo "   yes: identity $(sha "$HERE/subject/architecture.md" | cut -c1-12) is the one recorded"
  echo "-- reproduce it by the recorded recipe:"; (cd "$DIR" && node ids-unique.red.mjs 2>&1 | grep -F "R1 violated: ids [2,2]"; echo "   (exit ${PIPESTATUS[0]})")
done
echo "   (this lookup is plain reading of a convention; it is the limit named in the architecture, not a registry)"

say "10. Cleanup of scratch (the preserved record is review/, dispositions.md, defects/)"
rm -f "$OUT"/r0*.reviewer "$OUT"/r0*.findings; rm -rf "$OUT/live"
find "$OUT" -type f | sort | sed "s#$OUT/#  #"
