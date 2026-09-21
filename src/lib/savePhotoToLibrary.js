import { toast } from 'sonner';

const ALBUM_NAME = 'Club No Sleep';
const ACCESS_MESSAGE = 'Vi har ikke adgang til dine billeder. Du kan give adgang under Indstillinger.';
const SAVED_MESSAGE = 'Gemt i dine billeder';

function getMediaPlugin() {
  return window.Capacitor?.Plugins?.Media || null;
}

/**
 * Finder albummet "Club No Sleep" på Android, eller opretter det hvis det
 * ikke findes endnu. Returnerer albummets identifier til brug i savePhoto.
 */
async function getAndroidAlbumIdentifier(Media) {
  try {
    const { albums } = await Media.getAlbums();
    const existing = albums?.find((a) => a.name === ALBUM_NAME);
    if (existing) return existing.identifier;
  } catch (e) {
    // fortsæt til oprettelse
  }

  try {
    await Media.createAlbum({ name: ALBUM_NAME });
  } catch (e) {
    // findes muligvis allerede — slår op igen nedenfor uanset
  }

  try {
    const { albums } = await Media.getAlbums();
    return albums?.find((a) => a.name === ALBUM_NAME)?.identifier;
  } catch (e) {
    return undefined;
  }
}

/**
 * Web/browser-fald tilbage, og fald tilbage for gamle app-udgaver uden pluginet:
 * del billedet native hvis muligt, ellers download det som fil.
 */
async function saveViaShareOrDownload(dataUrl, fileName) {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
      return true;
    }
  } catch (e) {
    if (e?.name === 'AbortError') return false;
    console.error('[FOTO] deling fejlede, forsøger download:', e?.message || e);
  }

  try {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    a.click();
    toast.success(SAVED_MESSAGE, { duration: 2000 });
    return true;
  } catch (e) {
    console.error('[FOTO] download fejlede:', e?.message || e);
    toast.error(ACCESS_MESSAGE);
    return false;
  }
}

/**
 * Gemmer et milepælsbillede direkte i telefonens fotoalbum via
 * @capacitor-community/media. Falder tilbage til del/download, hvis pluginet
 * ikke er tilgængeligt (web, eller en ældre app-udgave).
 *
 * `dataUrl` skal være en JPEG data-URL (fra canvas.toDataURL).
 */
export async function saveMilestonePhotoToLibrary(dataUrl, options = {}) {
  const fileName = options.fileName || `club-no-sleep-milepael-${new Date().toISOString().slice(0, 10)}.jpg`;
  const Media = getMediaPlugin();

  if (!Media) {
    return saveViaShareOrDownload(dataUrl, fileName);
  }

  try {
    const saveOptions = { path: dataUrl };
    if (window.Capacitor?.getPlatform?.() === 'android') {
      const albumIdentifier = await getAndroidAlbumIdentifier(Media);
      if (albumIdentifier) saveOptions.albumIdentifier = albumIdentifier;
    }
    await Media.savePhoto(saveOptions);
    toast.success(SAVED_MESSAGE, { duration: 2000 });
    return true;
  } catch (e) {
    console.error('[FOTO] kunne ikke gemme billedet:', e?.message || e);
    toast.error(ACCESS_MESSAGE);
    return false;
  }
}