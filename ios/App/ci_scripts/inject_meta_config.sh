#!/bin/zsh
#
# Skriver Metas app-id og client token ind i buildet.
#
# Hvorfor det her script findes
# -----------------------------
# De to værdier må ikke stå i repoet. De kommer fra miljøvariablerne
# FACEBOOK_APP_ID og FACEBOOK_CLIENT_TOKEN, som i Xcode Cloud sættes under
# workflowets «Environment Variables» (sæt client token som hemmelig).
#
# Info.plist indeholder $(FACEBOOK_APP_ID) og $(FACEBOOK_CLIENT_TOKEN). Xcode
# erstatter den slags med build-indstillinger, når appen pakkes. Derfor skal de
# to værdier være build-indstillinger — og scriptet skriver dem ind i den
# xcconfig-fil, CocoaPods laver til App-targetet. Netop den fil er allerede
# targetets «base configuration», og den ligger i App/Pods, som er i
# .gitignore. Så ryger værdierne hverken i git eller i project.pbxproj.
#
# URL-skemaet fb<APP-ID> i Info.plist får sin værdi på samme måde. Det er også
# derfor app-id'et SKAL være en build-indstilling og ikke bare noget, Swift
# læser ved opstart: styresystemet registrerer URL-skemaer ud fra Info.plist,
# længe før vores kode kører.
#
# Køres af ci_post_clone.sh efter `pod install`. Lokalt kan det køres i hånden
# på samme måde:
#
#   export FACEBOOK_APP_ID=...
#   export FACEBOOK_CLIENT_TOKEN=...
#   ios/App/ci_scripts/inject_meta_config.sh
#
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -z "$FACEBOOK_APP_ID" ] || [ -z "$FACEBOOK_CLIENT_TOKEN" ]; then
  echo "FEJL: FACEBOOK_APP_ID og FACEBOOK_CLIENT_TOKEN skal være sat." >&2
  echo "      Uden dem kan Meta-SDK'et ikke måle noget, og buildet stoppes" >&2
  echo "      her frem for at ende i App Store uden måling." >&2
  exit 1
fi

# App-id'et er et tal. Tjekket fanger den klassiske forbytning, hvor app-id og
# client token er byttet om i Xcode Cloud.
case "$FACEBOOK_APP_ID" in
  ''|*[!0-9]*)
    echo "FEJL: FACEBOOK_APP_ID skal kun bestå af cifre. Er app-id og client token byttet om?" >&2
    exit 1
    ;;
esac

written=0

for config in debug release; do
  xcconfig="$APP_DIR/Pods/Target Support Files/Pods-App/Pods-App.$config.xcconfig"
  [ -f "$xcconfig" ] || continue

  # Fjern en tidligere injektion, så scriptet kan køres igen uden at samle
  # dubletter op.
  tmp="$xcconfig.cns.tmp"
  grep -v -e '^FACEBOOK_APP_ID ' -e '^FACEBOOK_CLIENT_TOKEN ' "$xcconfig" > "$tmp" || true
  if [ ! -s "$tmp" ]; then
    echo "FEJL: $xcconfig blev tom. Afbryder uden at ændre noget." >&2
    rm -f "$tmp"
    exit 1
  fi
  mv "$tmp" "$xcconfig"

  printf '\nFACEBOOK_APP_ID = %s\nFACEBOOK_CLIENT_TOKEN = %s\n' \
    "$FACEBOOK_APP_ID" "$FACEBOOK_CLIENT_TOKEN" >> "$xcconfig"

  written=$((written + 1))
  echo "Meta-konfiguration skrevet til Pods-App.$config.xcconfig"
done

if [ "$written" -eq 0 ]; then
  echo "FEJL: fandt ingen Pods-App xcconfig i $APP_DIR/Pods. Kør 'pod install' først." >&2
  exit 1
fi
