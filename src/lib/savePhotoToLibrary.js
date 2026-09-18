import { registerPlugin, Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// @capacitor-community/media. Hentes med registerPlugin frem for et import af
// pakken, så web-bundlen ikke behøver kende den — præcis som sleepLiveActivity.
const Media = registerPlugin('Media');

const ALBUM_NAME = 'Club No Sleep';

// Plugin'et afviser med denne kode, når brugeren siger nej til adgang.
const ACCESS_DENIED = 'accessDenied';

/**
 * Hvor brugeren kan give lov igen, hvis hun har sagt nej.
 * Teksten skal kunne læses af en, der ikke ved, hvad en tilladelse er.
 */
function whereToAllow() {
  if (Capacitor.getPlatform() === 'ios') {
    return 'Du kan give lov under Indstillinger → Club No Sleep → Fotos → Tilføj billeder.';
  }
  return 'Du kan give lov under Indstillinger → Apps → Club No Sleep → Tilladelser.';
}

/**
 * Finder albummet på Android og laver det, hvis det ikke findes.
 *
 * På Android er albummet en mappe, og `albumIdentifier` er dens fulde sti.
 * `getAlbumsPath()` giver mappen, albummer ligger i, så stien kan bygges
 * direkte. Det er mere pålideligt end at lede efter albummet med `getAlbums()`,
 * for et tomt, nyoprettet album har ingen billeder og dukker derfor ikke op dér.
 *
 * `createAlbum` afviser med «Album already exists», hvis mappen er der i
 * forvejen. Det er ikke en fejl for os — anden og senere gang er det det
 * forventede svar.
 */
async function ensureAndroidAlbum() {
  const { path } = await Media.getAlbumsPath();
  const identifier = `${path}/${ALBUM_NAME}`;

  try {
    await Media.createAlbum({ name: ALBUM_NAME });
  } catch (e) {
    // Findes allerede, eller kunne ikke laves. Forsøg at gemme alligevel —
    // savePhoto fortæller os det, hvis mappen virkelig mangler.
    console.log('[FOTO] album findes formentlig i forvejen:', e?.message || e);
  }

  return identifier;
}

/**
 * Gemmer et milepælsbillede i telefonens egne billeder.
 *
 * `image` må være en data-URL (`data:image/jpeg;base64,...`), en http(s)-adresse
 * eller en lokal filsti. Milepælskameraet laver et canvas, så det bliver
 * typisk en data-URL fra `toDataURL()`.
 *
 * Returnerer true, hvis billedet blev gemt. Fejler stille på web og i
 * app-udgaver, der er ældre end plugin'et — dér sker der ingenting, og
 * brugeren får ingen fejl at se.
 *
 * Bemærk forskellen mellem platformene:
 *
 * - **Android** lægger billedet i et album ved navn «Club No Sleep». Det kræver
 *   ingen tilladelse: billedet skrives gennem MediaStore i appens egen
 *   mediemappe og indekseres, så det dukker op i galleriet.
 * - **iOS** lægger billedet i kamerarullen uden album. Et navngivet album kræver
 *   fuld adgang til fotobiblioteket (`.readWrite`), og det vil vi ikke bede om —
 *   vi beder kun om lov til at *tilføje* billeder (`.addOnly`). Billedet er at
 *   finde under «Seneste» og «Senest gemte».
 */
export async function saveMilestonePhotoToLibrary(image, options = {}) {
  if (!Capacitor.isNativePlatform()) return false;
  if (!image) return false;

  try {
    const saveOptions = { path: image };

    if (Capacitor.getPlatform() === 'android') {
      // albumIdentifier er påkrævet på Android.
      saveOptions.albumIdentifier = await ensureAndroidAlbum();
      if (options.fileName) saveOptions.fileName = options.fileName;
    }

    await Media.savePhoto(saveOptions);

    console.log('[FOTO] milepælsbillede gemt');
    toast.success('Billedet er gemt i dine billeder');
    return true;
  } catch (e) {
    const code = e?.code;
    const message = e?.message || '';

    if (code === ACCESS_DENIED) {
      // Appen må ikke bare gøre ingenting, når brugeren har sagt nej.
      toast.error(`Billedet blev ikke gemt. ${whereToAllow()}`);
      return false;
    }

    // Plugin'et er ikke med i den installerede native build. Det sker for alle,
    // der endnu ikke har opdateret fra butikken, og er ikke noget, brugeren kan
    // gøre ved — så her fejler vi stille.
    if (code === 'UNIMPLEMENTED' || /not implemented/i.test(message)) {
      console.log('[FOTO] plugin ikke tilgængeligt i denne app-udgave');
      return false;
    }

    // Noget andet gik galt. Sig det kort frem for at lade knappen se død ud.
    console.error('[FOTO] kunne ikke gemme billedet:', message || e);
    toast.error('Billedet kunne ikke gemmes. Prøv igen.');
    return false;
  }
}
