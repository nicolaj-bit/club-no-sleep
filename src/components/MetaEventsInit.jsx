import { useEffect } from 'react';
import { exposeMetaEventsOnWindow, logMetaFirstOpen } from '@/lib/metaEvents';

/**
 * Starter broen til Metas SDK, når appen loader.
 *
 * Gør to ting og ikke mere:
 *   1. lægger broen på window.MetaEvents, så en vilkårlig side i Base44 kan
 *      sende en hændelse uden at importere noget,
 *   2. sender «app åbnet første gang» én gang pr. installation.
 *
 * Her bliver der bevidst IKKE spurgt om sporingstilladelse. Dialogen hører
 * efter onboarding, ikke på splash-skærmen — se NotificationPrompt.
 *
 * Monteres i App.jsx ved siden af SleepNotificationManager og viser ingenting.
 */
export default function MetaEventsInit() {
  useEffect(() => {
    exposeMetaEventsOnWindow();
    logMetaFirstOpen();
  }, []);

  return null;
}
