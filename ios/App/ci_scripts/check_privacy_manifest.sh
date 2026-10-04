#!/bin/zsh
#
# Tjekker appens privacy-manifest, FØR der bygges.
#
# Hvorfor det her script findes
# -----------------------------
# Apple læser PrivacyInfo.xcprivacy, når buildet er uploadet — altså først
# efter en hel runde med build, upload og behandling. Er der en fejl, kommer
# der en afvisning som ITMS-91064 timer senere, og hele runden skal gøres om.
#
# Reglerne herunder kan afgøres på et sekund, før buildet går i gang.
#
# Køres af ci_post_clone.sh.
#
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MANIFEST="$(cd "$SCRIPT_DIR/../App" && pwd)/PrivacyInfo.xcprivacy"

if [ ! -f "$MANIFEST" ]; then
  echo "FEJL: $MANIFEST findes ikke." >&2
  exit 1
fi

/usr/bin/python3 - "$MANIFEST" <<'PY'
import plistlib
import sys

path = sys.argv[1]
problems = []

try:
    with open(path, 'rb') as f:
        manifest = plistlib.load(f)
except Exception as e:
    print("FEJL: kan ikke læse privacy-manifestet: %s" % e, file=sys.stderr)
    raise SystemExit(1)

tracking = manifest.get('NSPrivacyTracking')
domains = manifest.get('NSPrivacyTrackingDomains')

# ITMS-91064. Reglen går begge veje, og vi er allerede faldet i den ene:
# NSPrivacyTracking true med en tom domæneliste bliver afvist.
if tracking is not None and not isinstance(tracking, bool):
    problems.append(
        "NSPrivacyTracking er %r og ikke en rigtig boolean. Den skal være "
        "<true/> eller <false/> — ikke teksten \"true\"." % (tracking,)
    )

if domains is not None and not isinstance(domains, list):
    problems.append("NSPrivacyTrackingDomains skal være et array.")
    domains = []
domains = domains or []

if tracking is True and len(domains) == 0:
    problems.append(
        "NSPrivacyTracking er true, men NSPrivacyTrackingDomains er tom. "
        "Apple afviser det med ITMS-91064. Angiv mindst ét domæne — for Meta "
        "er det ep1.facebook.com, som er dét, deres eget SDK angiver."
    )

if tracking is not True and len(domains) > 0:
    problems.append(
        "NSPrivacyTrackingDomains har indhold, men NSPrivacyTracking er ikke "
        "true. Apple afviser det med ITMS-91064."
    )

# graph.facebook.com må ikke stå på listen: iOS blokerer alle kald til
# domæner på listen, når brugeren har sagt nej til sporing, og så forsvinder
# også de anonyme hændelser, vi stadig må sende.
if 'graph.facebook.com' in domains:
    problems.append(
        "graph.facebook.com står i NSPrivacyTrackingDomains. Det slukker "
        "målingen helt for alle, der siger nej til sporing. Brug kun "
        "ep1.facebook.com."
    )

# De to lister skal findes, ellers er manifestet ikke det, vi tror.
for key in ('NSPrivacyCollectedDataTypes', 'NSPrivacyAccessedAPITypes'):
    if not isinstance(manifest.get(key), list):
        problems.append("%s mangler eller er ikke et array." % key)

if problems:
    print("FEJL i %s:" % path, file=sys.stderr)
    for p in problems:
        print("  - %s" % p, file=sys.stderr)
    raise SystemExit(1)

print("Privacy-manifestet er i orden: NSPrivacyTracking=%s, %d sporingsdomæne(r), "
      "%d datatype(r), %d API-kategori(er)." % (
          tracking,
          len(domains),
          len(manifest.get('NSPrivacyCollectedDataTypes', [])),
          len(manifest.get('NSPrivacyAccessedAPITypes', [])),
      ))
PY
