// ============================================================================
// Appen bruger den scene-baserede opstartsmodel på iOS (UIApplicationSceneManifest
// i Info.plist). Så kalder iOS IKKE længere disse metoder på app-delegaten:
//
//   applicationDidBecomeActive, applicationDidEnterBackground,
//   applicationWillResignActive, applicationWillEnterForeground
//
// Står der arbejde i dem, ser det fuldstændig rigtigt ud og kører aldrig. Det
// skete én gang: webview-rydningen og genopsætningen af låseskærmens knapper
// blev liggende i AppDelegate, da scenen blev indført, og holdt lydløst op med
// at virke.
//
// Dette tjek fejler, hvis de dukker op igen, eller hvis scenens modstykker
// forsvinder. Køres af .github/workflows/checks.yml.
// ============================================================================
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const infoPlist = read('ios/App/App/Info.plist');
const appDelegate = read('ios/App/App/AppDelegate.swift');
const sceneDelegate = read('ios/App/App/SceneDelegate.swift');

const problems = [];

if (!infoPlist.includes('UIApplicationSceneManifest')) {
  console.log('Info.plist har ingen UIApplicationSceneManifest — tjekket springes over.');
  process.exit(0);
}

// Kommentarer tæller ikke med: AppDelegate.swift forklarer netop, hvorfor
// metoderne er væk, og den forklaring skal kunne nævne deres navne.
const withoutComments = appDelegate
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trim().startsWith('//'))
  .join('\n');

for (const name of [
  'applicationDidBecomeActive',
  'applicationDidEnterBackground',
  'applicationWillResignActive',
  'applicationWillEnterForeground',
]) {
  if (withoutComments.includes(`func ${name}(`)) {
    problems.push(
      `AppDelegate.swift har func ${name}. iOS kalder den ikke, når appen bruger ` +
      `den scene-baserede opstartsmodel. Flyt arbejdet til SceneDelegate.swift.`
    );
  }
}

for (const [sceneName, why] of [
  ['sceneDidBecomeActive', 'genopsætter låseskærmens notifikations-kategorier og sender køen af sted'],
  ['sceneDidEnterBackground', 'rydder webviewets cache, så appen ikke viser en gammel udgave af siden'],
]) {
  if (!sceneDelegate.includes(`func ${sceneName}(`)) {
    problems.push(`SceneDelegate.swift mangler func ${sceneName} — den ${why}.`);
  }
}

if (problems.length > 0) {
  console.error('FEJL i iOS-opstartsmodellen:\n');
  for (const p of problems) console.error('  - ' + p + '\n');
  process.exit(1);
}

console.log('iOS-opstartsmodellen er konsekvent: app-delegaten har ingen scene-erstattede metoder, og scenen har begge sine.');
